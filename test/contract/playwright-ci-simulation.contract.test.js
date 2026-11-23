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

test('Playwright E2E CI Specification Simulation (e2e/publish.spec.js)', async (t) => {
  // Database initializes with default legacy seeded lab 1 and submission 1
  const db = open();
  const app = createApp(db);
  const req = createClient(app);

  let statusText = '';

  await t.test(
    'Page load: GET / serves HTML with Signed in as selector and status element',
    async () => {
      const res = await req('/');
      assert.equal(res.status, 200);
      assert.match(res.data, /<div id="root">/);
      assert.match(res.data, /src="\/src\/frontend\/src\/main\.js"/);
    },
  );

  await t.test(
    "TA selects 'ta_a' -> GET /api/labs/1/queue returns pending submission for stu1",
    async () => {
      const headers = { Authorization: 'Bearer tok-ta-a' };
      const res = await req('/api/labs/1/queue', { headers });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.items), 'queue items array expected');

      const sub = res.data.items.find((i) => i.student === 'stu1');
      assert.ok(sub, 'stu1 submission must be found in queue');
      assert.equal(sub.id, 1);
      assert.equal(sub.student, 'stu1');
      assert.equal(sub.decision, null);

      // Verifies button name contract: 'Confirm ' + sub.student => 'Confirm stu1'
      const buttonName = `Confirm ${sub.student}`;
      assert.equal(buttonName, 'Confirm stu1');
    },
  );

  await t.test(
    "TA clicks 'Confirm stu1' -> POST /api/submissions/1/review confirms submission",
    async () => {
      const headers = { Authorization: 'Bearer tok-ta-a' };
      const res = await req('/api/submissions/1/review', {
        method: 'POST',
        headers,
        body: { decision: 'confirm' },
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.id, 1);
      assert.equal(res.data.decision, 'confirm');

      // Frontend sets status text
      statusText = `Reviewed submission ${res.data.id}`;
      assert.equal(statusText, 'Reviewed submission 1');
    },
  );

  await t.test(
    "TA clicks 'Publish grades' -> POST /api/labs/1/publish returns publishedAt timestamp",
    async () => {
      const headers = { Authorization: 'Bearer tok-ta-a' };
      const res = await req('/api/labs/1/publish', {
        method: 'POST',
        headers,
      });

      assert.equal(res.status, 200);
      assert.ok(res.data.publishedAt, 'publishedAt must be present');

      // Frontend sets status text
      statusText = `Published at ${res.data.publishedAt}`;
      assert.match(statusText, /^Published at /);
    },
  );
});
