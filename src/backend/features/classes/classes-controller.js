import { sendJson, problem } from '../../middleware/rfc7807.js';

export function createClassesController(classesModel) {
  return {
    list(req, res) {
      const items = classesModel.listClasses();
      return sendJson(res, 200, { items });
    },

    getById(req, res) {
      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      const cls = classesModel.getClassDetails(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
      }

      let students = undefined;
      // Admin or the teacher of this class gets the roster in the class object
      if (req.user.role === 'admin' || (req.user.role === 'ta' && Number(req.user.classId) === Number(classId))) {
        students = classesModel.getClassStudents(classId);
      }

      return sendJson(res, 200, {
        class: {
          ...cls,
          ...(students !== undefined ? { students } : {}),
        },
      });
    },

    myClass(req, res) {
      if (!req.user || !req.user.classId) {
        return sendJson(res, 200, { class: null });
      }

      const cls = classesModel.getClassDetails(req.user.classId);
      if (!cls) {
        return sendJson(res, 200, { class: null });
      }

      const students = classesModel.getClassStudents(req.user.classId);
      return sendJson(res, 200, {
        class: {
          ...cls,
          students,
        },
      });
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

    removeTeacher(req, res) {
      if (req.user.role !== 'admin') {
        return problem(res, 403, 'forbidden', 'Only administrators can remove teachers from classes');
      }

      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      const teacherId = Number(req.params.teacherId || req.body?.teacherId);
      if (!teacherId || isNaN(teacherId)) {
        return problem(res, 400, 'invalid-body', 'teacherId is required and must be numeric');
      }

      try {
        classesModel.removeTeacher(classId, teacherId);
        return sendJson(res, 200, {
          message: 'Teacher removed from class successfully',
        });
      } catch (err) {
        return problem(res, 400, 'invalid-body', err.message);
      }
    },

    getClassLabs(req, res) {
      if (req.user.role === 'admin') {
        return problem(res, 403, 'forbidden', 'Administrators do not manage class labs');
      }

      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      if (Number(req.user.classId) !== classId) {
        return problem(res, 403, 'forbidden', 'Access denied to this class labs');
      }

      const cls = classesModel.getClassById(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
      }

      const items = classesModel.getClassLabs(classId);
      return sendJson(res, 200, { items });
    },

    listStudents(req, res) {
      const classId = Number(req.params.classId);
      if (!classId || isNaN(classId)) {
        return problem(res, 400, 'invalid-body', 'Invalid class ID');
      }

      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || Number(req.user.classId) !== Number(classId))) {
        return problem(res, 403, 'forbidden', 'You do not have permission to view students of this class');
      }

      const cls = classesModel.getClassById(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
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
      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || Number(req.user.classId) !== Number(classId))) {
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

      if (req.user.role !== 'admin' && (req.user.role !== 'ta' || Number(req.user.classId) !== Number(classId))) {
        return problem(res, 403, 'forbidden', 'Only the class teacher or administrator can remove students');
      }

      const cls = classesModel.getClassById(classId);
      if (!cls) {
        return problem(res, 404, 'not-found', `Class #${classId} not found`);
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
