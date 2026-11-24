import { sendJson, problem } from '../../middleware/rfc7807.js';
import { isStaff } from '../../middleware/isolation.js';

export function createReviewController(reviewModel, labModel, submissionModel) {
  return {
    getQueue(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      if (!isStaff(req.user, lab.classId)) {
        if (req.user.role === 'student' && req.user.classId === lab.classId) {
          return problem(res, 403, 'forbidden', 'Only staff of this class may view queue');
        }
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const items = reviewModel.getQueue(lab.id);
      return sendJson(res, 200, {
        labId: lab.id,
        publishedAt: lab.publishedAt,
        items,
      });
    },

    reviewConstraint(req, res) {
      const subId = Number(req.params.submissionId);
      const code = req.params.code;
      if (!Number.isInteger(subId)) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      const sub = submissionModel.getSubmission(subId);
      if (!sub) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      if (!isStaff(req.user, sub.classId)) {
        if (req.user.role === 'student' && req.user.classId === sub.classId) {
          return problem(res, 403, 'forbidden', 'Only staff of this class may review submissions');
        }
        return problem(res, 404, 'not-found', 'No such submission');
      }

      const decision = req.body?.decision;
      if (decision !== 'confirm' && decision !== 'overturn') {
        return problem(res, 400, 'invalid-body', 'decision must be confirm or overturn');
      }

      const constraint = reviewModel.findConstraint(sub.id, code);
      if (!constraint) {
        return problem(res, 404, 'not-found', `No such constraint ${code}`);
      }

      const result = reviewModel.reviewConstraint({
        submissionId: sub.id,
        constraintId: constraint.id,
        code,
        decision,
        reviewerId: req.user.id,
      });

      return sendJson(res, 200, result);
    },

    legacyReview(req, res) {
      const subId = Number(req.params.submissionId);
      if (!Number.isInteger(subId)) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      const sub = submissionModel.getSubmission(subId);
      if (!sub) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      if (!isStaff(req.user, sub.classId)) {
        if (req.user.role === 'student' && req.user.classId === sub.classId) {
          return problem(res, 403, 'forbidden', 'Only staff of this class may review submissions');
        }
        return problem(res, 404, 'not-found', 'No such submission');
      }

      const decision = req.body?.decision;
      if (decision !== 'confirm' && decision !== 'overturn') {
        return problem(res, 400, 'invalid-body', 'decision must be confirm or overturn');
      }

      reviewModel.legacyReview(sub.id, decision);
      return sendJson(res, 200, { id: sub.id, decision });
    },
  };
}
