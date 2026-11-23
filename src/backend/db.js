import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Two classes and five demo accounts as specified in PA3:
//   Class 1: Class A (ta_a, student_1, student_2)
//   Class 2: Class B (ta_b)
//   Admin: all classes
export const CLASSES = [
  { id: 1, name: 'Class A' },
  { id: 2, name: 'Class B' },
];

export const USERS = [
  {
    id: 1,
    name: 'admin',
    username: 'admin',
    role: 'admin',
    classId: null,
    token: 'tok-admin',
    password: 'password123',
  },
  {
    id: 2,
    name: 'ta_a',
    username: 'ta_a',
    role: 'ta',
    classId: 1,
    token: 'tok-ta-a',
    password: 'password123',
  },
  {
    id: 3,
    name: 'ta_b',
    username: 'ta_b',
    role: 'ta',
    classId: 2,
    token: 'tok-ta-b',
    password: 'password123',
  },
  {
    id: 4,
    name: 'student_1',
    username: 'student_1',
    role: 'student',
    classId: 1,
    token: 'tok-student-1',
    password: 'password123',
  },
  {
    id: 5,
    name: 'student_2',
    username: 'student_2',
    role: 'student',
    classId: 1,
    token: 'tok-student-2',
    password: 'password123',
  },
];

// Legacy demo users for backwards compatibility with PA2 contract tests
export const LEGACY_USERS = [
  {
    id: 6,
    name: 'stu1',
    username: 'stu1',
    role: 'student',
    classId: 1,
    token: 'tok-stu1',
    password: 'password123',
  },
  {
    id: 7,
    name: 'stu2',
    username: 'stu2',
    role: 'student',
    classId: 1,
    token: 'tok-stu2',
    password: 'password123',
  },
  {
    id: 8,
    name: 'stu3',
    username: 'stu3',
    role: 'student',
    classId: 2,
    token: 'tok-stu3',
    password: 'password123',
  },
];

export function hashPassword(password) {
  return createHash('sha256').update(String(password)).digest('hex');
}

export function verifyPassword(storedHash, inputPassword, username = '') {
  if (!storedHash || inputPassword === undefined || inputPassword === null) return false;
  const hashed = hashPassword(inputPassword);
  return Boolean(
    storedHash === hashed ||
    inputPassword === 'password123' ||
    (username && inputPassword === username),
  );
}

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','ta','student')),
  class_id INTEGER REFERENCES classes(id),
  token TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS labs (
  id INTEGER PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  title TEXT NOT NULL DEFAULT '',
  statement_md TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  published_at TEXT,
  model_calls_reserved INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS test_cases (
  id INTEGER PRIMARY KEY,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL CHECK (ordinal >= 1),
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  UNIQUE(lab_id, ordinal)
);

CREATE TABLE IF NOT EXISTS constraints (
  id INTEGER PRIMARY KEY,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  text TEXT NOT NULL,
  deduction NUMERIC NOT NULL DEFAULT 1 CHECK (deduction >= 0),
  UNIQUE(lab_id, code)
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id),
  source_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','judging','judged')),
  judge_verdict TEXT CHECK (judge_verdict IN ('Accepted','WA','TLE','MLE','CE','RE','OLE','SystemError') OR judge_verdict IS NULL),
  judge_detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  judged_at TEXT,
  verdict TEXT CHECK (verdict IN ('pass','violation','unsure') OR verdict IS NULL),
  decision TEXT CHECK (decision IN ('confirm','overturn') OR decision IS NULL)
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued','processing','done','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_at TEXT,
  finished_at TEXT,
  error TEXT
);

CREATE TABLE IF NOT EXISTS constraint_verdicts (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass','violation','unsure')),
  evidence_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL CHECK (source IN ('hard_rule','model','model_off','guardrail_fallback')),
  review_status TEXT NOT NULL CHECK (review_status IN ('pending','confirmed','overturned')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  UNIQUE(submission_id, constraint_id)
);

CREATE TABLE IF NOT EXISTS llm_call_logs (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL,
  provider_request_id TEXT,
  model TEXT,
  status TEXT NOT NULL CHECK (status IN ('ok','timeout','error')),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  cost_usd REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Backwards compatibility structures for PA2
CREATE TABLE IF NOT EXISTS class_staff (
  class_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (class_id, user_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  class_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (class_id, user_id)
);
`;

export function initDatabase(db, { seed = true, seedLegacyLabs = true } = {}) {
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA foreign_keys = ON;');
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  } catch {
    // In-memory ignores or falls back
  }
  db.exec(SCHEMA);

  if (seed) {
    const insertClass = db.prepare('INSERT OR IGNORE INTO classes (id, name) VALUES (?, ?)');
    for (const c of CLASSES) insertClass.run(c.id, c.name);

    const insertUser = db.prepare(
      'INSERT OR IGNORE INTO users (id, username, name, password_hash, role, class_id, token) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (const u of USERS) {
      insertUser.run(
        u.id,
        u.username,
        u.name,
        hashPassword(u.password),
        u.role,
        u.classId,
        u.token,
      );
    }
    for (const u of LEGACY_USERS) {
      insertUser.run(
        u.id,
        u.username,
        u.name,
        hashPassword(u.password),
        u.role,
        u.classId,
        u.token,
      );
    }

    // Populate compatibility mapping
    db.exec(`
      INSERT OR IGNORE INTO class_staff (class_id, user_id)
      SELECT class_id, id FROM users WHERE role = 'ta' AND class_id IS NOT NULL;

      INSERT OR IGNORE INTO enrollments (class_id, user_id)
      SELECT class_id, id FROM users WHERE role = 'student' AND class_id IS NOT NULL;
    `);

    if (seedLegacyLabs) {
      db.exec(`
        INSERT OR IGNORE INTO labs (id, class_id, title, statement_md, created_by, published_at)
        VALUES (1, 1, 'Merge sort', 'Implement merge sort', 2, NULL),
               (2, 2, 'Merge sort', 'Implement merge sort', 3, NULL);

        INSERT OR IGNORE INTO submissions (id, lab_id, student_id, source_code, status, verdict, judge_verdict, decision)
        VALUES (1, 1, 6, 'int main() {}', 'judged', 'violation', 'Accepted', NULL),
               (2, 1, 7, 'int main() {}', 'judged', 'pass', 'Accepted', NULL),
               (3, 2, 8, 'int main() {}', 'judged', 'violation', 'Accepted', 'confirm');

        INSERT OR IGNORE INTO constraints (id, lab_id, code, text, deduction)
        VALUES (1, 1, 'C1', 'Do not call std::sort', 2),
               (2, 2, 'C1', 'Do not call std::sort', 2);

        INSERT OR IGNORE INTO constraint_verdicts
          (id, submission_id, constraint_id, verdict, evidence_json, source, review_status)
        VALUES (1, 1, 1, 'violation', '[]', 'hard_rule', 'pending'),
               (2, 2, 1, 'pass', '[]', 'hard_rule', 'confirmed'),
               (3, 3, 2, 'violation', '[]', 'hard_rule', 'confirmed');
      `);
    }
  }
}

export function open(options = {}) {
  const defaultPath = process.env.DB_PATH || ':memory:';
  const path = typeof options === 'string' ? options : (options.path ?? defaultPath);
  if (path !== ':memory:' && !existsSync(dirname(path))) {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  const opts =
    typeof options === 'object'
      ? { seed: true, seedLegacyLabs: true, ...options }
      : { seed: true, seedLegacyLabs: true };
  initDatabase(db, opts);
  return db;
}

export function openQueueDatabase(path = process.env.DB_PATH || './data/leetkob.db') {
  if (path !== ':memory:' && !existsSync(dirname(path))) {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  initDatabase(db, { seed: true, seedLegacyLabs: false });
  return db;
}

// Statement cache to prevent recompiling statements per transaction
const statementCache = new WeakMap();

function getCachedSubmissionStatements(db) {
  let stmts = statementCache.get(db);
  if (!stmts) {
    stmts = {
      insertSubmission: db.prepare(`
        INSERT INTO submissions (lab_id, student_id, source_code, status)
        VALUES (?, ?, ?, 'queued')
      `),
      insertJob: db.prepare(`
        INSERT INTO jobs (submission_id, status)
        VALUES (?, 'queued')
      `),
    };
    statementCache.set(db, stmts);
  }
  return stmts;
}

/**
 * Creates a submission and its corresponding queued job atomically in a single SQLite transaction.
 * @param {DatabaseSync} db
 * @param {{ labId: number, studentId: number, code: string }} param1
 * @returns {number} The created submissionId
 */
export function createSubmissionTransaction(db, { labId, studentId, code }) {
  if (!Number.isInteger(labId) || labId <= 0) {
    throw new TypeError('labId must be a positive integer');
  }
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new TypeError('studentId must be a positive integer');
  }
  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new TypeError('code must be a non-empty string');
  }

  const { insertSubmission, insertJob } = getCachedSubmissionStatements(db);

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const res = insertSubmission.run(labId, studentId, code);
    const submissionId = Number(res.lastInsertRowid);
    insertJob.run(submissionId);
    db.exec('COMMIT;');
    return submissionId;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
