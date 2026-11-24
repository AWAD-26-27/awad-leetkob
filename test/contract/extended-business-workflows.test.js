import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(() => app?.close());

function assertProblem(res, expectedStatus, expectedSlug) {
  assert.equal(
    res.status,
    expectedStatus,
    `Expected HTTP status ${expectedStatus}, got ${res.status}`,
  );
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
// WORKFLOW 9: MULTI-ATTEMPT SUBMISSION LIFECYCLE & GRADING EVOLUTION
// =============================================================================
test('Workflow 9: Multi-Attempt Submission Lifecycle, Progress Tracking & Grading Evolution', async () => {
  // 9.1 TA creates lab with two constraints
  const labRes = await app.as('ta_a').post('/api/labs', {
    title: 'Lab 3: Iterative DP vs Recursion',
    statement: 'Solve longest common subsequence using iterative DP. Disallow recursion.',
    testCases: [
      { input: 'ABC BD', expectedOutput: 'B' },
      { input: 'AGGTAB GXTXAYB', expectedOutput: 'GTAB' },
    ],
    constraints: [
      { code: 'c1-no-rec', text: 'No recursive function calls', deduction: 30 },
      { code: 'c2-space-opt', text: 'Space complexity O(N)', deduction: 20 },
    ],
  });
  assert.equal(labRes.status, 201);
  const labId = labRes.body.id;

  // 9.2 Attempt 1: Student submits code that fails test cases (Wrong Answer)
  const sub1 = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int main() { std::cout << "WRONG"; return 0; }',
  });
  assert.equal(sub1.status, 202);
  const id1 = sub1.body.id;

  // Simulate worker: WA recorded, constraints are NOT evaluated
  app.db
    .prepare(
      "UPDATE submissions SET status = 'judged', judge_verdict = 'WA', judge_detail = ? WHERE id = ?",
    )
    .run(JSON.stringify({ testIndex: 1 }), id1);

  // Queue must have 0 items because non-Accepted submissions do not invoke constraint checking
  const q1 = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(q1.status, 200);
  assert.equal((q1.body.items || q1.body).length, 0);

  // 9.3 Attempt 2: Student submits code that passes tests (Accepted) but triggers C1 violation & C2 unsure
  const sub2 = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int solve(int i, int j) { return solve(i-1, j-1); } int main() { ... }',
  });
  assert.equal(sub2.status, 202);
  const id2 = sub2.body.id;

  const cRows = app.db
    .prepare('SELECT id, code FROM constraints WHERE lab_id = ? ORDER BY id')
    .all(labId);
  const c1Id = cRows.find((c) => c.code === 'c1-no-rec').id;
  const c2Id = cRows.find((c) => c.code === 'c2-space-opt').id;

  app.db.exec('BEGIN IMMEDIATE');
  app.db
    .prepare("UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted' WHERE id = ?")
    .run(id2);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'violation', '[{"line":1,"code":"solve(i-1, j-1)"}]', 'hard_rule', 'pending')
  `,
    )
    .run(id2, c1Id);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'unsure', '[{"line":1,"reason":"complex memory access"}]', 'model', 'pending')
  `,
    )
    .run(id2, c2Id);
  app.db.exec('COMMIT');

  // Review queue now shows 2 pending items for Attempt 2
  const q2 = await app.as('ta_a').get(`/api/labs/${labId}/queue`);
  assert.equal(q2.status, 200);
  const qItems = q2.body.items || q2.body;
  assert.equal(qItems.length, 2);

  // Publishing at this stage is strictly blocked (409 Conflict)
  const prematurePub = await app.as('ta_a').post(`/api/labs/${labId}/publish`, {});
  assertProblem(prematurePub, 409, 'reviews-pending');

  // TA adjudicates Attempt 2: Confirms C1 violation, Overturns C2 unsure
  const revC1 = await app.as('ta_a').post(`/api/submissions/${id2}/constraints/c1-no-rec/review`, {
    decision: 'confirm',
  });
  assert.equal(revC1.status, 200);
  assert.equal(revC1.body.reviewStatus, 'confirmed');

  const revC2 = await app
    .as('ta_a')
    .post(`/api/submissions/${id2}/constraints/c2-space-opt/review`, {
      decision: 'overturn',
    });
  assert.equal(revC2.status, 200);
  assert.equal(revC2.body.reviewStatus, 'overturned');

  // 9.4 Attempt 3: Student submits perfect solution (Accepted, both constraints pass)
  const sub3 = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: 'int dp[2][1000]; int main() { /* iterative O(N) */ }',
  });
  assert.equal(sub3.status, 202);
  const id3 = sub3.body.id;

  app.db.exec('BEGIN IMMEDIATE');
  app.db
    .prepare("UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted' WHERE id = ?")
    .run(id3);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'pass', '[]', 'hard_rule', 'pending')
  `,
    )
    .run(id3, c1Id);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'pass', '[]', 'hard_rule', 'pending')
  `,
    )
    .run(id3, c2Id);
  app.db.exec('COMMIT');

  // 9.5 Student queries their submission history: should see all 3 submissions
  const stuList = await app.as('student_1').get(`/api/labs/${labId}/submissions`);
  assert.equal(stuList.status, 200);
  const items = stuList.body.items || stuList.body;
  assert.equal(items.length, 3);
  assert.equal(items[0].id, id3);
  assert.equal(items[0].judgeVerdict, 'Accepted');
  assert.equal(items[1].id, id2);
  assert.equal(items[1].judgeVerdict, 'Accepted');
  assert.equal(items[2].id, id1);
  assert.equal(items[2].judgeVerdict, 'WA');

  // 9.6 TA publishes grades: succeeds because all reviews for Attempt 2 are resolved and Attempt 3 has no violations needing review
  const pubRes = await app.as('ta_a').post(`/api/labs/${labId}/publish`, {});
  assert.equal(pubRes.status, 200);
  assert.ok(pubRes.body.publishedAt);
});

// =============================================================================
// WORKFLOW 10: GRANULAR CONSTRAINT ADJUDICATION & ERROR HANDLING
// =============================================================================
test('Workflow 10: Granular Constraint Adjudication, Overturning & Invalid Review Payloads', async () => {
  const labRes = await app.as('ta_a').post('/api/labs', {
    title: 'Adjudication Test Lab',
    statement: 'Lab statement',
    testCases: [{ input: '', expectedOutput: '' }],
    constraints: [{ code: 'c1-unique', text: 'Constraint 1', deduction: 10 }],
  });
  const labId = labRes.body.id;

  const subRes = await app
    .as('student_1')
    .post(`/api/labs/${labId}/submissions`, { code: 'int x = 0;' });
  const subId = subRes.body.id;

  const cRow = app.db.prepare('SELECT id FROM constraints WHERE lab_id = ?').get(labId);
  app.db
    .prepare(
      `
    INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
    VALUES (?, ?, 'violation', '[]', 'hard_rule', 'pending')
  `,
    )
    .run(subId, cRow.id);

  // 10.1 Invalid decision value returns 400 Problem Details
  const badDecision = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {
      decision: 'invalid-verdict-choice',
    });
  assertProblem(badDecision, 400, 'invalid-body');

  // 10.2 Missing decision field returns 400 Problem Details
  const missingDecision = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {});
  assertProblem(missingDecision, 400, 'invalid-body');

  // 10.3 Non-existent constraint code returns 404 Problem Details
  const ghostConstraint = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/c999-ghost/review`, {
      decision: 'confirm',
    });
  assertProblem(ghostConstraint, 404, 'not-found');

  // 10.4 Student attempts to review submission -> 403 Forbidden
  const studentAttempt = await app
    .as('student_1')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {
      decision: 'overturn',
    });
  assertProblem(studentAttempt, 403, 'forbidden');

  // 10.5 TA of Class 2 (Bob) attempts to review Class 1 submission -> 404 Not Found (cross-tenant concealment)
  const crossTaAttempt = await app
    .as('ta_b')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {
      decision: 'confirm',
    });
  assertProblem(crossTaAttempt, 404, 'not-found');

  // 10.6 Valid adjudication: TA confirms constraint
  const confirmRes = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {
      decision: 'confirm',
    });
  assert.equal(confirmRes.status, 200);
  assert.equal(confirmRes.body.reviewStatus, 'confirmed');

  // 10.7 Re-review: TA can change mind from confirm to overturn
  const overturnRes = await app
    .as('ta_a')
    .post(`/api/submissions/${subId}/constraints/c1-unique/review`, {
      decision: 'overturn',
    });
  assert.equal(overturnRes.status, 200);
  assert.equal(overturnRes.body.reviewStatus, 'overturned');

  // 10.8 Legacy review route backward-compatibility check
  const legacyRes = await app.as('ta_a').post(`/api/submissions/${subId}/review`, {
    decision: 'confirm',
  });
  assert.equal(legacyRes.status, 200);
  assert.equal(legacyRes.body.decision, 'confirm');
});

// =============================================================================
// WORKFLOW 11: CROSS-STUDENT PRIVACY & SUBMISSION ISOLATION
// =============================================================================
test('Workflow 11: Cross-Student Privacy, Tenant Isolation & Source Code Protection', async () => {
  const labRes = await app.as('ta_a').post('/api/labs', {
    title: 'Privacy Verification Lab',
    statement: 'Statement',
    testCases: [{ input: '1', expectedOutput: '1' }],
    constraints: [{ code: 'c1-privacy', text: 'Privacy test constraint', deduction: 10 }],
  });
  const labId = labRes.body.id;

  // Student 1 submits secret code
  const sub1 = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: '// TOP_SECRET_ALGORITHM_STUDENT_1\nint solve() { return 42; }',
  });
  const sub1Id = sub1.body.id;

  // Create Student 2 in Class 1
  const student2Login = await app.as('admin').post('/api/users', {
    username: 'student_2_private',
    name: 'Student Two',
    password: 'password123',
    role: 'student',
    classId: 1,
  });
  assert.equal(student2Login.status, 201);
  const stu2Token = student2Login.body.user.token;

  // 11.1 Student 2 attempts to inspect Student 1's submission -> returns 404 Not Found (NOT 200, NOT 403)
  const eavesdrop = await app.as({ token: stu2Token }).get(`/api/submissions/${sub1Id}`);
  assertProblem(eavesdrop, 404, 'not-found');

  // 11.2 Student 2 lists submissions for the lab -> returns only their own submissions (0 items)
  const stu2List = await app.as({ token: stu2Token }).get(`/api/labs/${labId}/submissions`);
  assert.equal(stu2List.status, 200);
  assert.deepEqual(stu2List.body.items, []);

  // 11.3 Student 1 inspects their own submission: strictly gets student projection
  const stu1View = await app.as('student_1').get(`/api/submissions/${sub1Id}`);
  assert.equal(stu1View.status, 200);
  assert.equal(stu1View.body.id, sub1Id);
  assert.equal(
    stu1View.body.sourceCode,
    undefined,
    'Student projection must never echo raw sourceCode',
  );
  assert.equal(stu1View.body.studentId, undefined, 'Student projection must omit studentId');

  // 11.4 Staff (TA Alice) inspects Student 1's submission: receives full operational metadata
  const staffView = await app.as('ta_a').get(`/api/submissions/${sub1Id}`);
  assert.equal(staffView.status, 200);
  assert.equal(staffView.body.id, sub1Id);
  assert.equal(staffView.body.studentId, 4); // student_1 seed ID
  assert.ok(staffView.body.createdAt);
});

// =============================================================================
// WORKFLOW 12: ADMIN USER DIRECTORY, CREATION VALIDATION & NON-LEAKAGE
// =============================================================================
test('Workflow 12: Admin User Directory, Creation Validation & Non-Leakage', async () => {
  // 12.1 Non-admin cannot list user directory (403)
  const forbiddenList = await app.as('student_1').get('/api/users');
  assertProblem(forbiddenList, 403, 'forbidden');

  const taForbiddenList = await app.as('ta_a').get('/api/users');
  assertProblem(taForbiddenList, 403, 'forbidden');

  // 12.2 Admin lists users and verifies password hashes are never leaked
  const adminList = await app.as('admin').get('/api/users');
  assert.equal(adminList.status, 200);
  assert.ok(Array.isArray(adminList.body.items));
  for (const user of adminList.body.items) {
    assert.equal(user.passwordHash, undefined, 'User directory must never leak passwordHash');
    assert.equal(user.password, undefined, 'User directory must never leak password');
    assert.equal(user.salt, undefined, 'User directory must never leak salt');
  }

  // 12.3 Admin creates valid new teacher
  const createTaRes = await app.as('admin').post('/api/users', {
    username: 'ta_delta_2026',
    name: 'Delta Assistant',
    password: 'securePassword2026!',
    role: 'ta',
    classId: 1,
  });
  assert.equal(createTaRes.status, 201);
  assert.equal(createTaRes.body.user.username, 'ta_delta_2026');
  assert.equal(createTaRes.body.user.role, 'ta');

  // 12.4 Duplicate username creation fails with 409 Conflict
  const dupRes = await app.as('admin').post('/api/users', {
    username: 'ta_delta_2026',
    name: 'Duplicate Assistant',
    password: 'password123',
    role: 'ta',
  });
  assertProblem(dupRes, 409, 'conflict');

  // 12.5 Invalid role fails with 400 Problem Details
  const badRoleRes = await app.as('admin').post('/api/users', {
    username: 'super_hacker',
    name: 'Invalid Role',
    password: 'password123',
    role: 'superadmin',
  });
  assertProblem(badRoleRes, 400, 'invalid-body');

  // 12.6 Too short password (< 6 chars) fails with 400 Problem Details
  const shortPwRes = await app.as('admin').post('/api/users', {
    username: 'short_pass_user',
    name: 'Short Password',
    password: '123',
    role: 'student',
  });
  assertProblem(shortPwRes, 400, 'invalid-body');

  // 12.7 Invalid username format (spaces or symbols) fails with 400 Problem Details
  const badUsernameRes = await app.as('admin').post('/api/users', {
    username: 'bad user name!',
    name: 'Bad Name',
    password: 'password123',
    role: 'student',
  });
  assertProblem(badUsernameRes, 400, 'invalid-body');
});

// =============================================================================
// WORKFLOW 13: UTF-8 & SPECIAL CHARACTERS RESILIENCE
// =============================================================================
test('Workflow 13: Vietnamese UTF-8, Markdown Statements & Special Characters Integrity', async () => {
  // 13.1 Author lab with rich Vietnamese markdown and emoji
  const viTitle = 'Bài tập 4: Quy hoạch động dãy con tăng dài nhất 🚀🇻🇳';
  const viStatement = `
# Yêu cầu đề bài
Cho một dãy số nguyên gồm $N$ phần tử:
- Hãy tìm độ dài dãy con tăng dài nhất.
- **Ràng buộc:** Không sử dụng thư viện \`<algorithm>\` hoặc hàm \`std::sort\`.
- Chú ý: Hỗ trợ tiếng Việt có dấu đầy đủ và các ký tự đặc biệt như \`&<>"'/\`.
`;
  const labRes = await app.as('ta_a').post('/api/labs', {
    title: viTitle,
    statement: viStatement,
    testCases: [
      { input: '5\n10 22 9 33 21', expectedOutput: '3' },
      { input: '6\n50 3 10 7 40 80', expectedOutput: '4' },
    ],
    constraints: [{ code: 'c1-no-std-sort', text: 'Nghiêm cấm dùng std::sort', deduction: 25 }],
  });
  assert.equal(labRes.status, 201);
  const labId = labRes.body.id;

  // Verify statement retrieved matches exactly with no character corruption
  const labDetail = await app.as('ta_a').get(`/api/labs/${labId}`);
  assert.equal(labDetail.status, 200);
  assert.equal(labDetail.body.title, viTitle);
  assert.equal(labDetail.body.statement, viStatement.trim());

  // 13.2 Student submits code with Vietnamese comments and string literals
  const viCode = `
// Chương trình giải bài toán Dãy con tăng dài nhất
// Sinh viên: Nguyễn Văn A - Lớp CS101 🌟
#include <iostream>
int main() {
    std::cout << "Xin chào Việt Nam! 🇻🇳" << std::endl;
    return 0;
}
`;
  const subRes = await app.as('student_1').post(`/api/labs/${labId}/submissions`, {
    code: viCode,
  });
  assert.equal(subRes.status, 202);
  const subId = subRes.body.id;

  // Verify in database that UTF-8 content is preserved exactly
  const row = app.db.prepare('SELECT source_code FROM submissions WHERE id = ?').get(subId);
  assert.equal(row.source_code, viCode);
});

// =============================================================================
// WORKFLOW 14: SYSTEM HEALTH, INTROSPECTION & OPENAPI VERIFICATION
// =============================================================================
test('Workflow 14: System Health, Introspection & OpenAPI Spec Contract', async () => {
  // 14.1 GET /api/health returns healthy status, database WAL mode and uptime
  const healthRes = await app.as(null).get('/api/health');
  assert.equal(healthRes.status, 200);
  assert.equal(healthRes.body.status, 'healthy');
  assert.equal(healthRes.body.database?.mode, 'WAL');
  assert.ok(healthRes.body.timestamp);
  assert.ok(typeof healthRes.body.uptimeSeconds === 'number');

  // 14.2 GET /healthz alias probe works identically
  const healthzRes = await app.as(null).get('/healthz');
  assert.equal(healthzRes.status, 200);
  assert.equal(healthzRes.body.status, 'healthy');

  // 14.3 GET /api/openapi.json returns valid OpenAPI 3.1.0 document
  const openapiRes = await app.as(null).get('/api/openapi.json');
  assert.equal(openapiRes.status, 200);
  assert.equal(openapiRes.body.openapi, '3.1.0');
  assert.equal(openapiRes.body.info.title, 'LeeTKOB PA3 API');
  assert.ok(openapiRes.body.paths['/api/login']);
  assert.ok(openapiRes.body.paths['/api/labs']);
  assert.ok(openapiRes.body.paths['/api/labs/{labId}/submissions']);
  assert.ok(openapiRes.body.paths['/api/submissions/{submissionId}/constraints/{code}/review']);
  assert.ok(openapiRes.body.paths['/api/health']);

  // 14.4 GET /api/docs returns interactive HTML document
  const docsRes = await app.as(null).get('/api/docs');
  assert.equal(docsRes.status, 200);
  assert.match(docsRes.type, /text\/html/);
  assert.ok(docsRes.body === undefined); // HTML text, not json
});
