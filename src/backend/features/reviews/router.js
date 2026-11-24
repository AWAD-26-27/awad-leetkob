import { createRouter } from '../../lib/router.js';
import { createReviewModel } from './review-model.js';
import { createReviewController } from './review-controller.js';

export function createReviewRouter(db, labModel, submissionModel, authMiddleware) {
  const router = createRouter();
  const reviewModel = createReviewModel(db);
  const controller = createReviewController(reviewModel, labModel, submissionModel);

  router.get('/api/labs/:labId/queue', authMiddleware, controller.getQueue);
  router.get('/api/reviews/queue', authMiddleware, (req, res) => {
    req.params.labId = req.params.labId || req.query?.labId;
    return controller.getQueue(req, res);
  });
  router.get('/api/queue', authMiddleware, (req, res) => {
    req.params.labId = req.params.labId || req.query?.labId;
    return controller.getQueue(req, res);
  });
  router.post(
    '/api/submissions/:submissionId/constraints/:code/review',
    authMiddleware,
    controller.reviewConstraint,
  );
  router.post('/api/submissions/:submissionId/review', authMiddleware, controller.legacyReview);

  return { router, reviewModel, controller };
}
