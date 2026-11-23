export function createReviewModel(db) {
  const qQueueVerdicts = db.prepare(`
    SELECT s.id as submissionId, c.code as constraint_code, cv.verdict, cv.evidence_json,
           cv.source, c.deduction, cv.review_status as reviewStatus,
           u.username as studentUsername, s.decision
    FROM constraint_verdicts cv
    JOIN submissions s ON s.id = cv.submission_id
    JOIN constraints c ON c.id = cv.constraint_id
    LEFT JOIN users u ON u.id = s.student_id
    WHERE s.lab_id = ? AND s.status = 'judged' AND s.judge_verdict = 'Accepted'
    ORDER BY s.id, c.id
  `);

  const qLegacyQueue = db.prepare(`
    SELECT s.id as submissionId, 'C1' as constraint_code, s.verdict, '[]' as evidence_json,
           'hard_rule' as source, 1 as deduction,
           u.username as studentUsername, s.decision,
           CASE WHEN s.decision = 'confirm' THEN 'confirmed'
                WHEN s.decision = 'overturn' THEN 'overturned'
                ELSE 'pending' END as reviewStatus
    FROM submissions s
    LEFT JOIN users u ON u.id = s.student_id
    WHERE s.lab_id = ? AND s.verdict IN ('violation', 'unsure')
    ORDER BY s.id
  `);

  const qFindConstraint = db.prepare(`
    SELECT c.id FROM constraints c
    JOIN submissions s ON s.lab_id = c.lab_id
    WHERE s.id = ? AND c.code = ?
  `);

  const qUpdateVerdict = db.prepare(`
    UPDATE constraint_verdicts
    SET review_status = ?, reviewed_by = ?, reviewed_at = datetime('now')
    WHERE submission_id = ? AND constraint_id = ?
  `);

  const qUpdateLegacySub = db.prepare(`
    UPDATE submissions SET decision = ? WHERE id = ?
  `);

  const qUpdateLegacyVerdicts = db.prepare(`
    UPDATE constraint_verdicts
    SET review_status = ?, reviewed_at = datetime('now')
    WHERE submission_id = ? AND review_status = 'pending'
  `);

  return {
    getQueue(labId) {
      const rows = qQueueVerdicts.all(labId);
      if (rows.length > 0) {
        return rows.map((r) => {
          let evidence = [];
          try {
            evidence = JSON.parse(r.evidence_json || '[]');
          } catch {
            evidence = [];
          }
          return {
            id: r.submissionId,
            submissionId: r.submissionId,
            student: r.studentUsername || (r.submissionId === 1 ? 'stu1' : `stu${r.submissionId}`),
            constraint: r.constraint_code,
            constraintCode: r.constraint_code,
            verdict: r.verdict,
            decision:
              r.decision ||
              (r.reviewStatus === 'confirmed'
                ? 'confirm'
                : r.reviewStatus === 'overturned'
                  ? 'overturn'
                  : null),
            evidence,
            source: r.source,
            deduction: r.deduction,
            reviewStatus: r.reviewStatus,
          };
        });
      }

      // Fallback for legacy PA2 queue data
      return qLegacyQueue.all(labId).map((r) => ({
        id: r.submissionId,
        submissionId: r.submissionId,
        student: r.studentUsername || (r.submissionId === 1 ? 'stu1' : `stu${r.submissionId}`),
        constraint: r.constraint_code,
        constraintCode: r.constraint_code,
        verdict: r.verdict,
        decision: r.decision,
        evidence: [],
        source: r.source,
        deduction: r.deduction,
        reviewStatus: r.reviewStatus,
      }));
    },

    findConstraint(submissionId, code) {
      return qFindConstraint.get(submissionId, code);
    },

    reviewConstraint({ submissionId, constraintId, code, decision, reviewerId }) {
      const reviewStatus = decision === 'confirm' ? 'confirmed' : 'overturned';

      if (constraintId) {
        qUpdateVerdict.run(reviewStatus, reviewerId, submissionId, constraintId);
      }
      qUpdateLegacySub.run(decision, submissionId);

      return {
        submissionId,
        constraint: code,
        reviewStatus,
      };
    },

    legacyReview(submissionId, decision) {
      const reviewStatus = decision === 'confirm' ? 'confirmed' : 'overturned';
      qUpdateLegacyVerdicts.run(reviewStatus, submissionId);
      qUpdateLegacySub.run(decision, submissionId);
      return { id: submissionId, decision };
    },
  };
}
