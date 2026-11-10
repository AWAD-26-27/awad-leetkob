// The contract in docs/contract/publish.md, as tests.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

const BASE = 'https://leetkob.example/problems/';
let app;
beforeEach(async () => {
  app = await startApp();
});
afterEach(() => app.close());

const publish = (user, lab, body) => app.as(user).post(`/api/labs/${lab}/publish`, body);

function assertProblem(r, status, slug) {
  assert.equal(r.status, status);
  assert.match(r.type, /^application\/problem\+json/);
  assert.equal(r.body.type, BASE + slug);
  assert.equal(r.body.status, status);
  assert.equal(typeof r.body.title, 'string');
  assert.ok(r.body.title.length > 0);
}

test('no token is 401 and publishes nothing', async () => {
  assertProblem(await publish(null, 2), 401, 'unauthenticated');
  assert.equal(app.publishedAt(2), null);
});

test('unknown token is 401 and publishes nothing', async () => {
  assertProblem(await publish('unknown_user', 2), 401, 'unauthenticated');
  assert.equal(app.publishedAt(2), null);
});

test('a lab that does not exist is 404', async () => {
  assertProblem(await publish('admin', 99), 404, 'not-found');
});

test('an invalid non-numeric lab id is 404 not-found', async () => {
  assertProblem(await publish('admin', 'non-numeric-id'), 404, 'not-found');
});

test('a student of the class is 403 and publishes nothing', async () => {
  assertProblem(await publish('stu3', 2), 403, 'forbidden');
  assert.equal(app.publishedAt(2), null);
});

test('a TA of another class gets identical 404 body as non-existent lab', async () => {
  const rNotFound = await publish('admin', 99);
  const rOtherTA = await publish('ta_a', 2);
  assertProblem(rOtherTA, 404, 'not-found');
  assert.deepEqual(rOtherTA.body, rNotFound.body);
  assert.equal(app.publishedAt(2), null);
});

test('it refuses while reviews are pending and publishes nothing', async () => {
  const r = await publish('ta_a', 1);
  assertProblem(r, 409, 'reviews-pending');
  assert.equal(r.body.pending, 1);
  assert.equal(app.publishedAt(1), null);
});

test('the TA of the class publishes a lab with no pending review', async () => {
  const r = await publish('ta_b', 2);
  assert.equal(r.status, 200);
  assert.equal(typeof r.body.lab, 'number');
  assert.equal(r.body.lab, 2);
  assert.equal(typeof r.body.publishedAt, 'string');
  assert.match(r.body.publishedAt, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  assert.equal(app.publishedAt(2), r.body.publishedAt);
});

test('an unexpected request body is ignored on publish', async () => {
  const r = await publish('ta_b', 2, { unexpectedField: 'ignored' });
  assert.equal(r.status, 200);
  assert.equal(r.body.lab, 2);
  assert.ok(r.body.publishedAt);
  assert.equal(app.publishedAt(2), r.body.publishedAt);
});

test('an admin may publish', async () => {
  assert.equal((await publish('admin', 2)).status, 200);
});

test('publishing again is safe and does not move the time (idempotent retry)', async () => {
  const first = await publish('ta_b', 2);
  await new Promise((r) => setTimeout(r, 1100)); // the clock has one-second resolution
  const again = await publish('ta_b', 2);
  assert.equal(again.status, 200);
  assert.equal(again.body.publishedAt, first.body.publishedAt);
  assert.equal(app.publishedAt(2), first.body.publishedAt);
});

test('internal server error returns 500 problem details', async () => {
  const faultyDb = {
    prepare: (sql) => {
      if (sql.includes('FROM users WHERE token')) {
        return { get: () => ({ id: 2, name: 'ta_a', role: 'ta' }) };
      }
      if (sql.includes('FROM labs WHERE id')) {
        return {
          get: () => {
            throw new Error('Simulated database failure');
          },
        };
      }
      return { get: () => undefined, all: () => [], run: () => {} };
    },
  };
  const errorApp = await startApp(faultyDb);
  try {
    const r = await errorApp.as('ta_a').post('/api/labs/1/publish');
    assertProblem(r, 500, 'internal');
  } finally {
    await errorApp.close();
  }
});
