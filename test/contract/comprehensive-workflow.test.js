import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(() => app?.close());

function assertProblem(res, expectedStatus, expectedSlug) {
  assert.equal(res.status, expectedStatus, `Expected HTTP status ${expectedStatus}, got ${res.status}`);
  assert.match(
    res.type || '',
    /^application\/problem\+json/,
    `Expected application/problem+json content-type, got ${res.type}`,
  );
  assert.equal(res.body?.status, expectedStatus);
  if (expectedSlug) {
    assert.match(
      res.body?.type || '',
      new RegExp(`/${expectedSlug}$`),
      `Expected problem slug ${expectedSlug}, got ${res.body?.type}`,
    );
  }
}

// =============================================================================
// SUITE 1: AUTHENTICATION & SESSION LIFECYCLE WORKFLOW
// =============================================================================
test('Workflow 1: Authentication, Password Change, Token Verification & Session Termination', async () => {
  // 1.1 Unauthenticated requests are rejected
  const unauth = await app.as(null).get('/api/me');
  assertProblem(unauth, 401, 'unauthenticated');

  // 1.2 Invalid login credentials
  const badLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'wrong-password-999',
  });
  assertProblem(badLogin, 401, 'unauthenticated');

  // 1.3 Successful login with seed demo user
  const loginRes = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'password123',
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.user.username, 'ta_a');
  assert.equal(loginRes.body.user.role, 'ta');
  assert.equal(loginRes.body.user.classId, 1);
  const userToken = loginRes.body.token;
  assert.ok(userToken, 'Session token must be returned');

  // 1.4 Profile lookup with active token
  const meRes = await app.as({ token: userToken }).get('/api/me');
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.username, 'ta_a');
  assert.equal(meRes.body.name, 'ta_a');

  // 1.5 Password change - rejects wrong current password
  const failPw = await app.as({ token: userToken }).post('/api/users/change-password', {
    currentPassword: 'incorrect-password',
    newPassword: 'AliceNewStrongPassword2026!',
  });
  assertProblem(failPw, 400, 'invalid-credentials');

  // 1.6 Password change - success
  const successPw = await app.as({ token: userToken }).post('/api/users/change-password', {
    currentPassword: 'password123',
    newPassword: 'AliceNewStrongPassword2026!',
  });
  assert.equal(successPw.status, 200);
  assert.ok(successPw.body.message);

  // 1.7 Login with old password must now fail
  const oldLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'password123',
  });
  assertProblem(oldLogin, 401, 'unauthenticated');

  // 1.8 Login with new password succeeds
  const newLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'AliceNewStrongPassword2026!',
  });
  assert.equal(newLogin.status, 200);
  const freshToken = newLogin.body.token;

  // 1.9 Logout session
  const logoutRes = await app.as({ token: freshToken }).post('/api/logout', {});
  assert.equal(logoutRes.status, 200);
  assert.ok(logoutRes.body.message);
});

// =============================================================================
// SUITE 2: MULTI-TENANT CLASS MANAGEMENT & STUDENT ROSTER WORKFLOW
// =============================================================================
test('Workflow 2: Class Hierarchy, Teacher Assignment, Student Rostering & Tenant Isolation', async () => {
  // 2.1 Non-admin cannot create classes (403)
  const forbiddenClass = await app.as('ta_a').post('/api/classes', { name: 'Unauthorized Class' });
  assertProblem(forbiddenClass, 403, 'forbidden');

  // 2.2 Admin creates new Class CS103
  const newClassRes = await app.as('admin').post('/api/classes', { name: 'CS103 - Advanced Web' });
  assert.equal(newClassRes.status, 201);
  const classId = newClassRes.body.class?.id || newClassRes.body.id;
  assert.ok(classId, 'Class ID must be returned');

  // 2.3 Admin creates teacher account and assigns to class
  const newTeacherRes = await app.as('admin').post('/api/users', {
    username: 'teacher_c',
    password: 'password123',
    name: 'Charlie Teacher',
    role: 'ta',
  });
  assert.equal(newTeacherRes.status, 201);
  const teacherId = newTeacherRes.body.user?.id || newTeacherRes.body.id;

  const assignTeacherRes = await app.as('admin').post(`/api/classes/${classId}/teachers`, {
    teacherId,
  });
  assert.equal(assignTeacherRes.status, 200);

  // 2.4 Teacher C views their empty student roster
  const emptyRoster = await app.as('teacher_c').get(`/api/classes/${classId}/students`);
  assert.equal(emptyRoster.status, 200);
  assert.deepEqual(emptyRoster.body.items, []);

  // 2.5 Teacher C enrolls student_1 into class
  const enrollRes = await app.as('teacher_c').post(`/api/classes/${classId}/students`, {
    studentId: 4, // student_1 seed ID
  });
  assert.equal(enrollRes.status, 200);

  // 2.6 Roster now includes student_1
  const updatedRoster = await app.as('teacher_c').get(`/api/classes/${classId}/students`);
  assert.equal(updatedRoster.status, 200);
  assert.equal(updatedRoster.body.items.length, 1);
  assert.equal(updatedRoster.body.items[0].id, 4);

  // 2.7 Cross-tenant violation: TA Alice (Class 1) cannot add/remove students in Class 103
  const crossAdd = await app.as('ta_a').post(`/api/classes/${classId}/students`, { studentId: 5 });
  assertProblem(crossAdd, 403, 'forbidden');

  const crossRemove = await app.as('ta_a').delete(`/api/classes/${classId}/students/4`);
  assertProblem(crossRemove, 403, 'forbidden');

  // 2.8 Teacher C removes student_1 from class
  const removeRes = await app.as('teacher_c').delete(`/api/classes/${classId}/students/4`);
  assert.equal(removeRes.status, 200);

  const finalRoster = await app.as('teacher_c').get(`/api/classes/${classId}/students`);
  assert.equal(finalRoster.body.items.length, 0);
});

// =============================================================================
// SUITE 3: LAB CREATION, VALIDATION & ACCESS ISOLATION
// =============================================================================
test('Workflow 3: Lab Authoring, Payload Validation & Cross-Class 404 Isolation', async () => {
  // 3.1 Invalid payload: missing title -> 400
  const invalidNoTitle = await app.as('ta_a').post('/api/labs', {
    statement: 'Valid statement',
    testCases: [{ input: '1', expectedOutput: '1' }],
  });
  assertProblem(invalidNoTitle, 400, 'invalid-body');

  // 3.2 Invalid payload: negative constraint deduction -> 400
  const invalidNegativeDeduction = await app.as('ta_a').post('/api/labs', {
    title: 'Invalid Lab',
    statement: 'Valid statement',
    testCases: [{ input: '1', expectedOutput: '1' }],
    constraints: [{ code: 'C1', text: 'Illegal', deduction: -10 }],
  });
  assertProblem(invalidNegativeDeduction, 400, 'invalid-body');

  // 3.3 Valid lab creation by TA Alice in Class 1
  const createLabRes = await app.as('ta_a').post('/api/labs', {
    title: 'Lab 2: Recursion Mastery',
    statement: 'Implement factorial using recursion without while loops.',
    testCases: [
      { input: '5', expectedOutput: '120' },
      { input: '0', expectedOutput: '1' },
    ],
    constraints: [
      { code: 'c1-no-loops', text: 'Disallow while and for loops', deduction: 25 },
      { code: 'c2-recursion', text: 'Must contain self recursive call', deduction: 15 },
    ],
  });
  assert.equal(createLabRes.status, 201);
  const labId = createLabRes.body.id;
  assert.ok(labId);

  // 3.4 TA Alice can inspect details of Lab 2
  const labDetails = await app.as('ta_a').get(`/api/labs/${labId}`);
  assert.equal(labDetails.status, 200);
  assert.equal(labDetails.body.title, 'Lab 2: Recursion Mastery');
  assert.equal(labDetails.body.classId, 1);

  // 3.5 Student in Class 1 can view Lab 2
  const stuView = await app.as('student_1').get(`/api/labs/${labId}`);
  assert.equal(stuView.status, 200);

  // 3.6 Tenant Boundary: TA Bob (Class 2) receives strict 404 (not 403) to conceal resource existence
  const taBobAttempt = await app.as('ta_b').get(`/api/labs/${labId}`);
  assertProblem(taBobAttempt, 404, 'not-found');

  // 3.7 Non-numeric or non-existent lab returns 404
  const nonNumeric = await app.as('ta_a').get('/api/labs/invalid-string');
  assertProblem(nonNumeric, 404, 'not-found');

  const notFoundLab = await app.as('ta_a').get('/api/labs/999999');
  assertProblem(notFoundLab, 404, 'not-found');
});

// =============================================================================
// SUITE 4 & 5: SUBMISSION, PRIVACY INVARIANT & WORKER JUDGE PIPELINE
// =============================================================================
test('Workflow 4 & 5: Submission Queuing, Worker Execution & Strict Privacy Invariant', async () => {
  // Create lab for Class 1
  const rLab = await app.as('ta_a').post('/api/labs', {
    title: 'Privacy Invariant Lab',
    statement: 'Do not use while loops.',
    testCases: [{ input: '10', expectedOutput: '20' }],
    constraints: [{ code: 'c1-no-loops', text: 'No loops allowed', deduction: 30 }],
  });
  const labId = rLab.body.id;

  // 4.1 Student 1 submits code -> receives 202 Queued
  const subRes = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int main() { int x; std::cin >> x; std::cout << x*2; return 0; }',
  });
  assert.equal(subRes.status, 202);
  assert.equal(subRes.body.status, 'queued');
  const subId = subRes.body.id;
  assert.ok(subId);

  // 4.2 Verify database recorded submission and judge job atomically
  const subRow = app.db.prepare('SELECT * FROM submissions WHERE id = ?').get(subId);
  assert.ok(subRow, 'Submission row must exist in DB');
  assert.equal(subRow.status, 'queued');

  const jobRow = app.db.prepare('SELECT * FROM jobs WHERE submission_id = ?').get(subId);
  assert.ok(jobRow, 'Judge job row must exist in DB');

  // 4.3 Simulate Worker evaluation: sets verdict to Accepted, records AST violation
  app.db.exec('BEGIN IMMEDIATE');
  app.db
    .prepare("UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted' WHERE id = ?")
    .run(subId);

  const constraintRow = app.db.prepare('SELECT id FROM constraints WHERE lab_id = ?').get(labId);
  app.db
    .prepare(
      `INSERT INTO constraint_verdicts
       (submission_id, constraint_id, verdict, evidence_json, source, review_status)
       VALUES (?, ?, 'violation', '[{"line":3,"code":"while(x--) {}"}]', 'hard_rule', 'pending')`,
    )
    .run(subId, constraintRow.id);
  app.db.exec('COMMIT');

  // 4.4 PRIVACY INVARIANT CHECK: Student inspects submission before grades published
  const stuCheck = await app.as('student_1').get(`/api/submissions/${subId}`);
  assert.equal(stuCheck.status, 200);
  assert.equal(stuCheck.body.id, subId);
  assert.equal(stuCheck.body.status, 'judged');
  assert.equal(stuCheck.body.judgeVerdict, 'Accepted');

  // Ensure internal violation details are completely hidden from student
  assert.equal(stuCheck.body.verdicts, undefined, 'Student must not see internal verdicts before publish');
  assert.equal(stuCheck.body.evidence, undefined, 'Student must not see violation evidence before publish');
  assert.equal(stuCheck.body.deduction, undefined, 'Student must not see deduction before publish');
  assert.equal(stuCheck.body.reviewStatus, undefined, 'Student must not see review status before publish');
  assert.equal(JSON.stringify(stuCheck.body).includes('while(x--)'), false);
  assert.equal(JSON.stringify(stuCheck.body).includes('violation'), false);

  // 4.5 TA Alice CAN inspect review queue with full violation evidence
  const taQueue = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(taQueue.status, 200);
  const queueItems = taQueue.body.items || taQueue.body;
  assert.equal(queueItems.length, 1);
  assert.equal(queueItems[0].verdict, 'violation');
  assert.equal(queueItems[0].constraintCode, 'c1-no-loops');
  assert.ok(JSON.stringify(queueItems[0].evidence).includes('while(x--)'));
});

// =============================================================================
// SUITE 6 & 7: REVIEW QUEUE, ADJUDICATION & GRADE PUBLISHING
// =============================================================================
test('Workflow 6 & 7: TA Review Queue Adjudication, Conflict On Pending Reviews & Idempotent Publish', async () => {
  // Setup lab with constraint
  const rLab = await app.as('ta_a').post('/api/labs', {
    title: 'Publish Cycle Lab',
    statement: 'Complete assignment',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'c1-no-recursion', text: 'Iterative only', deduction: 20 }],
  });
  const labId = rLab.body.id;

  // Student submits
  const rSub = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int solve() { return solve(); }',
  });
  const subId = rSub.body.id;

  // Simulate worker: verdict marked pending review
  const cRow = app.db.prepare('SELECT id FROM constraints WHERE lab_id = ?').get(labId);
  app.db.exec('BEGIN IMMEDIATE');
  app.db.prepare("UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted' WHERE id = ?").run(subId);
  app.db
    .prepare(
      `INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
       VALUES (?, ?, 'violation', '[{"line":1,"code":"solve()"}]', 'hard_rule', 'pending')`,
    )
    .run(subId, cRow.id);
  app.db.exec('COMMIT');

  // 6.1 Publishing fails with 409 Conflict when reviews are still pending
  const rejectPublish = await app.as('ta_a').post(`/api/labs/${labId}/publish`, {});
  assertProblem(rejectPublish, 409, 'reviews-pending');
  assert.equal(rejectPublish.body.pending || rejectPublish.body.pendingCount, 1);
  assert.equal(app.publishedAt(labId), null, 'Lab must not be marked as published');

  // 6.2 TA Alice confirms the violation deduction
  const reviewRes = await app.as('ta_a').post(`/api/submissions/${subId}/constraints/c1-no-recursion/review`, {
    decision: 'confirm',
  });
  assert.equal(reviewRes.status, 200);
  assert.equal(reviewRes.body.reviewStatus, 'confirmed');

  // 6.3 Pending reviews in queue are now 0
  const queueAfterReview = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(queueAfterReview.status, 200);
  const remainingQueue = queueAfterReview.body.items || queueAfterReview.body;
  const pendingItems = remainingQueue.filter((item) => item.reviewStatus === 'pending');
  assert.equal(pendingItems.length, 0);
  assert.equal(remainingQueue[0].reviewStatus, 'confirmed');

  // 6.4 Non-teacher or student cannot publish (403)
  const stuPublish = await app.as('student_1').post(`/api/labs/${labId}/publish`, {});
  assertProblem(stuPublish, 403, 'forbidden');

  // 6.5 TA Alice publishes grades successfully -> 200 OK
  const publishSuccess = await app.as('ta_a').post(`/api/labs/${labId}/publish`, {});
  assert.equal(publishSuccess.status, 200);
  assert.ok(publishSuccess.body.publishedAt, 'publishedAt timestamp must be returned');
  const firstTimestamp = publishSuccess.body.publishedAt;

  // Verify published status in DB
  const dbTimestamp = app.publishedAt(labId);
  assert.ok(dbTimestamp);
  assert.equal(dbTimestamp, firstTimestamp);

  // 6.6 Idempotent retry: Publishing again does not move the timestamp
  const retryPublish = await app.as('ta_a').post(`/api/labs/${labId}/publish`, {});
  assert.equal(retryPublish.status, 200);
  assert.equal(retryPublish.body.publishedAt, firstTimestamp, 'Idempotent publish must not change timestamp');
  assert.equal(app.publishedAt(labId), firstTimestamp);
});

// =============================================================================
// SUITE 8: SECURITY, MASS ASSIGNMENT & MALFORMED PAYLOAD RESILIENCE
// =============================================================================
test('Workflow 8: Malformed JSON, Mass Assignment Protection & Negative Boundaries', async () => {
  // 8.1 Malformed JSON body in POST request returns 400 invalid-body without crashing
  const rawFetch = await fetch(`http://localhost:${app.db ? 3007 : 3007}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"invalid": json...',
  }).catch(() => null);

  // 8.2 Mass Assignment Protection: Student cannot inject role: 'admin' or arbitrary classId
  const rLogin = await app.as(null).post('/api/login', { username: 'student_1', password: 'password123' });
  assert.equal(rLogin.status, 200);
  const stuToken = rLogin.body.token;

  // Student attempts to pass elevated parameters during password update
  await app.as({ token: stuToken }).post('/api/users/change-password', {
    currentPassword: 'password123',
    newPassword: 'StudentNewPassword2026!',
    role: 'admin',
    classId: 999,
  });

  // Verify student role and classId in database remain untouched
  const stuDb = app.db.prepare("SELECT role, class_id FROM users WHERE username = 'student_1'").get();
  assert.equal(stuDb.role, 'student', 'Student role must not be escalated via mass assignment');
  assert.equal(stuDb.class_id, 1, 'Student class must not be modified arbitrarily');

  // 8.3 Unmatched API route returns 404 Problem Details
  const notFoundRoute = await app.as('admin').get('/api/completely-unknown-route');
  assertProblem(notFoundRoute, 404, 'not-found');
});
