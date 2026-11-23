import { sendJson, problem } from '../../middleware/rfc7807.js';
import { isStaff } from '../../middleware/isolation.js';

export function createLabController(db, labModel) {
  const qCountPendingVerdicts = db.prepare(`
    SELECT count(*) as count FROM constraint_verdicts cv
    JOIN submissions s ON s.id = cv.submission_id
    WHERE s.lab_id = ? AND cv.review_status = 'pending' AND cv.verdict IN ('violation', 'unsure')
  `);

  const qCountPendingLegacy = db.prepare(`
    SELECT count(*) as count FROM submissions
    WHERE lab_id = ? AND verdict IN ('violation', 'unsure') AND decision IS NULL
  `);

  const qHasVerdicts = db.prepare(
    'SELECT 1 FROM constraint_verdicts cv JOIN submissions s ON s.id = cv.submission_id WHERE s.lab_id = ? LIMIT 1',
  );

  return {
    list(req, res) {
      const items = labModel.listLabs(req.user);
      return sendJson(res, 200, { items });
    },

    get(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      // Cross-class isolation: if user is not admin and does not belong to the lab's class
      if (req.user.role !== 'admin' && req.user.classId !== lab.classId) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      return sendJson(res, 200, {
        id: lab.id,
        classId: lab.classId,
        title: lab.title,
        statement: lab.statement,
        publishedAt: lab.publishedAt,
      });
    },

    create(req, res) {
      if (req.user.role === 'student') {
        return problem(res, 403, 'forbidden', 'Only staff may create labs');
      }

      const body = req.body || {};
      const { title, statement, testCases, constraints } = body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return problem(res, 400, 'invalid-body', 'title is required and cannot be empty');
      }
      if (!statement || typeof statement !== 'string' || !statement.trim()) {
        return problem(res, 400, 'invalid-body', 'statement is required and cannot be empty');
      }
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return problem(res, 400, 'invalid-body', 'testCases must have at least one test case');
      }
      if (!Array.isArray(constraints) || constraints.length === 0) {
        return problem(res, 400, 'invalid-body', 'constraints must have at least one constraint');
      }

      const seenCodes = new Set();
      for (const c of constraints) {
        if (!c.code || typeof c.code !== 'string' || !c.code.trim()) {
          return problem(res, 400, 'invalid-body', 'constraint code cannot be empty');
        }
        const trimmedCode = c.code.trim();
        if (seenCodes.has(trimmedCode)) {
          return problem(res, 400, 'invalid-body', `Duplicate constraint code ${trimmedCode}`);
        }
        seenCodes.add(trimmedCode);

        if (!c.text || typeof c.text !== 'string' || !c.text.trim()) {
          return problem(res, 400, 'invalid-body', 'constraint text cannot be empty');
        }
        if (c.deduction !== undefined && (typeof c.deduction !== 'number' || c.deduction < 0)) {
          return problem(res, 400, 'invalid-body', 'deduction must be a non-negative number');
        }
      }

      const classId = req.user.role === 'admin' ? Number(body.classId) || 1 : req.user.classId;

      try {
        const created = labModel.createLab({
          classId,
          title: title.trim(),
          statement: statement.trim(),
          testCases,
          constraints,
          createdBy: req.user.id,
        });
        return sendJson(res, 201, created);
      } catch (err) {
        console.error(err);
        return problem(res, 500, 'internal', 'Failed to create lab');
      }
    },

    publish(req, res) {
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
          return problem(res, 403, 'forbidden', 'Only staff of this class may publish');
        }
        return problem(res, 404, 'not-found', 'No such lab');
      }

      if (lab.publishedAt) {
        return sendJson(res, 200, { lab: lab.id, publishedAt: lab.publishedAt });
      }

      // Check pending constraint verdicts
      const hasVerdicts = qHasVerdicts.get(lab.id);

      const pending = hasVerdicts
        ? qCountPendingVerdicts.get(lab.id)?.count || 0
        : qCountPendingLegacy.get(lab.id)?.count || 0;

      if (pending > 0) {
        return problem(res, 409, 'reviews-pending', 'Reviews pending', { pending });
      }

      const publishedAt = labModel.publishLab(lab.id);
      return sendJson(res, 200, { lab: lab.id, publishedAt });
    },
  };
}
