import { sendJson, problem } from '../../middleware/rfc7807.js';
import { verifyPassword, hashPassword } from '../../db.js';

export function createAuthController(db) {
  const qUser = db.prepare(
    'SELECT id, username, name, role, class_id as classId, token, password_hash as passwordHash FROM users WHERE username = ?',
  );
  const qUserById = db.prepare(
    'SELECT id, username, name, role, class_id as classId, password_hash as passwordHash FROM users WHERE id = ?',
  );
  const qUpdatePassword = db.prepare(
    'UPDATE users SET password_hash = ? WHERE id = ?',
  );
  const qAllUsers = db.prepare(
    'SELECT id, username, name, role, class_id as classId, token FROM users ORDER BY id ASC',
  );
  const qInsertUser = db.prepare(
    'INSERT INTO users (username, name, password_hash, role, class_id, token) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const qInsertStaff = db.prepare(
    'INSERT OR IGNORE INTO class_staff (class_id, user_id) VALUES (?, ?)',
  );
  const qInsertEnrollment = db.prepare(
    'INSERT OR IGNORE INTO enrollments (class_id, user_id) VALUES (?, ?)',
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

    logout(req, res) {
      return sendJson(res, 200, {
        message: 'Logged out successfully',
      });
    },

    changePassword(req, res) {
      const { currentPassword, newPassword } = req.body || {};
      if (!currentPassword || !newPassword) {
        return problem(res, 400, 'invalid-body', 'Current password and new password are required');
      }

      if (newPassword.length < 6) {
        return problem(res, 400, 'invalid-body', 'New password must be at least 6 characters');
      }

      const user = qUserById.get(req.user.id);
      if (!user || !verifyPassword(user.passwordHash, currentPassword, user.username)) {
        return problem(res, 400, 'invalid-credentials', 'Incorrect current password');
      }

      const newHash = hashPassword(newPassword);
      qUpdatePassword.run(newHash, req.user.id);

      return sendJson(res, 200, {
        message: 'Password changed successfully',
      });
    },

    listUsers(req, res) {
      if (req.user.role !== 'admin') {
        return problem(res, 403, 'forbidden', 'Only administrators can view user directory');
      }

      const users = qAllUsers.all();
      return sendJson(res, 200, {
        items: users,
      });
    },

    createUser(req, res) {
      if (req.user.role !== 'admin') {
        return problem(res, 403, 'forbidden', 'Only administrators can create accounts');
      }

      const { username, name, password, role, classId } = req.body || {};

      if (!username || typeof username !== 'string' || !username.trim()) {
        return problem(res, 400, 'invalid-body', 'Username is required');
      }
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        return problem(
          res,
          400,
          'invalid-body',
          'Username must be 3-30 characters of alphanumeric and underscores',
        );
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return problem(res, 400, 'invalid-body', 'Full name is required');
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return problem(res, 400, 'invalid-body', 'Password must be at least 6 characters');
      }

      if (!role || !['ta', 'student'].includes(role)) {
        return problem(
          res,
          400,
          'invalid-body',
          'Role must be either teacher ("ta") or student ("student")',
        );
      }

      // Check if username is taken
      const existing = qUser.get(cleanUsername);
      if (existing) {
        return problem(res, 409, 'conflict', `Username "${cleanUsername}" is already taken`);
      }

      const targetClassId = classId ? Number(classId) : null;
      if (targetClassId) {
        const cls = db.prepare('SELECT id FROM classes WHERE id = ?').get(targetClassId);
        if (!cls) {
          return problem(res, 404, 'not-found', `Class #${targetClassId} not found`);
        }
      }

      const hash = hashPassword(password);
      const token = `tok-${cleanUsername.replace(/_/g, '-')}`;

      try {
        const result = qInsertUser.run(
          cleanUsername,
          name.trim(),
          hash,
          role,
          targetClassId,
          token,
        );
        const newId = Number(result.lastInsertRowid);

        if (targetClassId) {
          if (role === 'ta') {
            qInsertStaff.run(targetClassId, newId);
          } else if (role === 'student') {
            qInsertEnrollment.run(targetClassId, newId);
          }
        }

        return sendJson(res, 201, {
          user: {
            id: newId,
            username: cleanUsername,
            name: name.trim(),
            role,
            classId: targetClassId,
            token,
          },
        });
      } catch (err) {
        return problem(res, 500, 'database-error', err.message);
      }
    },
  };
}
