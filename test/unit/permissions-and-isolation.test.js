import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(() => app.close());

function assertProblem(r, status, slug) {
  assert.equal(r.status, status);
  assert.match(r.type, /^application\/problem\+json/);
  assert.equal(r.body.status, status);
  assert.match(r.body.type, new RegExp(`/${slug}$`));
}

test('Unauthenticated callers receive 401 problem details on all endpoints', async () => {
  assertProblem(await app.as(null).get('/api/me'), 401, 'unauthenticated');
  assertProblem(await app.as(null).get('/api/labs'), 401, 'unauthenticated');
  assertProblem(await app.as(null).post('/api/labs', {}), 401, 'unauthenticated');
  assertProblem(await app.as(null).post('/api/labs/1/submissions', {}), 401, 'unauthenticated');
  assertProblem(await app.as(null).get('/api/submissions/1'), 401, 'unauthenticated');
  assertProblem(await app.as(null).get('/api/labs/1/queue'), 401, 'unauthenticated');
  assertProblem(
    await app.as(null).post('/api/submissions/1/constraints/C1/review', {}),
    401,
    'unauthenticated',
  );
});

test('Cross-tenant and role-based access restrictions for TA and Student', async () => {
  // 1. Create lab for Class 1 by ta_a
  const rLabA = await app.as('ta_a').post('/api/labs', {
    title: 'Class A Lab',
    statement: 'Solve problem in class A',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'Constraint 1', deduction: 2 }],
  });
  assert.equal(rLabA.status, 201);
  const labAId = rLabA.body.id;

  // 2. Create lab for Class 2 by ta_b
  const rLabB = await app.as('ta_b').post('/api/labs', {
    title: 'Class B Lab',
    statement: 'Solve problem in class B',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'Constraint 1', deduction: 2 }],
  });
  assert.equal(rLabB.status, 201);
  const labBId = rLabB.body.id;

  // 3. TA B accessing Class A lab -> 404 Not Found
  assertProblem(await app.as('ta_b').get(`/api/labs/${labAId}`), 404, 'not-found');
  assertProblem(await app.as('ta_b').get(`/api/labs/${labAId}/queue`), 404, 'not-found');

  // 4. TA A accessing Class B lab -> 404 Not Found
  assertProblem(await app.as('ta_a').get(`/api/labs/${labBId}`), 404, 'not-found');
  assertProblem(await app.as('ta_a').get(`/api/labs/${labBId}/queue`), 404, 'not-found');

  // 5. Student 1 submitting to Class 1 lab -> succeeds with 202
  const rSubA = await app.as('student_1').post(`/api/labs/${labAId}/submissions`, {
    code: 'int main() { return 0; }',
  });
  assert.equal(rSubA.status, 202);
  const subAId = rSubA.body.id;

  // 6. Student 1 submitting to Class 2 lab -> 404 Not Found
  assertProblem(
    await app.as('student_1').post(`/api/labs/${labBId}/submissions`, {
      code: 'int main() { return 0; }',
    }),
    404,
    'not-found',
  );

  // 7. Student 2 in Class A attempting to view Student 1 submission -> 404 Not Found
  assertProblem(await app.as('student_2').get(`/api/submissions/${subAId}`), 404, 'not-found');

  // 8. TA B in Class B attempting to view Student 1 submission -> 404 Not Found
  assertProblem(await app.as('ta_b').get(`/api/submissions/${subAId}`), 404, 'not-found');

  // 9. Student 1 attempting to view review queue -> 403 Forbidden
  assertProblem(await app.as('student_1').get(`/api/labs/${labAId}/queue`), 403, 'forbidden');

  // 10. Student 1 attempting to review constraint -> 403 Forbidden
  assertProblem(
    await app.as('student_1').post(`/api/submissions/${subAId}/constraints/C1/review`, {
      decision: 'confirm',
    }),
    403,
    'forbidden',
  );

  // 11. TA B attempting to review constraint in Class A -> 404 Not Found
  assertProblem(
    await app.as('ta_b').post(`/api/submissions/${subAId}/constraints/C1/review`, {
      decision: 'confirm',
    }),
    404,
    'not-found',
  );

  // 12. TA A can view Student 1 submission and review queue
  const rTaAView = await app.as('ta_a').get(`/api/submissions/${subAId}`);
  assert.equal(rTaAView.status, 200);
  assert.equal(rTaAView.body.studentId, 4);

  const rTaAQueue = await app.as('ta_a').get(`/api/labs/${labAId}/queue`);
  assert.equal(rTaAQueue.status, 200);
});

test('Student visibility policy: student response strictly excludes constraint evaluation details', async () => {
  // Setup lab
  const rLab = await app.as('ta_a').post('/api/labs', {
    title: 'Secret Constraints Lab',
    statement: 'Statement',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'C1', text: 'No loop', deduction: 5 }],
  });
  const labId = rLab.body.id;

  // Student submits
  const rSub = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int main() { for(;;); }',
  });
  const subId = rSub.body.id;

  // Simulate worker execution with negative verdict
  app.db.exec('BEGIN IMMEDIATE');
  app.db
    .prepare("UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted' WHERE id = ?")
    .run(subId);
  const c1 = app.db.prepare('SELECT id FROM constraints WHERE lab_id = ?').get(labId);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'violation', '[{"line":1,"text":"for(;;);"}]', 'hard_rule', 'pending')
  `,
    )
    .run(subId, c1.id);
  app.db.exec('COMMIT');

  // Student requests submission result
  const res = await app.as('student_1').get(`/api/submissions/${subId}`);
  assert.equal(res.status, 200);

  // Assert expected student fields
  assert.equal(res.body.id, subId);
  assert.equal(res.body.labId, labId);
  assert.equal(res.body.status, 'judged');
  assert.equal(res.body.judgeVerdict, 'Accepted');

  // Strict verification that internal details are NOT exposed
  assert.equal(res.body.verdicts, undefined);
  assert.equal(res.body.evidence, undefined);
  assert.equal(res.body.deduction, undefined);
  assert.equal(res.body.source, undefined);
  assert.equal(res.body.reviewStatus, undefined);
  assert.equal(JSON.stringify(res.body).includes('for(;;);'), false);
  assert.equal(JSON.stringify(res.body).includes('violation'), false);
});

test('Authentication and Account Management: login, logout, password change, and admin user list', async () => {
  // 1. Login with bad credentials -> 401 unauthenticated
  const badLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'wrongpassword',
  });
  assertProblem(badLogin, 401, 'unauthenticated');

  // 2. Login with correct credentials -> 200 with token and user object
  const loginRes = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'password123',
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.user.username, 'ta_a');
  assert.equal(loginRes.body.user.role, 'ta');
  assert.ok(loginRes.body.token);

  // 3. Use returned token to fetch /api/me
  const meRes = await app.as({ token: loginRes.body.token }).get('/api/me');
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.username, 'ta_a');

  // 4. Change password with incorrect current password -> 400 invalid-credentials
  const badPwRes = await app.as({ token: loginRes.body.token }).post('/api/users/change-password', {
    currentPassword: 'wrongpassword',
    newPassword: 'newSecretPassword123',
  });
  assertProblem(badPwRes, 400, 'invalid-credentials');

  // 5. Change password with valid credentials -> 200
  const goodPwRes = await app.as({ token: loginRes.body.token }).post('/api/users/change-password', {
    currentPassword: 'password123',
    newPassword: 'newSecretPassword123',
  });
  assert.equal(goodPwRes.status, 200);
  assert.ok(goodPwRes.body.message);

  // 6. Verify login with old password fails, new password succeeds
  const oldLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'password123',
  });
  assertProblem(oldLogin, 401, 'unauthenticated');

  const newLogin = await app.as(null).post('/api/login', {
    username: 'ta_a',
    password: 'newSecretPassword123',
  });
  assert.equal(newLogin.status, 200);

  // 7. Logout endpoint -> 200
  const logoutRes = await app.as({ token: newLogin.body.token }).post('/api/logout', {});
  assert.equal(logoutRes.status, 200);

  // 8. User list: non-admin gets 403, admin gets 200 with user directory
  assertProblem(await app.as('ta_a').get('/api/users'), 403, 'forbidden');
  assertProblem(await app.as('student_1').get('/api/users'), 403, 'forbidden');

  const adminUsers = await app.as('admin').get('/api/users');
  assert.equal(adminUsers.status, 200);
  assert.ok(Array.isArray(adminUsers.body.items));
  assert.ok(adminUsers.body.items.length >= 5);
  // Ensure sensitive password hashes are stripped
  for (const u of adminUsers.body.items) {
    assert.equal(u.passwordHash, undefined);
    assert.equal(u.password_hash, undefined);
  }
});
