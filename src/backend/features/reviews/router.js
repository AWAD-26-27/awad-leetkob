import { createRouter } from '../../lib/router.js';
import { createReviewModel } from './review-model.js';
import { createReviewController } from './review-controller.js';

export function createReviewRouter(db, labModel, submissionModel, authMiddleware) {
  const router = createRouter();
  const reviewModel = createReviewModel(db);
  const controller = createReviewController(reviewModel, labModel, submissionModel);

  router.get('/api/labs/:labId/queue', authMiddleware, controller.getQueue);
  router.post(
    '/api/submissions/:submissionId/constraints/:code/review',
    authMiddleware,
    controller.reviewConstraint,
  );
  router.post('/api/submissions/:submissionId/review', authMiddleware, controller.legacyReview);

  return { router, reviewModel, controller };
}
