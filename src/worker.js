import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { clearInterval, setInterval } from 'node:timers';
import { setTimeout as wait } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { evaluateSubmission } from './checker/index.js';
import { runSandbox } from './sandbox.js';

const LEASE_MS = 60_000;
const POLL_MS = 300;
const MAX_ATTEMPTS = 3;
const isoTime = (ms) => new Date(ms).toISOString();

function transaction(db, run) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = run();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function openQueueDatabase(path = process.env.DB_PATH || './data/leetkob.db') {
  if (!existsSync(path)) throw new Error('Initialize the PA3 database before starting the worker');
  const db = new DatabaseSync(path);
  try {
    db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function createWorker({
  db,
  judge = runSandbox,
  check = evaluateSubmission,
  now = Date.now,
  modelOff = process.env.MODEL_OFF === '1',
  maxModelCalls = Number(process.env.MAX_MODEL_CALLS_PER_LAB),
}) {
  const query = {
    available: db.prepare(`
      SELECT j.id AS jobId, j.attempts, s.id AS submissionId, s.lab_id AS labId,
             s.source_code AS code, l.statement_md AS statement
      FROM jobs j
      JOIN submissions s ON s.id = j.submission_id
      JOIN labs l ON l.id = s.lab_id
      WHERE j.status = 'queued'
         OR (j.status = 'processing'
             AND (j.locked_at IS NULL OR julianday(j.locked_at) <= julianday(?)))
      ORDER BY j.id
      LIMIT 1
    `),
    claim: db.prepare(`
      UPDATE jobs
      SET status = 'processing', attempts = attempts + 1, locked_at = ?, error = NULL
      WHERE id = ?
    `),
    processing: db.prepare(`UPDATE submissions SET status = 'judging' WHERE id = ?`),
    own: db.prepare(`
      SELECT 1 FROM jobs WHERE id = ? AND status = 'processing' AND attempts = ?
      AND julianday(locked_at) > julianday(?)
    `),
    renew: db.prepare(`
      UPDATE jobs SET locked_at = ?
      WHERE id = ? AND status = 'processing' AND attempts = ?
      AND julianday(locked_at) > julianday(?)
    `),
    tests: db.prepare(`
      SELECT input_text AS input, expected_output AS expectedOutput
      FROM test_cases WHERE lab_id = ? ORDER BY ordinal
    `),
    constraints: db.prepare(`
      SELECT id, code, text FROM constraints WHERE lab_id = ? ORDER BY id
    `),
    reserve: db.prepare(`
      UPDATE labs SET model_calls_reserved = model_calls_reserved + 1
      WHERE id = ? AND model_calls_reserved < ?
    `),
    verdict: db.prepare(`
      INSERT INTO constraint_verdicts
        (submission_id, constraint_id, verdict, evidence_json, source, review_status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      ON CONFLICT(submission_id, constraint_id) DO NOTHING
    `),
    callLog: db.prepare(`
      INSERT INTO llm_call_logs
        (submission_id, constraint_id, attempt, provider_request_id, model, status,
         prompt_tokens, completion_tokens, latency_ms, cost_usd, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    judged: db.prepare(`
      UPDATE submissions SET status = 'judged', judge_verdict = ?, judge_detail = ?, judged_at = ?
      WHERE id = ?
    `),
    queued: db.prepare(`UPDATE submissions SET status = 'queued' WHERE id = ?`),
    done: db.prepare(`
      UPDATE jobs SET status = 'done', locked_at = NULL, finished_at = ?, error = NULL WHERE id = ?
    `),
    fail: db.prepare(`
      UPDATE jobs SET status = 'failed', locked_at = NULL, finished_at = ?, error = ? WHERE id = ?
    `),
    retry: db.prepare(`
      UPDATE jobs SET status = 'queued', locked_at = NULL, error = ? WHERE id = ?
    `),
  };
  const cutoff = (time) => isoTime(time - LEASE_MS);
  const owns = (job) => Boolean(query.own.get(job.jobId, job.attempts, cutoff(now())));

  function failPermanently(job, timestamp) {
    query.fail.run(timestamp, 'judging-failed', job.jobId);
    query.judged.run('SystemError', null, timestamp, job.submissionId);
  }

  function claim() {
    return transaction(db, () => {
      const time = now();
      const job = query.available.get(cutoff(time));
      if (!job) return null;

      if (job.attempts >= MAX_ATTEMPTS) {
        failPermanently(job, isoTime(time));
        return { expired: true };
      }
      query.claim.run(isoTime(time), job.jobId);
      query.processing.run(job.submissionId);
      job.attempts += 1;
      return job;
    });
  }

  function reserveModelCall(job) {
    if (!Number.isSafeInteger(maxModelCalls) || maxModelCalls <= 0) return false;
    return transaction(
      db,
      () => owns(job) && query.reserve.run(job.labId, maxModelCalls).changes === 1,
    );
  }

  function finish(job, judgment, constraintIds, evaluation) {
    transaction(db, () => {
      if (!owns(job)) return;
      const timestamp = isoTime(now());
      const { verdicts, callLogs } = evaluation;
      const seen = new Set(verdicts.map(({ constraint }) => constraint));
      if (seen.size !== constraintIds.size || verdicts.length !== constraintIds.size) {
        throw new Error('Checker returned an incomplete or duplicate verdict set');
      }
      for (const verdict of verdicts) {
        const id = constraintIds.get(verdict.constraint);
        if (id == null) throw new Error('Checker returned an unknown constraint code');
        query.verdict.run(
          job.submissionId,
          id,
          verdict.verdict,
          JSON.stringify(verdict.evidence),
          verdict.source,
        );
      }
      for (const log of callLogs) {
        const id = constraintIds.get(log.constraint);
        if (id == null) throw new Error('Checker logged an unknown constraint code');
        query.callLog.run(
          job.submissionId,
          id,
          job.attempts,
          log.providerRequestId ?? null,
          log.model ?? null,
          log.status,
          log.promptTokens ?? null,
          log.completionTokens ?? null,
          log.latencyMs ?? null,
          log.costUsd ?? null,
          timestamp,
        );
      }
      const { verdict, testIndex, limit } = judgment;
      const detail = testIndex == null ? null : JSON.stringify({ testIndex, limit });
      query.judged.run(verdict, detail, timestamp, job.submissionId);
      query.done.run(timestamp, job.jobId);
    });
  }

  async function runOnce() {
    const job = claim();
    if (!job) return false;
    if (job.expired) return true;

    const heartbeat = setInterval(() => {
      const time = now();
      try {
        query.renew.run(isoTime(time), job.jobId, job.attempts, cutoff(time));
      } catch {
        // The next renewal can retry. Completion and quota reservations still check the lease.
      }
    }, LEASE_MS / 4);
    try {
      const judgment = await judge({ code: job.code, testCases: query.tests.all(job.labId) });
      if (!owns(job)) return true;
      const constraints = judgment.verdict === 'Accepted' ? query.constraints.all(job.labId) : [];
      const constraintIds = new Map(constraints.map(({ id, code }) => [code, id]));
      const evaluation =
        judgment.verdict === 'Accepted'
          ? await check({
              statement: job.statement,
              code: job.code,
              constraints: constraints.map(({ code, text }) => ({ id: code, text })),
              options: { modelOff, reserveModelCall: () => reserveModelCall(job) },
            })
          : { verdicts: [], callLogs: [] };
      finish(job, judgment, constraintIds, evaluation);
    } catch {
      transaction(db, () => {
        if (!owns(job)) return;
        if (job.attempts >= MAX_ATTEMPTS) {
          failPermanently(job, isoTime(now()));
        } else {
          query.retry.run('judging-failed', job.jobId);
          query.queued.run(job.submissionId);
        }
      });
    } finally {
      clearInterval(heartbeat);
    }
    return true;
  }

  return { runOnce };
}

async function main() {
  const db = openQueueDatabase();
  try {
    const worker = createWorker({ db });
    let stopping = false;
    const stop = () => {
      stopping = true;
    };
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
    console.log('PA3 worker ready');
    while (!stopping) {
      if (!(await worker.runOnce())) await wait(POLL_MS);
    }
  } finally {
    db.close();
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    await main();
  } catch (error) {
    console.error(`Worker stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
