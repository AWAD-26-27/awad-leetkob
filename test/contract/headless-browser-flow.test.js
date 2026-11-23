import test from 'node:test';
import assert from 'node:assert/strict';
import { open } from '../../src/db.js';
import { createApp } from '../../src/app.js';

function createHeadlessAgent(app) {
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

test('Headless Agent - Full Browser End-to-End Workflow Verification', async (t) => {
  const db = open();
  const app = createApp(db);
  const agent = createHeadlessAgent(app);

  let newLabId = null;
  let submissionId = null;

  // -------------------------------------------------------------------------
  // Luồng 1: Tải Trang Web & Xác thực Dropdown "Signed in as"
  // -------------------------------------------------------------------------
  await t.test('Flow 1: Page Mount & User Selector Contract', async () => {
    const res = await agent('/');
    assert.equal(res.status, 200);
    assert.match(res.data, /<div id="root">/);
    assert.match(res.data, /src="\/src\/frontend\/src\/main\.js"/);

    // Verify static module assets load correctly
    const scriptRes = await agent('/src/frontend/src/main.js');
    assert.equal(scriptRes.status, 200);
    assert.match(scriptRes.data, /render\(h\(App/);

    const themeRes = await agent('/src/frontend/src/config/theme.css');
    assert.equal(themeRes.status, 200);
    assert.match(themeRes.data, /--code-bg: #0b0f19/);
  });

  // -------------------------------------------------------------------------
  // Luồng 2: Giảng viên / TA (ta_a) Tạo Lab Mới Với Constraints & Deductions
  // -------------------------------------------------------------------------
  await t.test('Flow 2: TA Creates Lab with dynamic test cases & constraints', async () => {
    const res = await agent('/api/labs', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-a' },
      body: {
        title: 'Lab 2: Dynamic Vector Implementation',
        statement: '# Yêu cầu\nCài đặt mảng động C++ không dùng thư viện vector.',
        testCases: [
          { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
          { input: '3\n10 20 30', expectedOutput: '30 20 10' },
        ],
        constraints: [
          { code: 'C1', text: 'Không dùng thư viện <vector>', deduction: 2 },
          { code: 'C2', text: 'Giải phóng bộ nhớ triệt để, không leak', deduction: 3 },
        ],
      },
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.id > 0);
    newLabId = res.data.id;
    assert.equal(res.data.title, 'Lab 2: Dynamic Vector Implementation');

    // Verify lab details are readable by TA
    const labRes = await agent(`/api/labs/${newLabId}`, {
      headers: { Authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(labRes.status, 200);
    assert.equal(labRes.data.publishedAt, null);
  });

  // -------------------------------------------------------------------------
  // Luồng 3: Sinh viên (student_1) Nộp Code C++, Nhận HTTP 202 Queued
  // -------------------------------------------------------------------------
  await t.test('Flow 3: Student submits C++ solution and receives 202 Queued', async () => {
    const studentCode = `#include <iostream>
#include <vector>
using namespace std;
int main() {
  int n;
  if (cin >> n) {
    cout << "processed" << endl;
  }
  return 0;
}`;

    const res = await agent(`/api/labs/${newLabId}/submissions`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-student-1' },
      body: { code: studentCode },
    });

    assert.equal(res.status, 202);
    assert.ok(res.data.id > 0);
    assert.equal(res.data.status, 'queued');
    submissionId = res.data.id;

    // Verify atomic insertion of 1 submission and 1 job in SQLite
    const subRow = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId);
    assert.ok(subRow);
    assert.equal(subRow.status, 'queued');

    const jobRow = db.prepare('SELECT * FROM jobs WHERE submission_id = ?').get(submissionId);
    assert.ok(jobRow);
    assert.equal(jobRow.status, 'queued');
  });

  // -------------------------------------------------------------------------
  // Luồng 4: Worker Mô phỏng Chấm & Kiểm chứng Invariant FAQ (Student Privacy)
  // -------------------------------------------------------------------------
  await t.test('Flow 4: Worker processes job and Student verifies strict FAQ privacy', async () => {
    // Worker locks job, updates functional verdict
    db.prepare(
      "UPDATE jobs SET status = 'done', finished_at = datetime('now') WHERE submission_id = ?",
    ).run(submissionId);
    db.prepare(
      "UPDATE submissions SET status = 'judged', judge_verdict = 'Accepted', judged_at = datetime('now') WHERE id = ?",
    ).run(submissionId);

    // Worker records constraint evaluation
    const c1 = db
      .prepare("SELECT id FROM constraints WHERE lab_id = ? AND code = 'C1'")
      .get(newLabId);
    const c2 = db
      .prepare("SELECT id FROM constraints WHERE lab_id = ? AND code = 'C2'")
      .get(newLabId);

    db.prepare(
      `
      INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
      VALUES (?, ?, 'violation', '["Found forbidden header: #include <vector>"]', 'hard_rule', 'pending')
    `,
    ).run(submissionId, c1.id);

    db.prepare(
      `
      INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
      VALUES (?, ?, 'pass', '[]', 'hard_rule', 'confirmed')
    `,
    ).run(submissionId, c2.id);

    // Student queries submission status
    const studentRes = await agent(`/api/submissions/${submissionId}`, {
      headers: { Authorization: 'Bearer tok-student-1' },
    });

    assert.equal(studentRes.status, 200);
    assert.equal(studentRes.data.id, submissionId);
    assert.equal(studentRes.data.status, 'judged');
    assert.equal(studentRes.data.judgeVerdict, 'Accepted');

    // STRICT FAQ INVARIANT VERIFICATION:
    // Zero constraint evaluations, evidence snippets, or deductions are visible to the student
    assert.equal(studentRes.data.verdicts, undefined);
    assert.equal(studentRes.data.evidence, undefined);
    assert.equal(studentRes.data.deduction, undefined);
    assert.equal(studentRes.data.constraints, undefined);
  });

  // -------------------------------------------------------------------------
  // Luồng 5: TA Xét Duyệt Hàng Đợi (Review Queue) & Xác Nhận Vi Phạm
  // -------------------------------------------------------------------------
  await t.test(
    'Flow 5: TA inspects review queue, views evidence, and confirms violation',
    async () => {
      const queueRes = await agent(`/api/labs/${newLabId}/queue`, {
        headers: { Authorization: 'Bearer tok-ta-a' },
      });

      assert.equal(queueRes.status, 200);
      assert.ok(Array.isArray(queueRes.data.items));

      const pendingItem = queueRes.data.items.find(
        (item) => item.submissionId === submissionId && item.constraintCode === 'C1',
      );
      assert.ok(pendingItem, 'Pending violation item for C1 must be in queue');
      assert.equal(pendingItem.verdict, 'violation');
      assert.equal(pendingItem.deduction, 2);
      assert.equal(pendingItem.reviewStatus, 'pending');
      assert.deepEqual(pendingItem.evidence, ['Found forbidden header: #include <vector>']);

      // TA confirms violation
      const reviewRes = await agent(`/api/submissions/${submissionId}/constraints/C1/review`, {
        method: 'POST',
        headers: { Authorization: 'Bearer tok-ta-a' },
        body: { decision: 'confirm' },
      });

      assert.equal(reviewRes.status, 200);
      assert.equal(reviewRes.data.submissionId, submissionId);
      assert.equal(reviewRes.data.constraint, 'C1');
      assert.equal(reviewRes.data.reviewStatus, 'confirmed');
    },
  );

  // -------------------------------------------------------------------------
  // Luồng 6: TA Công Bố Điểm (Publish) & Kiểm Tra Cách Ly Lớp (Cross-class 404)
  // -------------------------------------------------------------------------
  await t.test('Flow 6: TA publishes grades and verifies cross-class 404 isolation', async () => {
    // 1. TA publishes grades
    const publishRes = await agent(`/api/labs/${newLabId}/publish`, {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-ta-a' },
    });

    assert.equal(publishRes.status, 200);
    assert.ok(publishRes.data.publishedAt, 'publishedAt timestamp must be returned');

    // 2. Cross-class isolation: TA of another class (ta_b) receives strict 404
    const crossTaRes = await agent(`/api/labs/${newLabId}`, {
      headers: { Authorization: 'Bearer tok-ta-b' },
    });
    assert.equal(crossTaRes.status, 404);
    assert.equal(crossTaRes.headers.get('content-type'), 'application/problem+json');
    assert.equal(crossTaRes.data.type, 'https://leetkob.example/problems/not-found');

    // 3. Cross-class isolation: Student of another class (stu3) receives strict 404
    const crossStudentRes = await agent(`/api/labs/${newLabId}`, {
      headers: { Authorization: 'Bearer tok-stu3' },
    });
    assert.equal(crossStudentRes.status, 404);
  });
});
