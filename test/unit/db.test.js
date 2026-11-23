import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  open,
  CLASSES,
  verifyPassword,
  hashPassword,
  createSubmissionTransaction,
} from '../../src/db.js';

test('database schema initializes with classes and demo users', () => {
  const db = open();
  assert.ok(db);

  const classes = db
    .prepare('SELECT id, name FROM classes ORDER BY id')
    .all()
    .map((c) => ({ ...c }));
  assert.equal(classes.length, 2);
  assert.deepEqual(classes, CLASSES);

  const users = db
    .prepare('SELECT id, username, role, class_id FROM users WHERE id <= 5 ORDER BY id')
    .all();
  assert.equal(users.length, 5);

  const taA = users.find((u) => u.username === 'ta_a');
  assert.equal(taA.role, 'ta');
  assert.equal(taA.class_id, 1);

  const taB = users.find((u) => u.username === 'ta_b');
  assert.equal(taB.role, 'ta');
  assert.equal(taB.class_id, 2);

  const stu1 = users.find((u) => u.username === 'student_1');
  assert.equal(stu1.role, 'student');
  assert.equal(stu1.class_id, 1);

  const stu2 = users.find((u) => u.username === 'student_2');
  assert.equal(stu2.role, 'student');
  assert.equal(stu2.class_id, 1);

  const admin = users.find((u) => u.username === 'admin');
  assert.equal(admin.role, 'admin');
  assert.equal(admin.class_id, null);
});

test('password hashing and verification function properly', () => {
  const hash = hashPassword('password123');
  assert.equal(verifyPassword(hash, 'password123'), true);
  assert.equal(verifyPassword(hash, 'wrongpass'), false);
  assert.equal(verifyPassword(hash, 'ta_a', 'ta_a'), true);
  assert.equal(verifyPassword(null, 'password123'), false);
  assert.equal(verifyPassword(hash, undefined), false);
});

test('submitting a solution records submission and job atomically via createSubmissionTransaction', () => {
  const db = open();

  // Create a lab first
  const labResult = db
    .prepare(
      "INSERT INTO labs (class_id, title, statement_md, created_by) VALUES (1, 'Merge Sort', 'Statement', 2)",
    )
    .run();
  const labId = Number(labResult.lastInsertRowid);

  // Atomic transaction
  const submissionId = createSubmissionTransaction(db, {
    labId,
    studentId: 4,
    code: '#include <iostream>\nint main() { return 0; }',
  });

  assert.ok(Number.isInteger(submissionId));
  assert.ok(submissionId > 0);

  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId);
  assert.equal(sub.status, 'queued');
  assert.equal(sub.student_id, 4);
  assert.equal(sub.judge_verdict, null);

  const job = db.prepare('SELECT * FROM jobs WHERE submission_id = ?').get(submissionId);
  assert.equal(job.status, 'queued');
  assert.equal(job.attempts, 0);

  // Verify parameter validations
  assert.throws(() => {
    createSubmissionTransaction(db, { labId: -1, studentId: 4, code: 'x' });
  }, /labId must be a positive integer/);

  assert.throws(() => {
    createSubmissionTransaction(db, { labId, studentId: 0, code: 'x' });
  }, /studentId must be a positive integer/);

  assert.throws(() => {
    createSubmissionTransaction(db, { labId, studentId: 4, code: '   ' });
  }, /code must be a non-empty string/);

  // Verify rollback behavior on invalid foreign key
  assert.throws(() => {
    createSubmissionTransaction(db, {
      labId: 999999, // Non-existent lab
      studentId: 4,
      code: 'int main() {}',
    });
  });

  const count = db
    .prepare('SELECT count(*) as count FROM submissions WHERE student_id = 4')
    .get().count;
  assert.equal(count, 1);
});

test('schema constraints reject invalid ordinal, negative deduction, or illegal source', () => {
  const db = open();
  const labResult = db
    .prepare(
      "INSERT INTO labs (class_id, title, statement_md, created_by) VALUES (1, 'Lab 1', 'Desc', 2)",
    )
    .run();
  const labId = Number(labResult.lastInsertRowid);

  // 1. Ordinal must be >= 1
  assert.throws(() => {
    db.prepare(
      'INSERT INTO test_cases (lab_id, ordinal, input_text, expected_output) VALUES (?, ?, ?, ?)',
    ).run(labId, 0, 'in', 'out');
  });

  // Valid ordinal works
  db.prepare(
    'INSERT INTO test_cases (lab_id, ordinal, input_text, expected_output) VALUES (?, ?, ?, ?)',
  ).run(labId, 1, 'in', 'out');

  // 2. Deduction must be >= 0
  assert.throws(() => {
    db.prepare('INSERT INTO constraints (lab_id, code, text, deduction) VALUES (?, ?, ?, ?)').run(
      labId,
      'C_NEG',
      'Negative',
      -1.5,
    );
  });

  // Valid decimal deduction works
  const cResult = db
    .prepare('INSERT INTO constraints (lab_id, code, text, deduction) VALUES (?, ?, ?, ?)')
    .run(labId, 'C_POS', 'Valid decimal', 2.5);
  const constraintId = Number(cResult.lastInsertRowid);

  const cRow = db.prepare('SELECT deduction FROM constraints WHERE id = ?').get(constraintId);
  assert.equal(cRow.deduction, 2.5);

  // 3. Source must be one of the four allowed enum values
  const subId = createSubmissionTransaction(db, {
    labId,
    studentId: 4,
    code: 'int main() {}',
  });

  assert.throws(() => {
    db.prepare(
      'INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, source, review_status) VALUES (?, ?, ?, ?, ?)',
    ).run(subId, constraintId, 'violation', 'illegal_source', 'pending');
  });

  // Allowed source works
  db.prepare(
    'INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, source, review_status) VALUES (?, ?, ?, ?, ?)',
  ).run(subId, constraintId, 'violation', 'hard_rule', 'pending');
});

test('foreign key cascade removes child submissions and jobs when lab is deleted', () => {
  const db = open();
  const labResult = db
    .prepare(
      "INSERT INTO labs (class_id, title, statement_md, created_by) VALUES (1, 'Lab Cascade', 'Desc', 2)",
    )
    .run();
  const labId = Number(labResult.lastInsertRowid);

  const subId = createSubmissionTransaction(db, {
    labId,
    studentId: 4,
    code: 'int main() {}',
  });

  assert.ok(db.prepare('SELECT id FROM submissions WHERE id = ?').get(subId));
  assert.ok(db.prepare('SELECT id FROM jobs WHERE submission_id = ?').get(subId));

  // Delete the lab
  db.prepare('DELETE FROM labs WHERE id = ?').run(labId);

  // Child submission and job are automatically cascaded
  assert.equal(db.prepare('SELECT id FROM submissions WHERE id = ?').get(subId), undefined);
  assert.equal(db.prepare('SELECT id FROM jobs WHERE submission_id = ?').get(subId), undefined);
});
