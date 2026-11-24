import test from 'node:test';
import assert from 'node:assert/strict';
import { open, resetDatabase } from '../../src/backend/db.js';
import { createApp } from '../../src/backend/app.js';

test('Admin Portal - Unassigned Seed, Reset DB, Class Rostering & Lab Inspection', async (t) => {
  const db = open({ seedUnassigned: true });
  const app = createApp(db);

  function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}${path}`;
        fetch(url, options)
          .then(async (res) => {
            const type = res.headers.get('content-type') || '';
            const isJson = type.includes('json');
            const body = isJson ? await res.json() : await res.text();
            server.close(() => resolve({ status: res.status, type, body }));
          })
          .catch((err) => {
            server.close(() => reject(err));
          });
      });
    });
  }

  await t.test('Initial Unassigned Seed state: Admin exists, Teachers and Students unassigned', async () => {
    // 1. Admin login works
    const rAdmin = await request('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    assert.equal(rAdmin.status, 200);
    assert.equal(rAdmin.body.user.role, 'admin');

    // 2. TA login works and has classId: null
    const rTa = await request('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'ta_a', password: 'password123' }),
    });
    assert.equal(rTa.status, 200);
    assert.equal(rTa.body.user.role, 'ta');
    assert.equal(rTa.body.user.classId, null);

    // 3. Student login works and has classId: null
    const rStu = await request('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'student_1', password: 'password123' }),
    });
    assert.equal(rStu.status, 200);
    assert.equal(rStu.body.user.role, 'student');
    assert.equal(rStu.body.user.classId, null);

    // 4. Classes list initially has 0 teachers and 0 students
    const rClasses = await request('/api/classes', {
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rClasses.status, 200);
    assert.equal(rClasses.body.items.length, 2);
    assert.equal(rClasses.body.items[0].studentCount, 0);
    assert.equal(rClasses.body.items[0].teachers.length, 0);
  });

  await t.test('Admin assigns teacher and student to Class 1, verifies updated roster and details', async () => {
    // 1. Admin assigns ta_a (id 2) to Class 1
    const rAssignTeacher = await request('/api/classes/1/teachers', {
      method: 'POST',
      headers: { authorization: 'Bearer tok-admin', 'content-type': 'application/json' },
      body: JSON.stringify({ teacherId: 2 }),
    });
    assert.equal(rAssignTeacher.status, 200);

    // 2. Admin assigns student_1 (id 4) to Class 1
    const rAssignStudent = await request('/api/classes/1/students', {
      method: 'POST',
      headers: { authorization: 'Bearer tok-admin', 'content-type': 'application/json' },
      body: JSON.stringify({ studentId: 4 }),
    });
    assert.equal(rAssignStudent.status, 200);

    // 3. Class details now reflect 1 teacher and 1 student
    const rClassDetails = await request('/api/classes/1', {
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rClassDetails.status, 200);
    assert.equal(rClassDetails.body.class.teachers.length, 1);
    assert.equal(rClassDetails.body.class.teachers[0].username, 'ta_a');
    assert.equal(rClassDetails.body.class.studentCount, 1);

    // 4. Student 1 now gets Class 1 in my-class
    const rMyClass = await request('/api/my-class', {
      headers: { authorization: 'Bearer tok-student-1' },
    });
    assert.equal(rMyClass.status, 200);
    assert.equal(rMyClass.body.class.id, 1);
    assert.equal(rMyClass.body.class.studentCount, 1);
    assert.equal(rMyClass.body.class.teachers[0].username, 'ta_a');
  });

  await t.test('Admin cannot manage labs or wipe database, Teacher manages class labs', async () => {
    // 1. Admin cannot access class labs (403 forbidden)
    const rLabs = await request('/api/classes/1/labs', {
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rLabs.status, 403);

    // 2. Admin cannot create labs (403 forbidden)
    const rAdminCreateLab = await request('/api/labs', {
      method: 'POST',
      headers: { authorization: 'Bearer tok-admin', 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Admin Lab Attempt',
        statement: 'Admin statement',
        testCases: [{ input: '1', output: '1' }],
        constraints: [{ code: 'C1', text: 'no sort', deduction: 1 }],
      }),
    });
    assert.equal(rAdminCreateLab.status, 403);

    // 3. Teacher ta_a (assigned to Class 1) CAN create lab
    const rTeacherCreateLab = await request('/api/labs', {
      method: 'POST',
      headers: { authorization: 'Bearer tok-ta-a', 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Lab 10: Graphs',
        statement: 'Implement BFS algorithm',
        testCases: [{ input: '1 2', output: '2' }],
        constraints: [{ code: 'C1', text: 'no std::sort', deduction: 2 }],
      }),
    });
    assert.equal(rTeacherCreateLab.status, 201);
    const newLabId = rTeacherCreateLab.body.id;

    // 4. Teacher ta_a CAN edit lab
    const rTeacherEditLab = await request(`/api/labs/${newLabId}`, {
      method: 'PUT',
      headers: { authorization: 'Bearer tok-ta-a', 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Lab 10: Breadth First Search (BFS)',
        statement: 'Implement BFS using std::queue',
      }),
    });
    assert.equal(rTeacherEditLab.status, 200);
    assert.equal(rTeacherEditLab.body.title, 'Lab 10: Breadth First Search (BFS)');

    // 5. Admin CANNOT edit lab (403 forbidden)
    const rAdminEditLab = await request(`/api/labs/${newLabId}`, {
      method: 'PUT',
      headers: { authorization: 'Bearer tok-admin', 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Admin Tamper' }),
    });
    assert.equal(rAdminEditLab.status, 403);

    // 6. Admin removes student_1 from Class 1
    const rRemoveStudent = await request('/api/classes/1/students/4', {
      method: 'DELETE',
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rRemoveStudent.status, 200);

    // 7. Admin removes teacher ta_a from Class 1
    const rRemoveTeacher = await request('/api/classes/1/teachers/2', {
      method: 'DELETE',
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rRemoveTeacher.status, 200);

    // 8. Class 1 is back to 0 teachers and 0 students
    const rClassEmpty = await request('/api/classes/1', {
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rClassEmpty.body.class.studentCount, 0);
    assert.equal(rClassEmpty.body.class.teachers.length, 0);

    // 9. Admin CANNOT reset database: POST /api/admin/reset-database is removed (404 not-found)
    const rReset = await request('/api/admin/reset-database', {
      method: 'POST',
      headers: { authorization: 'Bearer tok-admin' },
    });
    assert.equal(rReset.status, 404);
  });
});
