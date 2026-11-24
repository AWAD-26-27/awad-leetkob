import { createRouter } from '../../lib/router.js';
import { createClassesModel } from './classes-model.js';
import { createClassesController } from './classes-controller.js';

export function createClassRouter(db, authMiddleware) {
  const router = createRouter();
  const classesModel = createClassesModel(db);
  const controller = createClassesController(classesModel);

  router.get('/api/classes', authMiddleware, controller.list);
  router.post('/api/classes', authMiddleware, controller.create);
  router.post('/api/classes/:classId/teachers', authMiddleware, controller.assignTeacher);
  router.get('/api/classes/:classId/students', authMiddleware, controller.listStudents);
  router.post('/api/classes/:classId/students', authMiddleware, controller.assignStudent);
  router.delete('/api/classes/:classId/students/:studentId', authMiddleware, controller.removeStudent);
  router.get('/api/students', authMiddleware, controller.allStudents);

  return { router, classesModel, controller };
}
