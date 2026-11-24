import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWorker, openQueueDatabase } from '../../src/worker.js';
import { checkerFixture, workerDatabase } from '../fixtures/worker-db.js';

const accepted = async () => ({ verdict: 'Accepted' });

test('an expired attempt cannot commit over a restarted worker or replace a TA review', async (t) => {
  const { db, path, enqueue, verdicts } = workerDatabase(t);
  const id = enqueue();
  const second = openQueueDatabase(path);
  let time = Date.now();
  const started = Promise.withResolvers();
  const result = Promise.withResolvers();
  const old = createWorker({
    db,
    judge: accepted,
    now: () => time,
    maxModelCalls: 1,
    async check({ options }) {
      started.resolve(options);
      return result.promise;
    },
  });
  const pending = old.runOnce();
  try {
    const options = await started.promise;
    assert.equal(
      db.prepare('SELECT status FROM submissions WHERE id = ?').get(id).status,
      'judging',
    );
    time += 61_000;
    assert.equal(options.reserveModelCall({ constraintId: 'C2' }), false);
    const restarted = createWorker({
      db: second,
      judge: accepted,
      now: () => time,
      modelOff: true,
    });
    assert.equal(await restarted.runOnce(), true);
    db.exec("UPDATE constraint_verdicts SET review_status = 'confirmed' WHERE constraint_id = 1");
  } finally {
    result.resolve({
      verdicts: checkerFixture.expected.verdicts.map((verdict) => ({
        ...verdict,
        verdict: 'pass',
      })),
      callLogs: [],
    });
    await pending;
    try {
      second.close();
    } catch {
      // ignore if already closed
    }
  }

  assert.deepEqual(verdicts(id), checkerFixture.expected.verdicts);
  assert.equal(
    db.prepare('SELECT review_status FROM constraint_verdicts WHERE constraint_id = 1').get()
      .review_status,
    'confirmed',
  );
  const job = db.prepare('SELECT status, attempts FROM jobs WHERE submission_id = ?').get(id);
  assert.deepEqual({ ...job }, { status: 'done', attempts: 2 });
  assert.equal(await old.runOnce(), false);
});

test('a non-Accepted submission does not invoke the constraint checker', async (t) => {
  const { db, enqueue, verdicts } = workerDatabase(t);
  const id = enqueue();
  let calls = 0;
  const worker = createWorker({
    db,
    judge: async () => ({ verdict: 'WA', testIndex: 1 }),
    check: async () => {
      calls += 1;
    },
  });
  assert.equal(await worker.runOnce(), true);
  assert.equal(calls, 0);
  assert.deepEqual(verdicts(id), []);
  const outcome = db
    .prepare('SELECT judge_verdict, judge_detail FROM submissions WHERE id = ?')
    .get(id);
  assert.equal(outcome.judge_verdict, 'WA');
  assert.deepEqual(JSON.parse(outcome.judge_detail), { testIndex: 1 });
});

test('partial checker data rolls back and infrastructure failure stops after three attempts', async (t) => {
  const { db, enqueue, verdicts } = workerDatabase(t);
  const id = enqueue();
  const worker = createWorker({
    db,
    judge: accepted,
    check: async () => ({
      verdicts: [checkerFixture.expected.verdicts[0], { constraint: 'wrong-code' }],
      callLogs: [],
    }),
  });
  for (let i = 0; i < 3; i += 1) {
    assert.equal(await worker.runOnce(), true);
    assert.deepEqual(verdicts(id), []);
  }
  assert.equal(await worker.runOnce(), false);
  const job = db.prepare('SELECT status, attempts FROM jobs WHERE submission_id = ?').get(id);
  assert.deepEqual({ ...job }, { status: 'failed', attempts: 3 });
  const submission = db
    .prepare('SELECT status, judge_verdict FROM submissions WHERE id = ?')
    .get(id);
  assert.deepEqual({ ...submission }, { status: 'judged', judge_verdict: 'SystemError' });
});

test('model calls reserve the lab quota atomically and only persist operational metadata', async (t) => {
  const { db, enqueue, verdicts } = workerDatabase(t);
  const id = enqueue();
  const decisions = [];
  const worker = createWorker({
    db,
    judge: accepted,
    maxModelCalls: 1,
    check: async ({ options }) => {
      decisions.push(options.reserveModelCall({ constraintId: 'C2' }));
      decisions.push(options.reserveModelCall({ constraintId: 'C2' }));
      return {
        verdicts: checkerFixture.expected.verdicts,
        callLogs: [
          {
            constraint: 'C2',
            providerRequestId: 'synthetic-request',
            model: 'test-fixture',
            status: 'ok',
            prompt: 'synthetic prompt fixture',
          },
        ],
      };
    },
  });
  assert.equal(await worker.runOnce(), true);
  assert.deepEqual(decisions, [true, false]);
  assert.deepEqual(verdicts(id), checkerFixture.expected.verdicts);
  assert.equal(db.prepare('SELECT model_calls_reserved FROM labs').get().model_calls_reserved, 1);
  const logs = db.prepare('SELECT * FROM llm_call_logs').all();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].attempt, 1);
  assert.equal(logs[0].provider_request_id, 'synthetic-request');
  assert.ok(!JSON.stringify(logs).includes('synthetic prompt fixture'));
});
