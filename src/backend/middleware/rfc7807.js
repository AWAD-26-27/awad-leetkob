const PROBLEM_BASE = 'https://leetkob.example/problems/';

export function sendJson(res, status, body) {
  if (typeof res.status === 'function') {
    return res.status(status).set('content-type', 'application/json').json(body);
  }
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

export function problem(res, status, slug, title, extra = {}) {
  const payload = {
    type: PROBLEM_BASE + slug,
    title: title || slug,
    status,
    ...extra,
  };
  if (typeof res.status === 'function') {
    return res.status(status).set('content-type', 'application/problem+json').json(payload);
  }
  res.writeHead(status, { 'content-type': 'application/problem+json' });
  res.end(JSON.stringify(payload));
}

// eslint-disable-next-line no-unused-vars
export function rfc7807ErrorHandler(err, req, res, next) {
  console.error(err);
  if (!res.headersSent) {
    problem(res, 500, 'internal', 'Something went wrong');
  }
}
