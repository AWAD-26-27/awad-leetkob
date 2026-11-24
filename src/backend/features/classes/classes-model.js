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

  const qUserById = db.prepare(
    'SELECT id, username, name, role, class_id as classId FROM users WHERE id = ?',
  );
  const qUpdateUserClass = db.prepare('UPDATE users SET class_id = ? WHERE id = ?');
  const qClearUserClass = db.prepare(
    'UPDATE users SET class_id = NULL WHERE id = ? AND class_id = ?',
  );

  const qInsertStaff = db.prepare(
    'INSERT OR IGNORE INTO class_staff (class_id, user_id) VALUES (?, ?)',
  );

  const qDeleteUserAllEnrollments = db.prepare('DELETE FROM enrollments WHERE user_id = ?');
  const qInsertEnrollment = db.prepare(
    'INSERT OR IGNORE INTO enrollments (class_id, user_id) VALUES (?, ?)',
  );
  const qDeleteEnrollment = db.prepare(
    'DELETE FROM enrollments WHERE class_id = ? AND user_id = ?',
  );

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
        if (!teacher.classId) {
          qUpdateUserClass.run(classId, teacherId);
        }
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
        db.prepare('DELETE FROM class_staff WHERE class_id = ? AND user_id = ?').run(
          classId,
          teacherId,
        );
        const remaining = db
          .prepare('SELECT class_id FROM class_staff WHERE user_id = ? LIMIT 1')
          .get(teacherId);
        if (remaining) {
          qUpdateUserClass.run(remaining.class_id, teacherId);
        } else {
          qClearUserClass.run(teacherId, classId);
        }
        db.exec('COMMIT');
        return true;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    getTeacherClasses(teacherId) {
      const q = db.prepare(`
        SELECT DISTINCT c.id, c.name
        FROM classes c
        LEFT JOIN class_staff cs ON cs.class_id = c.id
        LEFT JOIN users u ON u.class_id = c.id
        WHERE (cs.user_id = ? OR (u.id = ? AND u.role = 'ta'))
        ORDER BY c.id ASC
      `);
      const classes = q.all(teacherId, teacherId);
      return classes.map((c) => {
        const countRow = qStudentCountByClass.get(c.id, c.id);
        const labCount =
          db.prepare('SELECT count(*) as count FROM labs WHERE class_id = ?').get(c.id)?.count || 0;
        const announcementCount =
          db
            .prepare('SELECT count(*) as count FROM class_announcements WHERE class_id = ?')
            .get(c.id)?.count || 0;
        return {
          id: c.id,
          name: c.name,
          studentCount: countRow ? countRow.count : 0,
          labCount,
          announcementCount,
        };
      });
    },

    isStudentEnrolled(classId, studentId) {
      const row = db
        .prepare(
          `
        SELECT 1 FROM enrollments WHERE class_id = ? AND user_id = ?
        UNION
        SELECT 1 FROM users WHERE id = ? AND class_id = ? AND role = 'student'
      `,
        )
        .get(classId, studentId, studentId, classId);
      return Boolean(row);
    },

    getStudentClasses(studentId) {
      const q = db.prepare(`
        SELECT DISTINCT c.id, c.name
        FROM classes c
        LEFT JOIN enrollments e ON e.class_id = c.id
        LEFT JOIN users u ON u.class_id = c.id
        WHERE (e.user_id = ? OR (u.id = ? AND u.role = 'student'))
        ORDER BY c.id ASC
      `);
      const classes = q.all(studentId, studentId);
      return classes.map((c) => {
        const teachers = qTeachersByClass.all(c.id, c.id);
        const countRow = qStudentCountByClass.get(c.id, c.id);
        const publishedLabs =
          db
            .prepare(
              'SELECT count(*) as count FROM labs WHERE class_id = ? AND published_at IS NOT NULL',
            )
            .get(c.id)?.count || 0;
        const totalLabs =
          db.prepare('SELECT count(*) as count FROM labs WHERE class_id = ?').get(c.id)?.count || 0;
        const announcementCount =
          db
            .prepare('SELECT count(*) as count FROM class_announcements WHERE class_id = ?')
            .get(c.id)?.count || 0;
        return {
          id: c.id,
          name: c.name,
          teachers,
          studentCount: countRow ? countRow.count : 0,
          labCount: publishedLabs || totalLabs,
          announcementCount,
        };
      });
    },

    getStudentSubmissionsByClass(classId, studentId) {
      const q = db.prepare(`
        SELECT s.id, s.lab_id as labId, l.title as labTitle, s.status, s.judge_verdict as judgeVerdict,
               s.created_at as createdAt, s.judged_at as judgedAt, l.published_at as publishedAt
        FROM submissions s
        JOIN labs l ON l.id = s.lab_id
        WHERE l.class_id = ? AND s.student_id = ?
        ORDER BY s.id DESC
      `);
      const rows = q.all(classId, studentId);
      return rows.map((r) => {
        let grade = undefined;
        if (r.publishedAt && r.status === 'judged') {
          const revs = db
            .prepare(
              `
            SELECT cv.verdict, cv.review_status as reviewStatus, c.deduction
            FROM constraint_verdicts cv
            JOIN constraints c ON c.id = cv.constraint_id
            WHERE cv.submission_id = ?
          `,
            )
            .all(r.id);
          let deductionTotal = 0;
          for (const rev of revs) {
            if (rev.verdict === 'violation' && rev.reviewStatus !== 'overturned') {
              deductionTotal += Number(rev.deduction || 0);
            }
          }
          const base = r.judgeVerdict === 'Accepted' || r.judgeVerdict === 'AC' ? 10 : 0;
          grade = Math.max(0, base - deductionTotal);
        }
        return {
          id: r.id,
          labId: r.labId,
          labTitle: r.labTitle,
          status: r.status,
          judgeVerdict: r.judgeVerdict,
          createdAt: r.createdAt,
          judgedAt: r.judgedAt,
          publishedAt: r.publishedAt,
          grade,
        };
      });
    },

    listAnnouncements(classId) {
      const q = db.prepare(`
        SELECT a.id, a.class_id as classId, a.title, a.content, a.created_at as createdAt,
               u.id as authorId, u.name as authorName, u.username as authorUsername
        FROM class_announcements a
        JOIN users u ON u.id = a.author_id
        WHERE a.class_id = ?
        ORDER BY a.id DESC
      `);
      return q.all(classId);
    },

    createAnnouncement(classId, authorId, title, content) {
      const q = db.prepare(`
        INSERT INTO class_announcements (class_id, author_id, title, content)
        VALUES (?, ?, ?, ?)
      `);
      const res = q.run(classId, authorId, title, content);
      return {
        id: Number(res.lastInsertRowid),
        classId,
        authorId,
        title,
        content,
        createdAt: new Date().toISOString(),
      };
    },

    getClassLabs(classId) {
      const qLabs = db.prepare(
        'SELECT id, class_id as classId, title, statement_md as statement, published_at as publishedAt FROM labs WHERE class_id = ? ORDER BY id ASC',
      );
      return qLabs.all(classId);
    },
  };
}
