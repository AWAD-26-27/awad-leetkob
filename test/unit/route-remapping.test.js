import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, formatHash } from '../../src/frontend/src/routes/Router.js';
import { open } from '../../src/db.js';
import { createApp } from '../../src/backend/app.js';

test('Client-side Hash Router - parseHash and formatHash bidirectional mapping', () => {
  // 1. Root & empty hashes
  assert.deepEqual(parseHash(''), { path: '/', params: {} });
  assert.deepEqual(parseHash('#'), { path: '/', params: {} });
  assert.deepEqual(parseHash('#/'), { path: '/', params: {} });
  assert.equal(formatHash('/'), '#/');

  // 2. Labs route & parameterized labId
  assert.deepEqual(parseHash('#/labs'), { path: '/labs', params: {} });
  assert.deepEqual(parseHash('#/labs/1'), { path: '/labs/:labId', params: { labId: 1 } });
  assert.deepEqual(parseHash('#/labs/42'), { path: '/labs/:labId', params: { labId: 42 } });
  assert.equal(formatHash('/labs'), '#/labs');
  assert.equal(formatHash('/labs/:labId', { labId: 5 }), '#/labs/5');

  // 3. Admin routes
  assert.deepEqual(parseHash('#/admin'), { path: '/admin/admin', params: { mode: 'admin' } });
  assert.deepEqual(parseHash('#/admin/labs'), { path: '/admin/labs', params: { mode: 'labs' } });
  assert.equal(formatHash('/admin', { mode: 'admin' }), '#/admin');
  assert.equal(formatHash('/admin', { mode: 'labs' }), '#/admin/labs');

  // 4. Classes route
  assert.deepEqual(parseHash('#/classes'), { path: '/classes', params: {} });
  assert.deepEqual(parseHash('#/classes/2'), { path: '/classes/:classId', params: { classId: 2 } });
  assert.equal(formatHash('/classes'), '#/classes');
  assert.equal(formatHash('/classes/:classId', { classId: 2 }), '#/classes/2');

  // 5. Profile & Login modal routes
  assert.deepEqual(parseHash('#/profile'), { path: '/profile', params: {} });
  assert.deepEqual(parseHash('#/login'), { path: '/login', params: {} });
  assert.equal(formatHash('/profile'), '#/profile');
  assert.equal(formatHash('/login'), '#/login');
});

test('Backend Route Remapping & Aliases verification', async (t) => {
  const db = open();
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

  await t.test('GET /health probe alias returns 200 healthy status', async () => {
    const res = await request('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  await t.test(
    'GET /docs and GET /openapi.json aliases return documentation and spec',
    async () => {
      const docsRes = await request('/docs');
      assert.equal(docsRes.status, 200);
      assert.match(docsRes.body, /@scalar\/api-reference/i);

      const specRes = await request('/openapi.json');
      assert.equal(specRes.status, 200);
      assert.equal(specRes.body.openapi, '3.1.0');
      assert.ok(specRes.body.paths['/api/classes/{classId}']);
    },
  );

  await t.test('Direct SPA navigation to /labs or /admin returns index HTML', async () => {
    const labsSpa = await request('/labs');
    assert.equal(labsSpa.status, 200);
    assert.match(labsSpa.type, /text\/html/);
    assert.match(labsSpa.body, /<div id="root">/);

    const adminSpa = await request('/admin');
    assert.equal(adminSpa.status, 200);
    assert.match(adminSpa.type, /text\/html/);
    assert.match(adminSpa.body, /<div id="root">/);
  });

  await t.test('GET /api/submissions?labId=1 alias works for authenticated users', async () => {
    // TA token
    const res = await request('/api/submissions?labId=1', {
      headers: { authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  await t.test('GET /api/reviews/queue?labId=1 alias works for authenticated staff', async () => {
    const res = await request('/api/reviews/queue?labId=1', {
      headers: { authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  await t.test('GET /api/classes/1/roster alias works for authenticated staff', async () => {
    const res = await request('/api/classes/1/roster', {
      headers: { authorization: 'Bearer tok-ta-a' },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });
});
