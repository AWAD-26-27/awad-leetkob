import { problem } from './rfc7807.js';

export function createAuthMiddleware(db) {
  const qUser = db.prepare(`
    SELECT id, username, name, role,
           COALESCE(class_id,
                    (SELECT class_id FROM enrollments WHERE user_id = users.id LIMIT 1),
                    (SELECT class_id FROM class_staff WHERE user_id = users.id LIMIT 1)) as classId
    FROM users WHERE token = ?
  `);

  return (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const m = /^Bearer (\S+)$/.exec(authHeader);
    if (!m) {
      return problem(res, 401, 'unauthenticated', 'Sign in first');
    }

    const user = qUser.get(m[1]);
    if (!user) {
      return problem(res, 401, 'unauthenticated', 'Invalid token');
    }

    req.user = user;
    if (typeof next === 'function') next();
  };
}
