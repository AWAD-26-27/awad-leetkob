import test from 'node:test';
import assert from 'node:assert/strict';
import { open } from '../../src/db.js';
import { createApp } from '../../src/app.js';

function createClient(app) {
  return async function request(path, { method = 'GET', headers = {}, body } = {}) {
    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}${path}`;
        const reqOpts = {
          method,
          headers: {
            ...headers,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
        };

        const fetchPromise = body
          ? fetch(url, { ...reqOpts, body: JSON.stringify(body) })
          : fetch(url, reqOpts);

        fetchPromise
          .then(async (res) => {
            const contentType = res.headers.get('content-type') || '';
            let data = null;
            if (contentType.includes('json')) {
              data = await res.json();
            } else {
              data = await res.text();
            }
            server.close(() => resolve({ status: res.status, headers: res.headers, data }));
          })
          .catch((err) => {
            server.close(() => reject(err));
          });
      });
    });
  };
}

test('Giai đoạn 4 - E2E 8-Step Full Lifecycle Verification', async (t) => {
  const db = open(); // In-memory database with classes, users, legacy labs
  const app = createApp(db);
  const req = createClient(app);

  let createdLabId;
  let submissionId;

  // Step 1: Initial State (TA Alice of Class 1 loads initial labs and queue)
  await t.test('Step 1: TA Alice loads Class A initial labs and review queue', async () => {
    const resMe = await req('/api/me', {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(resMe.status, 200);
    assert.equal(resMe.data.role, 'ta');
    assert.equal(resMe.data.classId, 1);

    const resLabs = await req('/api/labs', {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(resLabs.status, 200);
    assert.ok(Array.isArray(resLabs.data.items));

    // Lab 1 seeded from legacy
    const resQueue = await req('/api/labs/1/queue', {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(resQueue.status, 200);
    assert.ok(Array.isArray(resQueue.data.items));
  });

  // Step 2: Lab Creation by TA Alice with test cases and constraints
  await t.test('Step 2: TA Alice creates Lab 2 with test cases and constraints', async () => {
    const newLabData = {
      title: 'Lab 2: Array Sorting & Dynamic Memory',
      statement: 'Implement an in-place sort algorithm without using recursion or std::sort.',
      testCases: [
        { ordinal: 1, inputText: '5\n4 2 5 1 3\n', expectedOutput: '1 2 3 4 5\n' },
        { ordinal: 2, inputText: '3\n3 2 1\n', expectedOutput: '1 2 3\n' },
      ],
      constraints: [
        { code: 'C1', text: 'Do not use std::sort or quicksort', deduction: 3.0 },
        { code: 'C2', text: 'Do not use recursion', deduction: 2.0 },
      ],
    };

    const res = await req('/api/labs', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-a' },
      body: newLabData,
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.id, 'Lab ID must be returned');
    assert.equal(res.data.classId, 1);
    createdLabId = res.data.id;

    // Verify lab is retrieved with all constraints
    const resGet = await req(`/api/labs/${createdLabId}`, {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(resGet.status, 200);
    assert.equal(resGet.data.title, newLabData.title);
  });

  // Step 3: Role Switching (Student 1 in Class 1 logs in and views lab)
  await t.test('Step 3: Student 1 switches in and views Lab 2', async () => {
    const resMe = await req('/api/me', {
      headers: { Authorization: 'Bearer tok-student-1' },
    });
    assert.equal(resMe.status, 200);
    assert.equal(resMe.data.role, 'student');
    assert.equal(resMe.data.classId, 1);

    const resLab = await req(`/api/labs/${createdLabId}`, {
      headers: { Authorization: 'Bearer tok-student-1' },
    });
    assert.equal(resLab.status, 200);
    assert.equal(resLab.data.id, createdLabId);
  });

  // Step 4: Code Submission (Student 1 submits C++ solution -> 202 Queued)
  await t.test('Step 4: Student 1 submits solution, receives 202 Queued', async () => {
    const solutionCode = `#include <iostream>
int main() {
    std::cout << "1 2 3 4 5\\n";
    return 0;
}`;

    const res = await req(`/api/labs/${createdLabId}/submissions`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-student-1' },
      body: { code: solutionCode },
    });

    assert.equal(res.status, 202, 'Must return 202 Accepted');
    assert.ok(res.data.id, 'Submission ID must be generated');
    assert.equal(res.data.status, 'queued');
    submissionId = res.data.id;

    // Verify submission row and job row are created in SQLite
    const subRow = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId);
    assert.ok(subRow);
    assert.equal(subRow.status, 'queued');

    const jobRow = db.prepare('SELECT * FROM jobs WHERE submission_id = ?').get(submissionId);
    assert.ok(jobRow);
    assert.equal(jobRow.status, 'queued');
  });

  // Step 5: Worker Simulation & Check Status (Worker updates verdicts; Student verifies FAQ privacy)
  await t.test('Step 5: Worker simulates run; Student verifies strict FAQ privacy', async () => {
    // Simulate Worker execution:
    // Update submission to judged: Accepted (per CHECK constraint)
    db.prepare(
      `
      UPDATE submissions
      SET status = 'judged', judge_verdict = 'Accepted', judged_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(submissionId);

    // Look up constraint ids for Lab 2
    const c1 = db
      .prepare('SELECT id FROM constraints WHERE lab_id = ? AND code = ?')
      .get(createdLabId, 'C1');
    const c2 = db
      .prepare('SELECT id FROM constraints WHERE lab_id = ? AND code = ?')
      .get(createdLabId, 'C2');

    // Worker records 1 violation (C1) and 1 pass (C2)
    db.prepare(
      `
      INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
      VALUES (?, ?, 'violation', ?, 'hard_rule', 'pending')
    `,
    ).run(submissionId, c1.id, JSON.stringify({ snippet: 'std::sort call found at line 14' }));

    db.prepare(
      `
      INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, source, review_status)
      VALUES (?, ?, 'pass', 'hard_rule', 'confirmed')
    `,
    ).run(submissionId, c2.id);

    // Student checks status: MUST NOT LEAK constraint details or evidence
    const resSub = await req(`/api/submissions/${submissionId}`, {
      headers: { Authorization: 'Bearer tok-student-1' },
    });
    assert.equal(resSub.status, 200);
    assert.equal(resSub.data.id, submissionId);
    assert.equal(resSub.data.status, 'judged');
    assert.equal(resSub.data.judgeVerdict, 'Accepted');

    // Strict FAQ Invariant checks:
    assert.equal(resSub.data.verdicts, undefined, 'Student must not see verdicts');
    assert.equal(resSub.data.constraints, undefined, 'Student must not see constraints');
    assert.equal(resSub.data.evidence, undefined, 'Student must not see evidence');
    assert.equal(resSub.data.deductions, undefined, 'Student must not see deductions');
  });

  // Step 6: Review Queue (TA Alice inspects evidence and reviews constraint)
  await t.test('Step 6: TA Alice inspects review queue and confirms constraint', async () => {
    const resQueue = await req(`/api/labs/${createdLabId}/queue`, {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(resQueue.status, 200);
    assert.equal(resQueue.data.items.length, 2, 'Should have 2 constraint items for Lab 2');

    const itemC1 = resQueue.data.items.find((i) => i.constraint === 'C1');
    assert.ok(itemC1);
    assert.equal(itemC1.verdict, 'violation');
    assert.equal(itemC1.reviewStatus, 'pending');
    assert.ok(itemC1.evidence);

    // TA confirms the C1 violation
    const resReview = await req(`/api/submissions/${submissionId}/constraints/C1/review`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-a' },
      body: { decision: 'confirm' },
    });
    assert.equal(resReview.status, 200);
    assert.equal(resReview.data.reviewStatus, 'confirmed');

    // Queue should now show C1 as confirmed
    const resQueueAfter = await req(`/api/labs/${createdLabId}/queue`, {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    const reviewedC1 = resQueueAfter.data.items.find((i) => i.constraint === 'C1');
    assert.equal(reviewedC1.reviewStatus, 'confirmed');
  });

  // Step 7: Publishing Lab (TA publishes grades successfully)
  await t.test('Step 7: TA Alice publishes Lab 2 grades', async () => {
    const resPub = await req(`/api/labs/${createdLabId}/publish`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-a' },
    });

    assert.equal(resPub.status, 200);
    assert.ok(resPub.data.publishedAt);

    // Lab details now indicate publishedAt
    const resLab = await req(`/api/labs/${createdLabId}`, {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.ok(resLab.data.publishedAt);
  });

  // Step 8: Cross-Class Isolation Verification (TA Bob & Student of Class 2 receive 404)
  await t.test('Step 8: Cross-class isolation strictly returns 404', async () => {
    // TA Bob is Class 2 staff
    const resTaB = await req(`/api/labs/${createdLabId}`, {
      headers: { Authorization: 'Bearer tok-ta-b' },
    });
    assert.equal(resTaB.status, 404, 'TA of another class must receive 404');
    assert.equal(resTaB.data.title, 'No such lab');

    // TA Bob cannot view queue of Lab 2
    const resQueueBob = await req(`/api/labs/${createdLabId}/queue`, {
      headers: { Authorization: 'Bearer tok-ta-b' },
    });
    assert.equal(resQueueBob.status, 404, 'TA of another class cannot view queue (404)');

    // TA Bob cannot publish Lab 2
    const resPubBob = await req(`/api/labs/${createdLabId}/publish`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-b' },
    });
    assert.equal(resPubBob.status, 404, 'TA of another class cannot publish (404)');

    // Student of Class 2 (stu3) receives 404
    const resStu3 = await req(`/api/labs/${createdLabId}`, {
      headers: { Authorization: 'Bearer tok-stu3' },
    });
    assert.equal(resStu3.status, 404, 'Student of another class must receive 404');
  });
});
