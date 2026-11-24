import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(() => app.close());

test('Enterprise Security Headers & Request ID Tracing', async () => {
  const rawRes = await fetch(`${app.base}/api/health`);
  assert.equal(rawRes.status, 200);
  assert.equal(rawRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(rawRes.headers.get('x-frame-options'), 'DENY');
  assert.equal(rawRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.ok(rawRes.headers.get('x-request-id'));
});

test('GET /api/health returns healthy status and WAL mode', async () => {
  const r = await app.as(null).get('/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'healthy');
  assert.equal(r.body.database.connected, true);
  assert.equal(r.body.database.mode, 'WAL');
  assert.ok(typeof r.body.uptimeSeconds === 'number');
});

test('GET /api/openapi.json returns valid OpenAPI 3.1.0 document', async () => {
  const r = await app.as(null).get('/api/openapi.json');
  assert.equal(r.status, 200);
  assert.equal(r.body.openapi, '3.1.0');
  assert.equal(r.body.info.title, 'LeeTKOB PA3 API');
  assert.ok(r.body.paths['/api/login']);
  assert.ok(r.body.paths['/api/labs']);
  assert.ok(r.body.paths['/api/labs/{labId}/publish']);
  assert.ok(r.body.components.securitySchemes.bearerAuth);
});

test('GET /api/docs returns interactive documentation HTML', async () => {
  const res = await app.as(null).get('/api/docs');
  assert.equal(res.status, 200);
});

test('Payload > 1MB returns 413 Payload Too Large Problem Details', async () => {
  // Generate > 1MB payload string
  const largeData = 'x'.repeat(1024 * 1024 + 100);
  const r = await app.as('student_1').post('/api/labs/1/submissions', { code: largeData });
  assert.equal(r.status, 413);
  assert.match(r.type, /^application\/problem\+json/);
  assert.equal(r.body.type, 'https://leetkob.example/problems/payload-too-large');
});
