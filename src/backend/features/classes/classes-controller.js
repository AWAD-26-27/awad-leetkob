import { sendJson, problem } from '../../middleware/rfc7807.js';

export function createClassesController(classesModel) {
  return {
    list(req, res) {
      const items = classesModel.listClasses();
      return sendJson(res, 200, { items });
    },

    create(req, res) {
      if (req.user.role !== 'admin') {
        return problem(res, 403, 'forbidden', 'Only administrators can create classes');
      }

      const { name } = req.body || {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return problem(res, 400, 'invalid-body', 'Class name is required');
      }

      const cleanName = name.trim();
      const existing = classesModel.getClassByName(cleanName);
      if (existing) {
        return problem(res, 409, 'conflict', `Class "${cleanName}" already exists`);
      }

      const created = classesModel.createClass(cleanName);
      return sendJson(res, 201, { class: created });
    },

    assignTeacher(req, res) {
      if (req.user.role !== 'admin') {
        return problem(res, 403, 'forbidden', 'Only administrators can assign teachers to classes');
      }

      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      const cls = classesModel.getClassById(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
      }

      const { teacherId } = req.body || {};
      if (!teacherId || isNaN(Number(teacherId))) {
        return problem(res, 400, 'invalid-body', 'teacherId is required and must be numeric');
      }

      try {
        classesModel.assignTeacher(classId, Number(teacherId));
        return sendJson(res, 200, {
          message: 'Teacher assigned to class successfully',
        });
      } catch (err) {
        return problem(res, 400, 'invalid-body', err.message);
      }
    },

    listStudents(req, res) {
      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || req.user.classId !== classId)) {
        return problem(res, 403, 'forbidden', 'You do not have permission to view students of this class');
      }

      const items = classesModel.getClassStudents(classId);
      return sendJson(res, 200, { items });
    },

    assignStudent(req, res) {
      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      // Teacher can assign student to their own class, admin can assign to any class
      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || req.user.classId !== classId)) {
        return problem(res, 403, 'forbidden', 'Only the class teacher or administrator can assign students');
      }

      const cls = classesModel.getClassById(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
      }

      const { studentId } = req.body || {};
      if (!studentId || isNaN(Number(studentId))) {
        return problem(res, 400, 'invalid-body', 'studentId is required and must be numeric');
      }

      try {
        classesModel.assignStudent(classId, Number(studentId));
        return sendJson(res, 200, {
          message: 'Student assigned to class successfully',
        });
      } catch (err) {
        return problem(res, 400, 'invalid-body', err.message);
      }
    },

    removeStudent(req, res) {
      const classId = Number(req.params.classId);
      const studentId = Number(req.params.studentId);
      if (!classId || !studentId) {
        return problem(res, 400, 'invalid-body', 'Valid class ID and student ID are required');
      }

      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || req.user.classId !== classId)) {
        return problem(res, 403, 'forbidden', 'Only the class teacher or administrator can remove students');
      }

      try {
        classesModel.removeStudent(classId, studentId);
        return sendJson(res, 200, {
          message: 'Student removed from class successfully',
        });
      } catch (err) {
        return problem(res, 400, 'invalid-body', err.message);
      }
    },

    allStudents(req, res) {
      if (req.user.role !== 'admin' && req.user.role !== 'ta') {
        return problem(res, 403, 'forbidden', 'Only staff can view student directory');
      }

      const items = classesModel.getAllStudents();
      return sendJson(res, 200, { items });
    },
  };
}
