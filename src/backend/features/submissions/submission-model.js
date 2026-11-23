import { createSubmissionTransaction } from '../../db.js';

export function createSubmissionModel(db) {
  const qSubById = db.prepare(`
    SELECT s.id, s.lab_id as labId, s.student_id as studentId, s.source_code as sourceCode,
           s.status, s.judge_verdict as judgeVerdict, s.judge_detail as judgeDetail,
           s.created_at as createdAt, s.judged_at as judgedAt, l.class_id as classId
    FROM submissions s
    JOIN labs l ON l.id = s.lab_id
    WHERE s.id = ?
  `);

  const qListForStaff = db.prepare(`
    SELECT s.id, s.lab_id as labId, s.student_id as studentId, u.name as studentName,
           u.username as studentUsername, s.status, s.judge_verdict as judgeVerdict,
           s.created_at as createdAt, s.judged_at as judgedAt
    FROM submissions s
    JOIN users u ON u.id = s.student_id
    WHERE s.lab_id = ?
    ORDER BY s.id DESC
  `);

  const qListForStudent = db.prepare(`
    SELECT s.id, s.lab_id as labId, s.status, s.judge_verdict as judgeVerdict,
           s.created_at as createdAt, s.judged_at as judgedAt
    FROM submissions s
    WHERE s.lab_id = ? AND s.student_id = ?
    ORDER BY s.id DESC
  `);

  return {
    createQueuedSubmission({ labId, studentId, code }) {
      return createSubmissionTransaction(db, { labId, studentId, code });
    },

    getSubmission(subId) {
      return qSubById.get(subId);
    },

    listSubmissions(labId, user) {
      if (user.role === 'admin' || user.role === 'ta') {
        return qListForStaff.all(labId);
      }
      return qListForStudent.all(labId, user.id);
    },
  };
}
