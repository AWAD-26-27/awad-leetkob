export function createClassesModel(db) {
  const qAllClasses = db.prepare('SELECT id, name FROM classes ORDER BY id ASC');
  const qClassById = db.prepare('SELECT id, name FROM classes WHERE id = ?');
  const qClassByName = db.prepare('SELECT id, name FROM classes WHERE name = ?');
  const qInsertClass = db.prepare('INSERT INTO classes (name) VALUES (?)');

  const qTeachersByClass = db.prepare(
    "SELECT id, username, name, role FROM users WHERE role = 'ta' AND class_id = ? ORDER BY id ASC",
  );
  const qStudentCountByClass = db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND class_id = ?",
  );

  const qUserById = db.prepare('SELECT id, username, name, role, class_id as classId FROM users WHERE id = ?');
  const qUpdateUserClass = db.prepare('UPDATE users SET class_id = ? WHERE id = ?');
  const qClearUserClass = db.prepare('UPDATE users SET class_id = NULL WHERE id = ? AND class_id = ?');

  const qInsertStaff = db.prepare('INSERT OR IGNORE INTO class_staff (class_id, user_id) VALUES (?, ?)');

  const qInsertEnrollment = db.prepare('INSERT OR IGNORE INTO enrollments (class_id, user_id) VALUES (?, ?)');
  const qDeleteEnrollment = db.prepare('DELETE FROM enrollments WHERE class_id = ? AND user_id = ?');

  const qStudentsByClass = db.prepare(
    "SELECT id, username, name, class_id as classId FROM users WHERE role = 'student' AND class_id = ? ORDER BY name ASC",
  );

  const qAllStudents = db.prepare(`
    SELECT u.id, u.username, u.name, u.class_id as classId, c.name as className
    FROM users u
    LEFT JOIN classes c ON u.class_id = c.id
    WHERE u.role = 'student'
    ORDER BY u.name ASC
  `);

  return {
    listClasses() {
      const classes = qAllClasses.all();
      return classes.map((c) => {
        const teachers = qTeachersByClass.all(c.id);
        const countRow = qStudentCountByClass.get(c.id);
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
      return qStudentsByClass.all(classId);
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
  };
}
