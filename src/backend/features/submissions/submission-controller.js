import { sendJson, problem } from '../../middleware/rfc7807.js';
import { isStaff } from '../../middleware/isolation.js';

export function createSubmissionController(submissionModel, labModel) {
  return {
    submit(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      if (req.user.role !== 'admin' && req.user.classId !== lab.classId) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const code = req.body?.code || req.body?.sourceCode;
      if (!code || typeof code !== 'string' || !code.trim()) {
        return problem(res, 400, 'invalid-body', 'code is required and cannot be empty');
      }

      try {
        const submissionId = submissionModel.createQueuedSubmission({
          labId,
          studentId: req.user.id,
          code,
        });

        return sendJson(res, 202, {
          id: submissionId,
          status: 'queued',
        });
      } catch (err) {
        console.error(err);
        return problem(res, 500, 'internal', 'Failed to record submission');
      }
    },

    get(req, res) {
      const subId = Number(req.params.submissionId);
      if (!Number.isInteger(subId)) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      const sub = submissionModel.getSubmission(subId);
      if (!sub) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      // Cross-class isolation
      if (req.user.role !== 'admin' && req.user.classId !== sub.classId) {
        return problem(res, 404, 'not-found', 'No such submission');
      }

      // Student privacy: student can only view their own submission
      if (req.user.role === 'student') {
        if (req.user.id !== sub.studentId) {
          return problem(res, 404, 'not-found', 'No such submission');
        }

        // STRICT FAQ INVARIANT: student strictly sees only id, labId, status, and judgeVerdict
        return sendJson(res, 200, {
          id: sub.id,
          labId: sub.labId,
          status: sub.status,
          judgeVerdict: sub.status === 'judged' ? sub.judgeVerdict : null,
        });
      }

      // Staff of the class or admin gets full operational metadata
      if (isStaff(req.user, sub.classId)) {
        return sendJson(res, 200, {
          id: sub.id,
          labId: sub.labId,
          studentId: sub.studentId,
          status: sub.status,
          judgeVerdict: sub.judgeVerdict,
          judgeDetail: sub.judgeDetail,
          createdAt: sub.createdAt,
          judgedAt: sub.judgedAt,
        });
      }

      return problem(res, 404, 'not-found', 'No such submission');
    },

    list(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab || (req.user.role !== 'admin' && req.user.classId !== lab.classId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const items = submissionModel.listSubmissions(labId, req.user);
      return sendJson(res, 200, { items });
    },
  };
}
