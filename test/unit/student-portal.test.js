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

test('Student Portal Backend - Multi-Class, Class Workspace & Submission History Without Code', async () => {
  // 1. student_1 queries GET /api/my-classes and receives enrolled classes
  const res = await app.as('student_1').get('/api/my-classes');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.ok(res.body.items.length >= 1);

  const classA = res.body.items.find((c) => c.name === 'Class A');
  assert.ok(classA, 'Class A should be in student classes list');
  assert.ok(classA.teachers.some((t) => t.username === 'ta_a'));
  assert.ok(classA.studentCount >= 1);

  // 2. Student views class details, labs, and announcements for enrolled class
  const resDetail = await app.as('student_1').get('/api/classes/1');
  assert.equal(resDetail.status, 200);
  assert.equal(resDetail.body.class.name, 'Class A');
  assert.ok(Array.isArray(resDetail.body.class.students));

  const resAnn = await app.as('student_1').get('/api/classes/1/announcements');
  assert.equal(resAnn.status, 200);
  assert.ok(Array.isArray(resAnn.body.items));

  const resLabs = await app.as('student_1').get('/api/classes/1/labs');
  assert.equal(resLabs.status, 200);
  assert.ok(Array.isArray(resLabs.body.items));

  // 3. Student submits code and views class submission history without source code
  const subRes = await app.as('student_1').post('/api/labs/1/submissions', {
    code: 'int main() { return 0; }',
  });
  assert.equal(subRes.status, 202);
  const subId = subRes.body.id;

  const histRes = await app.as('student_1').get('/api/classes/1/my-submissions');
  assert.equal(histRes.status, 200);
  assert.ok(Array.isArray(histRes.body.items));
  assert.ok(histRes.body.items.length >= 1);

  const found = histRes.body.items.find((s) => s.id === subId);
  assert.ok(found, 'Submission should be in class submission history');
  assert.equal(found.labId, 1);
  assert.equal(found.status, 'queued');

  // INVARIANT: Source code must NEVER be returned in submission history
  assert.equal(found.sourceCode, undefined, 'sourceCode must not be present in submission history');
  assert.equal(found.code, undefined, 'code must not be present in submission history');

  // 4. Student isolation: cannot access un-enrolled class labs or submissions
  const resLabsDenied = await app.as('student_1').get('/api/classes/2/labs');
  assert.equal(resLabsDenied.status, 403);

  const resSubsDenied = await app.as('student_1').get('/api/classes/2/my-submissions');
  assert.equal(resSubsDenied.status, 403);
});
