import test from 'node:test';
import assert from 'node:assert/strict';
import { open } from '../../src/db.js';
import { createApp } from '../../src/app.js';

function createClient(app) {
  return async function request(path) {
    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}${path}`;

        fetch(url)
          .then(async (res) => {
            const contentType = res.headers.get('content-type') || '';
            const text = await res.text();
            server.close(() => resolve({ status: res.status, contentType, text }));
          })
          .catch((err) => {
            server.close(() => reject(err));
          });
      });
    });
  };
}

test('Frontend Static Serving - Root HTML and ES Module asset resolution', async (t) => {
  const db = open();
  const app = createApp(db);
  const req = createClient(app);

  await t.test('Root path GET / returns HTML with root mount and script module', async () => {
    const res = await req('/');
    assert.equal(res.status, 200);
    assert.match(res.contentType, /text\/html/);
    assert.match(res.text, /<div id="root">/);
    assert.match(res.text, /src="\/src\/frontend\/src\/main\.js"/);
    assert.match(res.text, /href="\/src\/frontend\/src\/config\/theme\.css"/);
  });

  await t.test(
    'GET /src/frontend/src/config/theme.css returns CSS with design tokens',
    async () => {
      const res = await req('/src/frontend/src/config/theme.css');
      assert.equal(res.status, 200);
      assert.match(res.contentType, /text\/css/);
      assert.match(res.text, /--color-primary/);
      assert.match(res.text, /--color-bg/);
      assert.match(res.text, /JetBrains Mono/);
    },
  );

  await t.test('GET /src/frontend/src/main.js returns JavaScript ES Module', async () => {
    const res = await req('/src/frontend/src/main.js');
    assert.equal(res.status, 200);
    assert.match(res.contentType, /text\/javascript/);
    assert.match(res.text, /render/);
  });

  await t.test('GET /src/frontend/src/App.js returns JavaScript ES Module', async () => {
    const res = await req('/src/frontend/src/App.js');
    assert.equal(res.status, 200);
    assert.match(res.contentType, /text\/javascript/);
    assert.match(res.text, /UserSelectorBar/);
  });

  await t.test(
    'GET /src/frontend/src/lib/react.js returns zero-dependency React runtime',
    async () => {
      const res = await req('/src/frontend/src/lib/react.js');
      assert.equal(res.status, 200);
      assert.match(res.contentType, /text\/javascript/);
      assert.match(res.text, /createElement/);
      assert.match(res.text, /useState/);
    },
  );

  await t.test('Directory path request does not throw EISDIR or crash server', async () => {
    const res = await req('/src/frontend');
    assert.notEqual(res.status, 500);
  });
});
