import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(async () => {
  if (app) await app.close();
});

test('Multi-class Teacher: 1 teacher can manage multiple classes', async () => {
  // ta_a is already assigned to Class 1 (Class A)
  // Admin assigns ta_a to Class 2 (Class B) as well
  const rAssign = await app.as('admin').post('/api/classes/2/teachers', { teacherId: 2 });
  assert.equal(rAssign.status, 200);

  // ta_a calls /api/my-classes -> must receive BOTH Class 1 and Class 2
  const rMyClasses = await app.as('ta_a').get('/api/my-classes');
  assert.equal(rMyClasses.status, 200);
  assert.ok(Array.isArray(rMyClasses.body.items));
  const classIds = rMyClasses.body.items.map((c) => c.id);
  assert.ok(classIds.includes(1), 'Must include Class 1');
  assert.ok(classIds.includes(2), 'Must include Class 2');

  // ta_a has access to Class 2 students
  const rClass2Students = await app.as('ta_a').get('/api/classes/2/students');
  assert.equal(rClass2Students.status, 200);
  assert.ok(Array.isArray(rClass2Students.body.items));

  // ta_a can create a lab for Class 2
  const rCreateLab = await app.as('ta_a').post('/api/labs', {
    classId: 2,
    title: 'Lab for Class B',
    statement: 'Implement binary search',
    testCases: [{ input: '3\n1 2 3\n2\n', expectedOutput: '1\n' }],
    constraints: [{ code: 'C1', text: 'No std::binary_search', deduction: 2 }],
  });
  assert.equal(rCreateLab.status, 201);
  assert.equal(rCreateLab.body.classId, 2);
});

test('Class Announcements: Teachers can post announcements and students can read them', async () => {
  // ta_a posts an announcement to Class 1
  const rPost = await app.as('ta_a').post('/api/classes/1/announcements', {
    title: 'Nộp bài Lab 1 đúng hạn',
    content:
      'Hạn chót nộp bài Lab 1 là 23h59 Chủ nhật tuần này. Vui lòng không dùng thư viện bị cấm.',
  });
  assert.equal(rPost.status, 201);
  assert.equal(rPost.body.announcement.title, 'Nộp bài Lab 1 đúng hạn');
  assert.equal(rPost.body.announcement.classId, 1);

  // student_1 of Class 1 reads announcements
  const rGetStu1 = await app.as('student_1').get('/api/classes/1/announcements');
  assert.equal(rGetStu1.status, 200);
  assert.ok(Array.isArray(rGetStu1.body.items));
  assert.equal(rGetStu1.body.items.length, 1);
  assert.equal(rGetStu1.body.items[0].title, 'Nộp bài Lab 1 đúng hạn');

  // student_1 cannot read announcements from Class 2 -> 403
  const rForbidden = await app.as('student_1').get('/api/classes/2/announcements');
  assert.equal(rForbidden.status, 403);
});

test('Lab Grade Roster: GET /api/labs/:labId/grades returns all students with submission counts and scores', async () => {
  // Query grades for Lab 1 (Class 1)
  const rGrades = await app.as('ta_a').get('/api/labs/1/grades');
  assert.equal(rGrades.status, 200);
  assert.equal(rGrades.body.labId, 1);
  assert.equal(rGrades.body.classId, 1);
  assert.ok(Array.isArray(rGrades.body.students));

  // Verify stu1 in Class 1 has submission count and details
  const stu1 = rGrades.body.students.find((s) => s.username === 'stu1');
  assert.ok(stu1, 'stu1 must be in class roster');
  assert.ok(stu1.submissionCount >= 1, 'stu1 must have at least 1 submission');
  assert.equal(stu1.latestStatus, 'Accepted');
  assert.equal(typeof stu1.score, 'number');

  // Verify unsubmitted students have submissionCount: 0 and score: null
  const unsubmitted = rGrades.body.students.find((s) => s.submissionCount === 0);
  if (unsubmitted) {
    assert.equal(unsubmitted.latestStatus, 'Chưa nộp');
    assert.equal(unsubmitted.score, null);
  }
});
