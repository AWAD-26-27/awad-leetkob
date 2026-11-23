export function createLabModel(db) {
  const qListAll = db.prepare(
    'SELECT id, class_id as classId, title, published_at as publishedAt FROM labs ORDER BY id',
  );
  const qListByClass = db.prepare(
    'SELECT id, class_id as classId, title, published_at as publishedAt FROM labs WHERE class_id = ? ORDER BY id',
  );
  const qLabById = db.prepare(
    'SELECT id, class_id as classId, title, statement_md as statement, published_at as publishedAt FROM labs WHERE id = ?',
  );
  const qInsertLab = db.prepare(
    'INSERT INTO labs (class_id, title, statement_md, created_by) VALUES (?, ?, ?, ?)',
  );
  const qInsertTestCase = db.prepare(
    'INSERT INTO test_cases (lab_id, ordinal, input_text, expected_output) VALUES (?, ?, ?, ?)',
  );
  const qInsertConstraint = db.prepare(
    'INSERT INTO constraints (lab_id, code, text, deduction) VALUES (?, ?, ?, ?)',
  );
  const qPublish = db.prepare(
    "UPDATE labs SET published_at = datetime('now') WHERE id = ? AND published_at IS NULL",
  );
  const qGetPublishedAt = db.prepare('SELECT published_at as publishedAt FROM labs WHERE id = ?');

  return {
    listLabs(user) {
      if (user.role === 'admin') {
        return qListAll.all();
      }
      return qListByClass.all(user.classId);
    },

    getLab(labId) {
      return qLabById.get(labId);
    },

    createLab({ classId, title, statement, testCases, constraints, createdBy }) {
      db.exec('BEGIN IMMEDIATE TRANSACTION;');
      try {
        const res = qInsertLab.run(classId, title, statement, createdBy);
        const labId = Number(res.lastInsertRowid);

        let ordinal = 1;
        for (const tc of testCases) {
          qInsertTestCase.run(
            labId,
            ordinal++,
            tc.input !== undefined && tc.input !== null ? String(tc.input) : '',
            tc.expectedOutput !== undefined && tc.expectedOutput !== null
              ? String(tc.expectedOutput)
              : '',
          );
        }

        for (const c of constraints) {
          qInsertConstraint.run(
            labId,
            String(c.code).trim(),
            String(c.text).trim(),
            Number(c.deduction ?? 1),
          );
        }

        db.exec('COMMIT;');
        return { id: labId, classId, title };
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    },

    publishLab(labId) {
      qPublish.run(labId);
      return qGetPublishedAt.get(labId)?.publishedAt;
    },
  };
}
