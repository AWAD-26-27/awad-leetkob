import { createRouter } from '../../lib/router.js';
import { createClassesModel } from './classes-model.js';
import { createClassesController } from './classes-controller.js';

export function createClassRouter(db, authMiddleware) {
  const router = createRouter();
  const classesModel = createClassesModel(db);
  const controller = createClassesController(classesModel);

  router.get('/api/classes', authMiddleware, controller.list);
  router.post('/api/classes', authMiddleware, controller.create);
  router.get('/api/classes/:classId', authMiddleware, controller.getById);
  router.post('/api/classes/:classId/teachers', authMiddleware, controller.assignTeacher);
  router.post('/api/classes/:classId/teacher', authMiddleware, controller.assignTeacher);
  router.delete(
    '/api/classes/:classId/teachers/:teacherId',
    authMiddleware,
    controller.removeTeacher,
  );
  router.delete('/api/classes/:classId/teachers', authMiddleware, controller.removeTeacher);
  router.delete('/api/classes/:classId/teacher', authMiddleware, controller.removeTeacher);
  router.get('/api/classes/:classId/labs', authMiddleware, controller.getClassLabs);
  router.get('/api/classes/:classId/students', authMiddleware, controller.listStudents);
  router.get('/api/classes/:classId/roster', authMiddleware, controller.listStudents);
  router.post('/api/classes/:classId/students', authMiddleware, controller.assignStudent);
  router.post('/api/classes/:classId/student', authMiddleware, controller.assignStudent);
  router.delete(
    '/api/classes/:classId/students/:studentId',
    authMiddleware,
    controller.removeStudent,
  );
  router.delete('/api/classes/:classId/students', authMiddleware, (req, res) => {
    req.params.studentId = req.params.studentId || req.body?.studentId;
    return controller.removeStudent(req, res);
  });
  router.get('/api/students', authMiddleware, controller.allStudents);
  router.get('/api/my-class', authMiddleware, controller.myClass);
  router.get('/api/my-classes', authMiddleware, controller.myClasses);
  router.get('/api/classes/:classId/my-submissions', authMiddleware, controller.getMySubmissions);
  router.get('/api/classes/:classId/announcements', authMiddleware, controller.getAnnouncements);
  router.post('/api/classes/:classId/announcements', authMiddleware, controller.createAnnouncement);

  return { router, classesModel, controller };
}
