import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  // Start with clean database (2 empty classes, 5 demo users)
  app = await startApp();
});
afterEach(() => app.close());

function assertProblem(r, status, slug) {
  assert.equal(r.status, status);
  assert.match(r.type, /^application\/problem\+json/);
  assert.equal(r.body.status, status);
  assert.match(r.body.type, new RegExp(`/${slug}$`));
  assert.ok(typeof r.body.title === 'string' && r.body.title.length > 0);
}

test('POST /api/login handles authentication and returns token and user info', async () => {
  // Valid TA login
  const rTa = await app.as(null).post('/api/login', { username: 'ta_a', password: 'password123' });
  assert.equal(rTa.status, 200);
  assert.equal(rTa.body.token, 'tok-ta-a');
  assert.deepEqual(rTa.body.user, {
    id: 2,
    username: 'ta_a',
    name: 'ta_a',
    role: 'ta',
    classId: 1,
  });

  // Valid Student login
  const rStu = await app
    .as(null)
    .post('/api/login', { username: 'student_1', password: 'password123' });
  assert.equal(rStu.status, 200);
  assert.equal(rStu.body.token, 'tok-student-1');
  assert.deepEqual(rStu.body.user, {
    id: 4,
    username: 'student_1',
    name: 'student_1',
    role: 'student',
    classId: 1,
  });

  // Invalid password returns 401 unauthenticated problem details
  const rBadPass = await app
    .as(null)
    .post('/api/login', { username: 'ta_a', password: 'wrongpassword' });
  assertProblem(rBadPass, 401, 'unauthenticated');

  // Unknown username returns 401 unauthenticated with identical message
  const rBadUser = await app
    .as(null)
    .post('/api/login', { username: 'nobody', password: 'password123' });
  assertProblem(rBadUser, 401, 'unauthenticated');
});

test('TA creates lab with title, statement, tests, constraints and deductions', async () => {
  const labPayload = {
    title: 'Merge sort lab',
    statement: 'Implement merge sort without using std::min or std::sort.',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [
      { code: 'C1', text: 'Do not call std::min.', deduction: 2 },
      { code: 'C2', text: 'Use recursion.', deduction: 3 },
    ],
  };

  // Student is forbidden from creating labs
  const rStudent = await app.as('student_1').post('/api/labs', labPayload);
  assertProblem(rStudent, 403, 'forbidden');

  // TA of Class 1 creates lab
  const rCreate = await app.as('ta_a').post('/api/labs', labPayload);
  assert.equal(rCreate.status, 201);
  assert.equal(rCreate.body.classId, 1);
  assert.equal(rCreate.body.title, 'Merge sort lab');
  const labId = rCreate.body.id;

  // Verify lab was saved to database with constraints and test cases
  const labRow = app.db.prepare('SELECT * FROM labs WHERE id = ?').get(labId);
  assert.equal(labRow.title, 'Merge sort lab');
  assert.equal(labRow.class_id, 1);

  const tests = app.db.prepare('SELECT * FROM test_cases WHERE lab_id = ?').all(labId);
  assert.equal(tests.length, 1);

  const constraints = app.db
    .prepare('SELECT * FROM constraints WHERE lab_id = ? ORDER BY code')
    .all(labId);
  assert.equal(constraints.length, 2);
  assert.equal(constraints[0].code, 'C1');
  assert.equal(constraints[0].deduction, 2);
  assert.equal(constraints[1].code, 'C2');
  assert.equal(constraints[1].deduction, 3);
});

test('POST /api/labs rejects invalid request bodies with 400 invalid-body', async () => {
  // Empty title
  const r1 = await app.as('ta_a').post('/api/labs', {
    title: '',
    statement: 'Text',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'Ban', deduction: 1 }],
  });
  assertProblem(r1, 400, 'invalid-body');

  // Negative deduction
  const r2 = await app.as('ta_a').post('/api/labs', {
    title: 'Valid',
    statement: 'Text',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'Ban', deduction: -1 }],
  });
  assertProblem(r2, 400, 'invalid-body');

  // Duplicate constraint codes
  const r3 = await app.as('ta_a').post('/api/labs', {
    title: 'Valid',
    statement: 'Text',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [
      { code: 'C1', text: 'Ban 1', deduction: 1 },
      { code: 'C1', text: 'Ban 2', deduction: 2 },
    ],
  });
  assertProblem(r3, 400, 'invalid-body');
});

test('Lab visibility and cross-class isolation (TA of another class receives 404)', async () => {
  // Create lab in Class 1 by ta_a
  const rCreate = await app.as('ta_a').post('/api/labs', {
    title: 'Class A Lab',
    statement: 'Statement A',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'C1', deduction: 1 }],
  });
  const labAId = rCreate.body.id;

  // GET /api/labs
  const listTaA = await app.as('ta_a').get('/api/labs');
  assert.equal(listTaA.status, 200);
  assert.ok(listTaA.body.items.some((l) => l.id === labAId));

  // TA B of Class 2 receives 404 when directly requesting Lab A
  const rTaB = await app.as('ta_b').get(`/api/labs/${labAId}`);
  assertProblem(rTaB, 404, 'not-found');

  // Student 1 of Class 1 can read Lab A
  const rStu1 = await app.as('student_1').get(`/api/labs/${labAId}`);
  assert.equal(rStu1.status, 200);
  assert.equal(rStu1.body.title, 'Class A Lab');
});

test('Student submits solution, receives 202 Queued, creating submission and job atomically', async () => {
  // 1. Create Lab
  const rLab = await app.as('ta_a').post('/api/labs', {
    title: 'Sort Lab',
    statement: 'Implement sort',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'Constraint', deduction: 1 }],
  });
  const labId = rLab.body.id;

  // 2. Student submits code
  const code = '#include <iostream>\nint main() { return 0; }';
  const rSub = await app.as('student_1').post(`/api/labs/${labId}/submissions`, { code });

  assert.equal(rSub.status, 202);
  assert.equal(typeof rSub.body.id, 'number');
  assert.equal(rSub.body.status, 'queued');

  const subId = rSub.body.id;

  // 3. Verify exactly one submission and one job created in database, both queued
  const subRow = app.db.prepare('SELECT * FROM submissions WHERE id = ?').get(subId);
  assert.ok(subRow);
  assert.equal(subRow.status, 'queued');
  assert.equal(subRow.student_id, 4);
  assert.equal(subRow.source_code, code);
  assert.equal(subRow.judge_verdict, null);

  const jobRow = app.db.prepare('SELECT * FROM jobs WHERE submission_id = ?').get(subId);
  assert.ok(jobRow);
  assert.equal(jobRow.status, 'queued');
  assert.equal(jobRow.attempts, 0);

  // 4. Student queries submission status
  const rStatus = await app.as('student_1').get(`/api/submissions/${subId}`);
  assert.equal(rStatus.status, 200);
  assert.deepEqual(rStatus.body, {
    id: subId,
    labId,
    status: 'queued',
    judgeVerdict: null,
  });

  // Student 2 (same class) trying to read Student 1 submission gets 404
  const rOtherStudent = await app.as('student_2').get(`/api/submissions/${subId}`);
  assertProblem(rOtherStudent, 404, 'not-found');

  // TA B of Class 2 trying to read Student 1 submission gets 404
  const rTaB = await app.as('ta_b').get(`/api/submissions/${subId}`);
  assertProblem(rTaB, 404, 'not-found');
});

test('Full workflow: Worker stores judge verdict and constraint results -> TA reviews each constraint', async () => {
  // 1. TA creates lab
  const rLab = await app.as('ta_a').post('/api/labs', {
    title: 'C1 and C2 Demo Lab',
    statement: 'Statement',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [
      { code: 'C1', text: 'Do not call std::min.', deduction: 2 },
      { code: 'C2', text: 'Use recursion.', deduction: 3 },
    ],
  });
  const labId = rLab.body.id;

  // 2. Student 1 submits
  const code = '#include <algorithm>\nint main() { return std::min(0, 1); }';
  const rSub = await app.as('student_1').post(`/api/labs/${labId}/submissions`, { code });
  const subId = rSub.body.id;

  // 3. Worker completes judging and records verdicts in SQLite (simulating worker handoff)
  app.db.exec('BEGIN IMMEDIATE');
  app.db
    .prepare(
      "UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted', judged_at = datetime('now') WHERE id = ?",
    )
    .run(subId);
  app.db
    .prepare(
      "UPDATE jobs SET status = 'done', finished_at = datetime('now') WHERE submission_id = ?",
    )
    .run(subId);

  const c1 = app.db
    .prepare('SELECT id FROM constraints WHERE lab_id = ? AND code = ?')
    .get(labId, 'C1');
  const c2 = app.db
    .prepare('SELECT id FROM constraints WHERE lab_id = ? AND code = ?')
    .get(labId, 'C2');

  const insertVerdict = app.db.prepare(`
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);
  insertVerdict.run(
    subId,
    c1.id,
    'violation',
    JSON.stringify([{ line: 2, text: 'int main() { return std::min(0, 1); }' }]),
    'hard_rule',
  );
  insertVerdict.run(subId, c2.id, 'unsure', JSON.stringify([]), 'model_off');
  app.db.exec('COMMIT');

  // 4. Student sees judged Accepted result, but NO constraint verdicts or evidence lines
  const rStudentView = await app.as('student_1').get(`/api/submissions/${subId}`);
  assert.equal(rStudentView.status, 200);
  assert.deepEqual(rStudentView.body, {
    id: subId,
    labId,
    status: 'judged',
    judgeVerdict: 'Accepted',
  });
  assert.equal(rStudentView.body.verdicts, undefined);
  assert.equal(rStudentView.body.evidence, undefined);

  // 5. TA of Class 1 checks review queue: sees both constraints with deductions and pending status
  const rQueue = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(rQueue.status, 200);
  assert.equal(rQueue.body.labId, labId);
  assert.equal(rQueue.body.items.length, 2);

  const [item1, item2] = rQueue.body.items;
  assert.equal(item1.submissionId, subId);
  assert.equal(item1.constraint, 'C1');
  assert.equal(item1.verdict, 'violation');
  assert.deepEqual(item1.evidence, [{ line: 2, text: 'int main() { return std::min(0, 1); }' }]);
  assert.equal(item1.source, 'hard_rule');
  assert.equal(item1.deduction, 2);
  assert.equal(item1.reviewStatus, 'pending');
  assert.equal(item1.student, 'student_1');

  assert.equal(item2.submissionId, subId);
  assert.equal(item2.constraint, 'C2');
  assert.equal(item2.verdict, 'unsure');
  assert.deepEqual(item2.evidence, []);
  assert.equal(item2.source, 'model_off');
  assert.equal(item2.deduction, 3);
  assert.equal(item2.reviewStatus, 'pending');

  // TA B of Class 2 gets 404 for this queue
  const rQueueTaB = await app.as('ta_b').get(`/api/labs/${labId}/queue`);
  assertProblem(rQueueTaB, 404, 'not-found');

  // Student of Class 1 gets 403 forbidden
  const rQueueStudent = await app.as('student_1').get(`/api/labs/${labId}/queue`);
  assertProblem(rQueueStudent, 403, 'forbidden');

  // 6. TA confirms C1 violation
  const rRev1 = await app.as('ta_a').post(`/api/submissions/${subId}/constraints/C1/review`, {
    decision: 'confirm',
  });
  assert.equal(rRev1.status, 200);
  assert.deepEqual(rRev1.body, {
    submissionId: subId,
    constraint: 'C1',
    reviewStatus: 'confirmed',
  });

  // 7. TA overturns C2 violation
  const rRev2 = await app.as('ta_a').post(`/api/submissions/${subId}/constraints/C2/review`, {
    decision: 'overturn',
  });
  assert.equal(rRev2.status, 200);
  assert.deepEqual(rRev2.body, {
    submissionId: subId,
    constraint: 'C2',
    reviewStatus: 'overturned',
  });

  // 8. TA tries to review a non-existent constraint code (e.g. C999) -> 404 Not Found
  const rRevNonExistent = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/C999/review`, {
      decision: 'confirm',
    });
  assertProblem(rRevNonExistent, 404, 'not-found');

  // 9. TA of Class 2 trying to review receives 404
  const rRevCross = await app.as('ta_b').post(`/api/submissions/${subId}/constraints/C1/review`, {
    decision: 'confirm',
  });
  assertProblem(rRevCross, 404, 'not-found');

  // Verify updated review status in queue
  const rQueueUpdated = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(rQueueUpdated.body.items[0].reviewStatus, 'confirmed');
  assert.equal(rQueueUpdated.body.items[1].reviewStatus, 'overturned');
});
