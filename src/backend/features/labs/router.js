import { createRouter } from '../../lib/router.js';
import { createLabModel } from './lab-model.js';
import { createLabController } from './lab-controller.js';

export function createLabRouter(db, authMiddleware) {
  const router = createRouter();
  const labModel = createLabModel(db);
  const controller = createLabController(db, labModel);

  router.get('/api/labs', authMiddleware, controller.list);
  router.get('/api/labs/:labId', authMiddleware, controller.get);
  router.post('/api/labs', authMiddleware, controller.create);
  router.post('/api/labs/:labId/publish', authMiddleware, controller.publish);

  return { router, labModel, controller };
}
