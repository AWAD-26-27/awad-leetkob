import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';
import { createWorker } from '../../src/worker.js';

let app;
beforeEach(async () => {
  app = await startApp(undefined, { seedUnassigned: false });
});
afterEach(async () => {
  if (app) await app.close();
});

test('Full Lifecycle: Admin creates class, teacher & 3 students; teacher creates 3 labs; 3 students submit to each lab; teacher reviews grades', async () => {
  // =========================================================================
  // 1. ADMIN CREATES A NEW CLASS
  // =========================================================================
  const createClassRes = await app.as('admin').post('/api/classes', {
    name: 'Lớp C++ Nâng Cao K23',
  });
  assert.equal(createClassRes.status, 201, 'Admin should be able to create class');
  assert.ok(createClassRes.body?.class?.id);
  const newClassId = createClassRes.body.class.id;
  assert.equal(createClassRes.body.class.name, 'Lớp C++ Nâng Cao K23');

  // =========================================================================
  // 2. ADMIN CREATES 1 TEACHER AND 3 STUDENTS IN THE NEW CLASS
  // =========================================================================
  // 2.1 Create Teacher
  const createTeacherRes = await app.as('admin').post('/api/users', {
    username: 'gv_nguyen',
    name: 'ThS. Nguyễn Văn C',
    password: 'password123',
    role: 'ta',
    classId: newClassId,
  });
  assert.equal(createTeacherRes.status, 201, 'Admin should create teacher account');
  const teacherId = createTeacherRes.body.user.id;
  assert.equal(createTeacherRes.body.user.username, 'gv_nguyen');
  assert.equal(createTeacherRes.body.user.role, 'ta');

  // Ensure teacher staff assignment
  await app.as('admin').post(`/api/classes/${newClassId}/teachers`, { teacherId });

  // 2.2 Create 3 Students
  const studentsData = [
    {
      username: 'sv_an',
      name: 'Trần Văn An',
      password: 'password123',
      role: 'student',
      classId: newClassId,
    },
    {
      username: 'sv_binh',
      name: 'Lê Thị Bình',
      password: 'password123',
      role: 'student',
      classId: newClassId,
    },
    {
      username: 'sv_cuong',
      name: 'Phạm Quốc Cường',
      password: 'password123',
      role: 'student',
      classId: newClassId,
    },
  ];

  const studentUsers = [];
  for (const s of studentsData) {
    const r = await app.as('admin').post('/api/users', s);
    assert.equal(r.status, 201, `Admin should create student ${s.username}`);
    studentUsers.push(r.body.user);
    // Explicitly enroll in class
    await app
      .as('admin')
      .post(`/api/classes/${newClassId}/students`, { studentId: r.body.user.id });
  }
  assert.equal(studentUsers.length, 3);

  // 2.3 Verify class roster
  const classDetailsRes = await app.as('admin').get(`/api/classes/${newClassId}`);
  assert.equal(classDetailsRes.status, 200);
  assert.equal(classDetailsRes.body.class.studentCount, 3);
  assert.ok(classDetailsRes.body.class.teachers.some((t) => t.username === 'gv_nguyen'));
  assert.equal(classDetailsRes.body.class.students.length, 3);

  // =========================================================================
  // 3. TEACHER (gv_nguyen) LOGS IN AND CREATES 3 LABS
  // =========================================================================
  // 3.1 Teacher checks assigned classes
  const teacherClassesRes = await app.as({ token: 'tok-gv-nguyen' }).get('/api/my-classes');
  assert.equal(teacherClassesRes.status, 200);
  assert.ok(teacherClassesRes.body.items.some((c) => c.id === newClassId));

  // 3.2 Teacher creates Lab 1
  const lab1Res = await app.as({ token: 'tok-gv-nguyen' }).post('/api/labs', {
    classId: newClassId,
    title: 'Lab 1: Tổng hai số nguyên',
    statement: '# Yêu cầu\nNhập hai số nguyên và in ra tổng của chúng.',
    testCases: [{ input: '3 5', output: '8' }],
    constraints: [{ code: 'C1', text: 'Do not call `std::min`.', deduction: 2 }],
  });
  assert.equal(lab1Res.status, 201, 'Teacher should create Lab 1');
  const lab1Id = lab1Res.body.id;

  // 3.3 Teacher creates Lab 2
  const lab2Res = await app.as({ token: 'tok-gv-nguyen' }).post('/api/labs', {
    classId: newClassId,
    title: 'Lab 2: Quản lý bộ nhớ mảng động',
    statement: '# Yêu cầu\nCài đặt mảng động không dùng std::vector.',
    testCases: [{ input: '3\n1 2 3', output: '1 2 3' }],
    constraints: [
      { code: 'C1', text: 'Do not include vector.', deduction: 3 },
      { code: 'C2', text: 'Do not leak memory.', deduction: 2 },
    ],
  });
  assert.equal(lab2Res.status, 201, 'Teacher should create Lab 2');
  const lab2Id = lab2Res.body.id;

  // 3.4 Teacher creates Lab 3
  const lab3Res = await app.as({ token: 'tok-gv-nguyen' }).post('/api/labs', {
    classId: newClassId,
    title: 'Lab 3: Đệ quy giải thuật',
    statement: '# Yêu cầu\nCài đặt đệ quy tính số Fibonacci.',
    testCases: [{ input: '5', output: '5' }],
    constraints: [{ code: 'C1', text: 'Use recursion.', deduction: 4 }],
  });
  assert.equal(lab3Res.status, 201, 'Teacher should create Lab 3');
  const lab3Id = lab3Res.body.id;

  // 3.5 Verify labs list for this class
  const labsListRes = await app
    .as({ token: 'tok-gv-nguyen' })
    .get(`/api/classes/${newClassId}/labs`);
  assert.equal(labsListRes.status, 200);
  assert.equal(labsListRes.body.items.length, 3);

  // =========================================================================
  // 4. 3 STUDENTS SUBMIT TO EACH OF THE 3 LABS (3 x 3 = 9 SUBMISSIONS)
  // =========================================================================
  const labsToSubmit = [lab1Id, lab2Id, lab3Id];
  const submissionIds = [];

  for (let sIdx = 0; sIdx < studentUsers.length; sIdx++) {
    const student = studentUsers[sIdx];
    const studentToken = `tok-${student.username.replace(/_/g, '-')}`;

    for (let lIdx = 0; lIdx < labsToSubmit.length; lIdx++) {
      const targetLabId = labsToSubmit[lIdx];

      // Prepare different code variations:
      // sv_binh calls std::min in Lab 1 to trigger constraint violation
      let code = `#include <iostream>\nint main() { std::cout << 8; return 0; }`;
      if (student.username === 'sv_binh' && targetLabId === lab1Id) {
        code = `#include <algorithm>\n#include <iostream>\nint main() { return std::min(0, 1); }`;
      } else if (student.username === 'sv_an' && targetLabId === lab2Id) {
        code = `#include <vector>\nint main() { std::vector<int> v; return 0; }`;
      }

      const subRes = await app
        .as({ token: studentToken })
        .post(`/api/labs/${targetLabId}/submissions`, {
          code,
        });
      assert.equal(
        subRes.status,
        202,
        `Student ${student.username} should submit to Lab ${targetLabId}`,
      );
      assert.equal(subRes.body.status, 'queued');
      submissionIds.push({
        id: subRes.body.id,
        studentId: student.id,
        username: student.username,
        labId: targetLabId,
      });
    }

    // Verify student can view their submission history in class without source code leakage
    const mySubmissionsRes = await app
      .as({ token: studentToken })
      .get(`/api/classes/${newClassId}/my-submissions`);
    assert.equal(mySubmissionsRes.status, 200);
    assert.equal(
      mySubmissionsRes.body.items.length,
      3,
      `${student.username} should have 3 submissions`,
    );
    for (const sub of mySubmissionsRes.body.items) {
      assert.equal(sub.code, undefined, 'code must NOT be exposed to student');
      assert.equal(sub.sourceCode, undefined, 'sourceCode must NOT be exposed to student');
    }
  }

  assert.equal(
    submissionIds.length,
    9,
    'Must have exactly 9 submissions across 3 students and 3 labs',
  );

  // =========================================================================
  // 5. CROSS-CLASS ISOLATION VERIFICATION
  // =========================================================================
  // Student 1 from Class A (Class 1) tries to submit to Lab in Class C -> 404
  const foreignSubRes = await app.as('student_1').post(`/api/labs/${lab1Id}/submissions`, {
    code: 'int main() { return 0; }',
  });
  assert.equal(foreignSubRes.status, 404, 'Foreign student must receive 404');

  // Teacher from Class B (ta_b) tries to access Class C review queue -> 404
  const foreignTaRes = await app.as('ta_b').get(`/api/labs/${lab1Id}/queue`);
  assert.equal(foreignTaRes.status, 404, 'Foreign TA must receive 404');

  // =========================================================================
  // 6. PROCESS 9 SUBMISSIONS VIA WORKER (EVALUATION & AST CHECKER)
  // =========================================================================
  const worker = createWorker({
    db: app.db,
    judge: async () => ({ verdict: 'Accepted', detail: 'OK' }),
    modelOff: true,
  });

  for (let i = 0; i < 9; i++) {
    const ran = await worker.runOnce();
    assert.ok(ran, `Worker should process submission #${i + 1}`);
  }

  // =========================================================================
  // 7. TEACHER REVIEWS SUBMISSION RESULTS & GRADES
  // =========================================================================
  // 7.1 Inspect Lab 1 Grades Roster
  const gradesLab1Res = await app.as({ token: 'tok-gv-nguyen' }).get(`/api/labs/${lab1Id}/grades`);
  assert.equal(gradesLab1Res.status, 200, 'Teacher should inspect lab 1 grades');
  assert.ok(Array.isArray(gradesLab1Res.body.students));
  assert.equal(gradesLab1Res.body.students.length, 3, 'All 3 students should be in grade roster');

  // Check sv_binh's submission (violated C1 std::min)
  const binhGrade = gradesLab1Res.body.students.find((s) => s.username === 'sv_binh');
  assert.ok(binhGrade, 'sv_binh must exist in grade roster');
  assert.equal(binhGrade.submissionCount, 1);
  assert.equal(binhGrade.judgeVerdict, 'Accepted');
  assert.equal(binhGrade.score, 8, 'Score should be 10 - 2 = 8');
  assert.equal(binhGrade.totalDeductions, 2);

  // Check sv_an's submission (no violation)
  const anGrade = gradesLab1Res.body.students.find((s) => s.username === 'sv_an');
  assert.ok(anGrade);
  assert.equal(anGrade.judgeVerdict, 'Accepted');
  assert.equal(anGrade.score, 10);

  // 7.2 Inspect Review Queue for Lab 1
  const queueLab1Res = await app.as({ token: 'tok-gv-nguyen' }).get(`/api/labs/${lab1Id}/queue`);
  assert.equal(queueLab1Res.status, 200);
  assert.ok(Array.isArray(queueLab1Res.body.items));

  // Find the submission of sv_binh in the review queue
  const binhQueueItem = queueLab1Res.body.items.find(
    (item) => item.student === 'sv_binh' && item.verdict === 'violation',
  );
  assert.ok(binhQueueItem, 'Violation should appear in review queue for TA');

  // Teacher confirms C1 violation for sv_binh
  const reviewRes = await app
    .as({ token: 'tok-gv-nguyen' })
    .post(
      `/api/submissions/${binhQueueItem.submissionId || binhQueueItem.id}/constraints/C1/review`,
      { decision: 'confirm' },
    );
  assert.equal(reviewRes.status, 200, 'Teacher should confirm violation');

  // 7.3 Teacher publishes Lab 1
  const publishLab1Res = await app
    .as({ token: 'tok-gv-nguyen' })
    .post(`/api/labs/${lab1Id}/publish`);
  assert.equal(publishLab1Res.status, 200, 'Teacher should publish Lab 1');
  assert.ok(publishLab1Res.body.publishedAt);

  // 7.4 Verify students now see their published grades
  const binhSubmissionsAfterPublish = await app
    .as({ token: 'tok-sv-binh' })
    .get(`/api/classes/${newClassId}/my-submissions`);
  assert.equal(binhSubmissionsAfterPublish.status, 200);
  const binhLab1Sub = binhSubmissionsAfterPublish.body.items.find((s) => s.labId === lab1Id);
  assert.ok(binhLab1Sub);
  assert.equal(binhLab1Sub.grade, 8, 'sv_binh should see published grade of 8');

  // 7.5 Inspect Lab 2 and Lab 3 Grades
  const gradesLab2Res = await app.as({ token: 'tok-gv-nguyen' }).get(`/api/labs/${lab2Id}/grades`);
  assert.equal(gradesLab2Res.status, 200);
  assert.equal(gradesLab2Res.body.students.length, 3);

  const gradesLab3Res = await app.as({ token: 'tok-gv-nguyen' }).get(`/api/labs/${lab3Id}/grades`);
  assert.equal(gradesLab3Res.status, 200);
  assert.equal(gradesLab3Res.body.students.length, 3);
});
