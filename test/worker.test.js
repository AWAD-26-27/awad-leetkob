import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { checkerFixture, workerDatabase } from './fixtures/worker-db.js';

let dockerAvailable = false;
try {
  execFileSync('docker', ['info'], { stdio: 'ignore' });
  dockerAvailable = true;
} catch {
  dockerAvailable = false;
}

const script = fileURLToPath(new URL('../src/worker.js', import.meta.url));

async function until(predicate, failure) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await wait(50);
  }
  assert.fail(failure());
}

function startWorker(path) {
  const child = spawn(process.execPath, [script], {
    env: {
      ...process.env,
      DB_PATH: path,
      GEMINI_API_KEY: '',
      GEMINI_MODEL: '',
      MODEL_OFF: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = once(child, 'exit');
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => (stdout += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
  return {
    ready: () =>
      until(
        () => stdout.includes('PA3 worker ready'),
        () => stderr,
      ),
    async stop() {
      child.kill('SIGTERM');
      const [code, signal] = await exited;
      assert.ok(code === 0 || signal === 'SIGTERM', stderr || `worker ended with signal ${signal}`);
    },
  };
}

test(
  'stopped worker recovers queued and expired jobs exactly once through Docker and checker',
  { skip: !dockerAvailable && 'Docker daemon is not running' },
  async (t) => {
    const { db, path, enqueue, verdicts } = workerDatabase(t);
    const first = startWorker(path);
    try {
      await first.ready();
    } finally {
      await first.stop();
    }

    const queued = enqueue();
    const expired = enqueue();
    const state = db.prepare('SELECT status, judge_verdict FROM submissions WHERE id = ?');
    assert.deepEqual({ ...state.get(queued) }, { status: 'queued', judge_verdict: null });
    assert.deepEqual(verdicts(queued), []);
    db.prepare("UPDATE submissions SET status = 'judging' WHERE id = ?").run(expired);
    db.prepare(
      `
    UPDATE jobs SET status = 'processing', attempts = 1, locked_at = '2000-01-01T00:00:00Z'
    WHERE submission_id = ?
  `,
    ).run(expired);

    const second = startWorker(path);
    try {
      await second.ready();
      await until(
        () => state.get(expired).status === 'judged',
        () => 'Timed out waiting for judging',
      );
      const job = db.prepare('SELECT status, attempts FROM jobs WHERE submission_id = ?');
      for (const [id, attempts] of [
        [queued, 1],
        [expired, 2],
      ]) {
        assert.deepEqual({ ...state.get(id) }, { status: 'judged', judge_verdict: 'Accepted' });
        assert.deepEqual({ ...job.get(id) }, { status: 'done', attempts });
        assert.deepEqual(verdicts(id), checkerFixture.expected.verdicts);
      }
      assert.equal(db.prepare('SELECT count(*) AS count FROM llm_call_logs').get().count, 0);
    } finally {
      await second.stop();
    }
  },
);
