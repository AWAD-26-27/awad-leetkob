import { sendJson, problem } from '../../middleware/rfc7807.js';
import { verifyPassword, hashPassword } from '../../db.js';

export function createAuthController(db) {
  const qUser = db.prepare(`
    SELECT id, username, name, role, avatar, phone,
           COALESCE(class_id,
                    (SELECT class_id FROM enrollments WHERE user_id = users.id LIMIT 1),
                    (SELECT class_id FROM class_staff WHERE user_id = users.id LIMIT 1)) as classId,
           token, password_hash as passwordHash
    FROM users WHERE username = ?
  `);
  const qUserById = db.prepare(`
    SELECT id, username, name, role, avatar, phone,
           COALESCE(class_id,
                    (SELECT class_id FROM enrollments WHERE user_id = users.id LIMIT 1),
                    (SELECT class_id FROM class_staff WHERE user_id = users.id LIMIT 1)) as classId,
           password_hash as passwordHash
    FROM users WHERE id = ?
  `);
  const qUpdatePassword = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
  const qUpdateProfile = db.prepare(
    'UPDATE users SET name = ?, avatar = ?, phone = ? WHERE id = ?',
  );
  const qAllUsers = db.prepare(`
    SELECT id, username, name, role, avatar, phone,
           COALESCE(class_id,
                    (SELECT class_id FROM enrollments WHERE user_id = users.id LIMIT 1),
                    (SELECT class_id FROM class_staff WHERE user_id = users.id LIMIT 1)) as classId
    FROM users ORDER BY id ASC
  `);
  const qInsertUser = db.prepare(
    'INSERT INTO users (username, name, password_hash, role, class_id, token) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const qInsertStaff = db.prepare(
    'INSERT OR IGNORE INTO class_staff (class_id, user_id) VALUES (?, ?)',
  );
  const qInsertEnrollment = db.prepare(
    'INSERT OR IGNORE INTO enrollments (class_id, user_id) VALUES (?, ?)',
  );

  const qAdminClasses = db.prepare(
    "SELECT id, name, 'Quản trị viên' as role, 'Toàn hệ thống' as term, 'Đang hoạt động' as status FROM classes ORDER BY id ASC",
  );
  const qTeacherClasses = db.prepare(`
    SELECT DISTINCT c.id, c.name, 'Giảng viên' as role, 'Học kỳ 1 / 2026' as term, 'Đang giảng dạy' as status
    FROM classes c
    LEFT JOIN class_staff cs ON cs.class_id = c.id
    LEFT JOIN users usr ON usr.class_id = c.id
    WHERE (cs.user_id = ? OR (usr.id = ? AND usr.role = 'ta'))
    ORDER BY c.id ASC
  `);
  const qStudentClasses = db.prepare(`
    SELECT DISTINCT c.id, c.name, 'Học viên' as role, 'Học kỳ 1 / 2026' as term, 'Đang học' as status
    FROM classes c
    LEFT JOIN enrollments e ON e.class_id = c.id
    LEFT JOIN users usr ON usr.class_id = c.id
    WHERE (e.user_id = ? OR (usr.id = ? AND usr.role = 'student'))
    ORDER BY c.id ASC
  `);

  return {
    me(req, res) {
      const user = qUserById.get(req.user.id) || req.user;
      return sendJson(res, 200, {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        classId: user.classId,
        avatar: user.avatar || null,
        phone: user.phone || null,
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

      const userData = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        classId: user.classId,
      };
      if (user.avatar) userData.avatar = user.avatar;
      if (user.phone) userData.phone = user.phone;

      return sendJson(res, 200, {
        token: user.token,
        user: userData,
      });
    },

    logout(req, res) {
      return sendJson(res, 200, {
        message: 'Logged out successfully',
      });
    },

    updateProfile(req, res) {
      const { name, avatar, phone, currentPassword, newPassword } = req.body || {};
      const user = qUserById.get(req.user.id);
      if (!user) {
        return problem(res, 404, 'not-found', 'User not found');
      }

      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return problem(res, 400, 'invalid-body', 'Full name cannot be empty');
      }

      if (currentPassword || newPassword) {
        if (!currentPassword || !newPassword) {
          return problem(
            res,
            400,
            'invalid-body',
            'Current password and new password are required',
          );
        }
        if (newPassword.length < 6) {
          return problem(res, 400, 'invalid-body', 'New password must be at least 6 characters');
        }
        if (!verifyPassword(user.passwordHash, currentPassword, user.username)) {
          return problem(res, 400, 'invalid-credentials', 'Incorrect current password');
        }
        const newHash = hashPassword(newPassword);
        qUpdatePassword.run(newHash, req.user.id);
      }

      const updatedName = name !== undefined ? name.trim() : user.name;
      const updatedAvatar =
        avatar !== undefined ? (avatar ? String(avatar).trim() : null) : user.avatar || null;
      const updatedPhone =
        phone !== undefined ? (phone ? String(phone).trim() : null) : user.phone || null;

      qUpdateProfile.run(updatedName, updatedAvatar, updatedPhone, req.user.id);

      return sendJson(res, 200, {
        id: user.id,
        username: user.username,
        name: updatedName,
        role: user.role,
        classId: user.classId,
        avatar: updatedAvatar,
        phone: updatedPhone,
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
      const enrichedUsers = users.map((u) => {
        let classes = [];
        if (u.role === 'admin') {
          classes = qAdminClasses.all();
        } else if (u.role === 'ta') {
          classes = qTeacherClasses.all(u.id, u.id);
        } else if (u.role === 'student') {
          classes = qStudentClasses.all(u.id, u.id);
        }
        return {
          ...u,
          classes,
        };
      });

      return sendJson(res, 200, {
        items: enrichedUsers,
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

      db.exec('BEGIN IMMEDIATE');
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
        db.exec('COMMIT');

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
        db.exec('ROLLBACK');
        return problem(res, 500, 'database-error', err.message);
      }
    },
  };
}
