import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
export const checkerFixture = JSON.parse(
  readFileSync(new URL('./pa3-checker-handoff.json', import.meta.url), 'utf8'),
);

export function workerDatabase(t) {
  const directory = mkdtempSync(join(tmpdir(), 'leetkob-worker-'));
  const path = join(directory, 'jobs.db');
  const db = new DatabaseSync(path);
  t.after(() => {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  });
  // This fixture mirrors the worker-facing PA3 schema while the API migration is pending.
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE labs (
      id INTEGER PRIMARY KEY, statement_md TEXT NOT NULL, model_calls_reserved INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE test_cases (
      lab_id INTEGER NOT NULL REFERENCES labs(id), ordinal INTEGER NOT NULL,
      input_text TEXT NOT NULL, expected_output TEXT NOT NULL, UNIQUE(lab_id, ordinal)
    );
    CREATE TABLE constraints (
      id INTEGER PRIMARY KEY, lab_id INTEGER NOT NULL REFERENCES labs(id), code TEXT NOT NULL,
      text TEXT NOT NULL, UNIQUE(lab_id, code)
    );
    CREATE TABLE submissions (
      id INTEGER PRIMARY KEY, lab_id INTEGER NOT NULL REFERENCES labs(id),
      source_code TEXT NOT NULL, status TEXT NOT NULL,
      judge_verdict TEXT, judge_detail TEXT, judged_at TEXT
    );
    CREATE TABLE jobs (
      id INTEGER PRIMARY KEY, submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id),
      status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, locked_at TEXT, finished_at TEXT, error TEXT
    );
    CREATE TABLE constraint_verdicts (
      submission_id INTEGER NOT NULL REFERENCES submissions(id),
      constraint_id INTEGER NOT NULL REFERENCES constraints(id), verdict TEXT NOT NULL,
      evidence_json TEXT NOT NULL, source TEXT NOT NULL, review_status TEXT NOT NULL,
      UNIQUE(submission_id, constraint_id)
    );
    CREATE TABLE llm_call_logs (
      submission_id INTEGER NOT NULL REFERENCES submissions(id), constraint_id INTEGER NOT NULL REFERENCES constraints(id),
      attempt INTEGER NOT NULL, provider_request_id TEXT, model TEXT, status TEXT NOT NULL,
      prompt_tokens INTEGER, completion_tokens INTEGER, latency_ms INTEGER, cost_usd REAL, created_at TEXT NOT NULL
    );
  `);
  db.prepare('INSERT INTO labs (id, statement_md) VALUES (1, ?)').run(
    checkerFixture.input.statement,
  );
  db.exec("INSERT INTO test_cases VALUES (1, 1, '', '');");
  const constraint = db.prepare('INSERT INTO constraints (lab_id, code, text) VALUES (1, ?, ?)');
  for (const { id, text } of checkerFixture.input.constraints) constraint.run(id, text);

  function enqueue(code = checkerFixture.input.code) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const { lastInsertRowid: id } = db
        .prepare("INSERT INTO submissions (lab_id, source_code, status) VALUES (1, ?, 'queued')")
        .run(code);
      db.prepare("INSERT INTO jobs (submission_id, status) VALUES (?, 'queued')").run(id);
      db.exec('COMMIT');
      return id;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  function verdicts(id) {
    return db
      .prepare(
        `
        SELECT c.code AS constraint_code, v.verdict, v.evidence_json, v.source
        FROM constraint_verdicts v JOIN constraints c ON c.id = v.constraint_id
        WHERE v.submission_id = ? ORDER BY c.id
      `,
      )
      .all(id)
      .map(({ constraint_code: constraint, verdict, evidence_json: evidence, source }) => ({
        constraint,
        verdict,
        evidence: JSON.parse(evidence),
        source,
      }));
  }

  return { db, path, enqueue, verdicts };
}
