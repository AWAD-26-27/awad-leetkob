// Start the slice in-process on a fresh in-memory database.
import { open } from '../src/db.js';
import { createApp } from '../src/app.js';

export async function startApp(customDb, options = {}) {
  const db = customDb ?? open(options);
  const server = createApp(db).listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://localhost:${server.address().port}`;

  function as(user) {
    let token = '';
    if (user) {
      if (typeof user === 'object' && user.token) token = user.token;
      else token = `tok-${String(user).replace('_', '-')}`;
    }
    const headers = token ? { authorization: `Bearer ${token}` } : {};
    const call = async (method, path, body) => {
      const res = await fetch(base + path, {
        method,
        headers: body === undefined ? headers : { ...headers, 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = undefined;
      }
      return { status: res.status, type: res.headers.get('content-type'), body: json };
    };
    return {
      get: (path) => call('GET', path),
      post: (path, body) => call('POST', path, body),
      put: (path, body) => call('PUT', path, body),
      patch: (path, body) => call('PATCH', path, body),
      delete: (path) => call('DELETE', path),
    };
  }

  const publishedAt = (lab) => {
    const row = db.prepare('SELECT published_at AS t FROM labs WHERE id = ?').get(lab);
    return row ? row.t : null;
  };

  return { db, as, base, publishedAt, close: () => new Promise((r) => server.close(r)) };
}

export const openTestApp = startApp;
