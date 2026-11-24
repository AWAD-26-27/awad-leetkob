export function createClassesModel(db) {
  const qAllClasses = db.prepare('SELECT id, name FROM classes ORDER BY id ASC');
  const qClassById = db.prepare('SELECT id, name FROM classes WHERE id = ?');
  const qClassByName = db.prepare('SELECT id, name FROM classes WHERE name = ?');
  const qInsertClass = db.prepare('INSERT INTO classes (name) VALUES (?)');

  // Teachers query checks both users.class_id and class_staff junction table
  const qTeachersByClass = db.prepare(`
    SELECT DISTINCT u.id, u.username, u.name, u.role
    FROM users u
    LEFT JOIN class_staff cs ON cs.user_id = u.id
    WHERE u.role = 'ta' AND (u.class_id = ? OR cs.class_id = ?)
    ORDER BY u.id ASC
  `);

  // Student count checks both users.class_id and enrollments junction table
  const qStudentCountByClass = db.prepare(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    LEFT JOIN enrollments e ON e.user_id = u.id
    WHERE u.role = 'student' AND (u.class_id = ? OR e.class_id = ?)
  `);

  const qUserById = db.prepare('SELECT id, username, name, role, class_id as classId FROM users WHERE id = ?');
  const qUpdateUserClass = db.prepare('UPDATE users SET class_id = ? WHERE id = ?');
  const qClearUserClass = db.prepare('UPDATE users SET class_id = NULL WHERE id = ? AND class_id = ?');

  const qDeleteUserAllStaff = db.prepare('DELETE FROM class_staff WHERE user_id = ?');
  const qInsertStaff = db.prepare('INSERT OR IGNORE INTO class_staff (class_id, user_id) VALUES (?, ?)');

  const qDeleteUserAllEnrollments = db.prepare('DELETE FROM enrollments WHERE user_id = ?');
  const qInsertEnrollment = db.prepare('INSERT OR IGNORE INTO enrollments (class_id, user_id) VALUES (?, ?)');
  const qDeleteEnrollment = db.prepare('DELETE FROM enrollments WHERE class_id = ? AND user_id = ?');

  // Unified student query by class: guarantees no student is missed
  const qStudentsByClass = db.prepare(`
    SELECT DISTINCT u.id, u.username, u.name, COALESCE(u.class_id, e.class_id) as classId
    FROM users u
    LEFT JOIN enrollments e ON e.user_id = u.id
    WHERE u.role = 'student' AND (u.class_id = ? OR e.class_id = ?)
    ORDER BY u.name ASC
  `);

  // Unified all students query: includes className and classId consistently
  const qAllStudents = db.prepare(`
    SELECT DISTINCT u.id, u.username, u.name, COALESCE(u.class_id, e.class_id) as classId, c.name as className
    FROM users u
    LEFT JOIN enrollments e ON e.user_id = u.id
    LEFT JOIN classes c ON c.id = COALESCE(u.class_id, e.class_id)
    WHERE u.role = 'student'
    ORDER BY u.name ASC
  `);

  return {
    listClasses() {
      const classes = qAllClasses.all();
      return classes.map((c) => {
        const teachers = qTeachersByClass.all(c.id, c.id);
        const countRow = qStudentCountByClass.get(c.id, c.id);
        return {
          id: c.id,
          name: c.name,
          teachers,
          studentCount: countRow ? countRow.count : 0,
        };
      });
    },

    getClassById(id) {
      return qClassById.get(id);
    },

    getClassDetails(id) {
      const cls = qClassById.get(id);
      if (!cls) return null;
      const teachers = qTeachersByClass.all(cls.id, cls.id);
      const countRow = qStudentCountByClass.get(cls.id, cls.id);
      return {
        id: cls.id,
        name: cls.name,
        teachers,
        studentCount: countRow ? countRow.count : 0,
      };
    },

    getClassByName(name) {
      return qClassByName.get(name);
    },

    createClass(name) {
      const result = qInsertClass.run(name);
      return {
        id: Number(result.lastInsertRowid),
        name,
      };
    },

    assignTeacher(classId, teacherId) {
      const teacher = qUserById.get(teacherId);
      if (!teacher || teacher.role !== 'ta') {
        throw new Error('User is not a valid teacher/TA');
      }
      db.exec('BEGIN IMMEDIATE');
      try {
        qDeleteUserAllStaff.run(teacherId);
        qUpdateUserClass.run(classId, teacherId);
        qInsertStaff.run(classId, teacherId);
        db.exec('COMMIT');
        return true;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    getClassStudents(classId) {
      return qStudentsByClass.all(classId, classId);
    },

    getAllStudents() {
      return qAllStudents.all();
    },

    assignStudent(classId, studentId) {
      const student = qUserById.get(studentId);
      if (!student || student.role !== 'student') {
        throw new Error('User is not a valid student');
      }
      db.exec('BEGIN IMMEDIATE');
      try {
        // Clear previous enrollment to maintain single-class boundary
        qDeleteUserAllEnrollments.run(studentId);
        qUpdateUserClass.run(classId, studentId);
        qInsertEnrollment.run(classId, studentId);
        db.exec('COMMIT');
        return true;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    removeStudent(classId, studentId) {
      db.exec('BEGIN IMMEDIATE');
      try {
        qClearUserClass.run(studentId, classId);
        qDeleteEnrollment.run(classId, studentId);
        db.exec('COMMIT');
        return true;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    removeTeacher(classId, teacherId) {
      db.exec('BEGIN IMMEDIATE');
      try {
        qDeleteUserAllStaff.run(teacherId);
        qClearUserClass.run(teacherId, classId);
        db.exec('COMMIT');
        return true;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    getClassLabs(classId) {
      const qLabs = db.prepare(
        'SELECT id, class_id as classId, title, statement_md as statement, published_at as publishedAt FROM labs WHERE class_id = ? ORDER BY id ASC',
      );
      return qLabs.all(classId);
    },
  };
}
