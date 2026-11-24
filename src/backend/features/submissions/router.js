import { createRouter } from '../../lib/router.js';
import { createSubmissionModel } from './submission-model.js';
import { createSubmissionController } from './submission-controller.js';

export function createSubmissionRouter(db, labModel, authMiddleware) {
  const router = createRouter();
  const submissionModel = createSubmissionModel(db);
  const controller = createSubmissionController(submissionModel, labModel);

  router.post('/api/labs/:labId/submissions', authMiddleware, controller.submit);
  router.get('/api/labs/:labId/submissions', authMiddleware, controller.list);
  router.get('/api/submissions/:submissionId', authMiddleware, controller.get);

  // Remapped aliases for flexible client routing
  router.get('/api/submissions', authMiddleware, (req, res) => {
    req.params.labId = req.params.labId || req.query?.labId;
    return controller.list(req, res);
  });
  router.post('/api/submissions', authMiddleware, (req, res) => {
    req.params.labId = req.params.labId || req.body?.labId;
    return controller.submit(req, res);
  });

  return { router, submissionModel, controller };
}
