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
      if (
        !isStaff(req.user, lab.classId) &&
        !(req.user.role === 'student' && Number(req.user.classId) === Number(lab.classId))
      ) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      return sendJson(res, 200, {
        id: lab.id,
        classId: lab.classId,
        title: lab.title,
        statement: lab.statement,
        publishedAt: lab.publishedAt,
        constraints: lab.constraints || [],
        tests: lab.tests || [],
        testCases: lab.testCases || [],
      });
    },

    create(req, res) {
      if (req.user.role !== 'ta') {
        return problem(res, 403, 'forbidden', 'Only teachers may create labs for their class');
      }

      const classId = req.body?.classId ? Number(req.body.classId) : req.user.classId;
      if (!classId) {
        return problem(
          res,
          400,
          'invalid-body',
          'Cannot create lab: teacher is not assigned to any class',
        );
      }
      if (!isStaff(req.user, classId)) {
        return problem(
          res,
          403,
          'forbidden',
          'Teacher is not authorized to create labs for this class',
        );
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
      for (const tc of testCases) {
        if (!tc || typeof tc !== 'object') {
          return problem(
            res,
            400,
            'invalid-body',
            'testCases must contain valid test case objects',
          );
        }
      }
      if (!Array.isArray(constraints) || constraints.length === 0) {
        return problem(res, 400, 'invalid-body', 'constraints must have at least one constraint');
      }

      const seenCodes = new Set();
      for (const c of constraints) {
        if (!c || typeof c !== 'object') {
          return problem(
            res,
            400,
            'invalid-body',
            'constraints must contain valid constraint objects',
          );
        }
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

    update(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      if (req.user.role !== 'ta' || !isStaff(req.user, lab.classId)) {
        return problem(
          res,
          403,
          'forbidden',
          'Only the assigned teacher of this class may edit this lab',
        );
      }

      const body = req.body || {};
      const { title, statement } = body;

      if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
        return problem(res, 400, 'invalid-body', 'title cannot be empty');
      }
      if (
        statement !== undefined &&
        (!statement || typeof statement !== 'string' || !statement.trim())
      ) {
        return problem(res, 400, 'invalid-body', 'statement cannot be empty');
      }

      try {
        const updated = labModel.updateLab(lab.id, {
          title: title ? title.trim() : undefined,
          statement: statement ? statement.trim() : undefined,
        });
        return sendJson(res, 200, updated);
      } catch (err) {
        console.error(err);
        return problem(res, 500, 'internal', 'Failed to update lab');
      }
    },

    getClassGrades(req, res) {
      const labId = Number(req.params.labId);
      if (!Number.isInteger(labId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const lab = labModel.getLab(labId);
      if (!lab) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      if (!isStaff(req.user, lab.classId)) {
        return problem(res, 404, 'not-found', 'No such lab');
      }

      const qStudents = db.prepare(`
        SELECT DISTINCT u.id, u.username, u.name
        FROM users u
        LEFT JOIN enrollments e ON e.user_id = u.id
        WHERE u.role = 'student' AND (u.class_id = ? OR e.class_id = ?)
        ORDER BY u.name ASC
      `);
      const students = qStudents.all(lab.classId, lab.classId);

      const qSubmissions = db.prepare(`
        SELECT id, status, judge_verdict as judgeVerdict, judge_detail as judgeDetail,
               created_at as createdAt, verdict, decision
        FROM submissions
        WHERE lab_id = ? AND student_id = ?
        ORDER BY id DESC
      `);

      const qVerdicts = db.prepare(`
        SELECT cv.verdict, cv.review_status as reviewStatus, c.code, c.text, c.deduction
        FROM constraint_verdicts cv
        JOIN constraints c ON c.id = cv.constraint_id
        WHERE cv.submission_id = ?
      `);

      const studentGrades = students.map((stu) => {
        const subs = qSubmissions.all(labId, stu.id);
        const count = subs.length;
        if (count === 0) {
          return {
            id: stu.id,
            name: stu.name,
            username: stu.username,
            submissionCount: 0,
            latestSubmission: null,
            latestStatus: 'Chưa nộp',
            judgeVerdict: null,
            score: null,
            deductions: [],
            totalDeductions: 0,
            reviewStatus: 'none',
          };
        }

        const latest = subs[0];
        const cvs = qVerdicts.all(latest.id);

        let totalDeductions = 0;
        const appliedDeductions = [];

        for (const cv of cvs) {
          if (cv.verdict === 'violation' && cv.reviewStatus !== 'overturned') {
            totalDeductions += Number(cv.deduction || 0);
            appliedDeductions.push({
              code: cv.code,
              text: cv.text,
              deduction: Number(cv.deduction || 0),
              status: cv.reviewStatus,
            });
          }
        }

        if (cvs.length === 0 && latest.verdict === 'violation' && latest.decision === 'confirm') {
          totalDeductions += 2;
          appliedDeductions.push({
            code: 'C1',
            text: 'Vi phạm quy ước',
            deduction: 2,
            status: 'confirmed',
          });
        }

        let score = 0;
        if (latest.status === 'judged' && latest.judgeVerdict === 'Accepted') {
          score = Math.max(0, 10 - totalDeductions);
        } else if (latest.status === 'judged') {
          score = 0;
        } else {
          score = null;
        }

        let reviewStatus = 'clean';
        if (cvs.some((c) => c.verdict === 'violation' && c.reviewStatus === 'pending')) {
          reviewStatus = 'pending';
        } else if (appliedDeductions.length > 0) {
          reviewStatus = 'confirmed';
        }

        return {
          id: stu.id,
          name: stu.name,
          username: stu.username,
          submissionCount: count,
          latestSubmission: {
            id: latest.id,
            createdAt: latest.createdAt,
            status: latest.status,
          },
          latestStatus: latest.status === 'judged' ? latest.judgeVerdict : latest.status,
          judgeVerdict: latest.judgeVerdict,
          score,
          deductions: appliedDeductions,
          totalDeductions,
          reviewStatus,
        };
      });

      return sendJson(res, 200, {
        labId: lab.id,
        classId: lab.classId,
        title: lab.title,
        publishedAt: lab.publishedAt,
        students: studentGrades,
      });
    },
  };
}
