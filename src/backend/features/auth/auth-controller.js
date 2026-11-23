import { sendJson, problem } from '../../middleware/rfc7807.js';
import { verifyPassword } from '../../db.js';

export function createAuthController(db) {
  const qUser = db.prepare(
    'SELECT id, username, name, role, class_id as classId, token, password_hash as passwordHash FROM users WHERE username = ?',
  );

  return {
    me(req, res) {
      return sendJson(res, 200, {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        classId: req.user.classId,
      });
    },

    login(req, res) {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return problem(res, 401, 'unauthenticated', 'Invalid username or password');
      }

      const user = qUser.get(username);
      if (!user || !verifyPassword(user.passwordHash, password, username)) {
        return problem(res, 401, 'unauthenticated', 'Invalid username or password');
      }

      return sendJson(res, 200, {
        token: user.token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          classId: user.classId,
        },
      });
    },
  };
}
