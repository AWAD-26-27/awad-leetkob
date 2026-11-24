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

test('Admin Role: can create teacher and student accounts, create class, and assign teacher', async () => {
  // 1. Non-admin cannot create users -> 403
  assertProblem(
    await app.as('ta_a').post('/api/users', {
      username: 'new_teacher',
      name: 'New Teacher',
      password: 'password123',
      role: 'ta',
    }),
    403,
    'forbidden',
  );

  assertProblem(
    await app.as('student_1').post('/api/users', {
      username: 'new_student',
      name: 'New Student',
      password: 'password123',
      role: 'student',
    }),
    403,
    'forbidden',
  );

  // 2. Admin creates teacher account -> 201
  const rTeacher = await app.as('admin').post('/api/users', {
    username: 'teacher_c',
    name: 'Prof. Charlie',
    password: 'password123',
    role: 'ta',
  });
  assert.equal(rTeacher.status, 201);
  assert.equal(rTeacher.body.user.username, 'teacher_c');
  assert.equal(rTeacher.body.user.role, 'ta');
  assert.equal(rTeacher.body.user.classId, null);
  const teacherId = rTeacher.body.user.id;

  // 3. Admin creates student account -> 201
  const rStudent = await app.as('admin').post('/api/users', {
    username: 'student_99',
    name: 'Student 99',
    password: 'password123',
    role: 'student',
  });
  assert.equal(rStudent.status, 201);
  assert.equal(rStudent.body.user.username, 'student_99');
  assert.equal(rStudent.body.user.role, 'student');
  assert.equal(rStudent.body.user.classId, null);
  const studentId = rStudent.body.user.id;
  assert.ok(studentId > 0);

  // 4. Duplicate username rejected -> 409
  const rDup = await app.as('admin').post('/api/users', {
    username: 'teacher_c',
    name: 'Duplicate',
    password: 'password123',
    role: 'ta',
  });
  assertProblem(rDup, 409, 'conflict');

  // 5. Non-admin cannot create class -> 403
  assertProblem(
    await app.as('ta_a').post('/api/classes', { name: 'Class C' }),
    403,
    'forbidden',
  );

  // 6. Admin creates new class -> 201
  const rClass = await app.as('admin').post('/api/classes', { name: 'Class C' });
  assert.equal(rClass.status, 201);
  assert.equal(rClass.body.class.name, 'Class C');
  const classId = rClass.body.class.id;

  // 7. Non-admin cannot assign teacher -> 403
  assertProblem(
    await app.as('ta_a').post(`/api/classes/${classId}/teachers`, { teacherId }),
    403,
    'forbidden',
  );

  // 8. Admin assigns teacher to class -> 200
  const rAssign = await app.as('admin').post(`/api/classes/${classId}/teachers`, { teacherId });
  assert.equal(rAssign.status, 200);

  // 9. Verify class list reflects newly assigned teacher
  const rClasses = await app.as('admin').get('/api/classes');
  assert.equal(rClasses.status, 200);
  const foundClass = rClasses.body.items.find((c) => c.id === classId);
  assert.ok(foundClass);
  assert.equal(foundClass.teachers.length, 1);
  assert.equal(foundClass.teachers[0].username, 'teacher_c');

  // 10. Newly created teacher and student can log in with their credentials
  const rTeacherLogin = await app.as(null).post('/api/login', {
    username: 'teacher_c',
    password: 'password123',
  });
  assert.equal(rTeacherLogin.status, 200);
  assert.equal(rTeacherLogin.body.user.classId, classId);

  const rStudentLogin = await app.as(null).post('/api/login', {
    username: 'student_99',
    password: 'password123',
  });
  assert.equal(rStudentLogin.status, 200);
  assert.equal(rStudentLogin.body.user.role, 'student');
});

test('Teacher Role: can assign and remove student from their own class; other teachers receive 403', async () => {
  // Setup: create unassigned student
  const rStudent = await app.as('admin').post('/api/users', {
    username: 'student_roster',
    name: 'Student Roster',
    password: 'password123',
    role: 'student',
  });
  assert.equal(rStudent.status, 201);
  const studentId = rStudent.body.user.id;

  // Class 1 (ta_a) and Class 2 (ta_b)
  // 1. ta_b cannot assign student to Class 1 -> 403 forbidden
  assertProblem(
    await app.as('ta_b').post('/api/classes/1/students', { studentId }),
    403,
    'forbidden',
  );

  // 2. ta_a assigns student to Class 1 -> 200
  const rAssign = await app.as('ta_a').post('/api/classes/1/students', { studentId });
  assert.equal(rAssign.status, 200);

  // 3. ta_a lists students of Class 1 -> contains student_roster
  const rList = await app.as('ta_a').get('/api/classes/1/students');
  assert.equal(rList.status, 200);
  const foundStu = rList.body.items.find((s) => s.id === studentId);
  assert.ok(foundStu);
  assert.equal(foundStu.username, 'student_roster');

  // 4. ta_b cannot remove student from Class 1 -> 403 forbidden
  assertProblem(
    await app.as('ta_b').delete(`/api/classes/1/students/${studentId}`),
    403,
    'forbidden',
  );

  // 5. ta_a removes student from Class 1 -> 200
  const rRemove = await app.as('ta_a').delete(`/api/classes/1/students/${studentId}`);
  assert.equal(rRemove.status, 200);

  // 6. Verify student is no longer in Class 1
  const rAfter = await app.as('ta_a').get('/api/classes/1/students');
  assert.equal(rAfter.status, 200);
  assert.equal(rAfter.body.items.some((s) => s.id === studentId), false);
});
