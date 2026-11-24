import { createRouter } from '../../lib/router.js';
import { createAuthController } from './auth-controller.js';
import { createRateLimiter } from '../../middleware/rate-limiter.js';

export function createAuthRouter(db, authMiddleware) {
  const router = createRouter();
  const controller = createAuthController(db);
  const loginLimiter = createRateLimiter({ max: 10, windowMs: 60000 });

  router.get('/api/me', authMiddleware, controller.me);
  router.post('/api/login', loginLimiter, controller.login);
  router.post('/api/logout', controller.logout);
  router.post('/api/users/change-password', authMiddleware, controller.changePassword);
  router.put('/api/users/profile', authMiddleware, controller.updateProfile);
  router.patch('/api/users/profile', authMiddleware, controller.updateProfile);
  router.get('/api/users', authMiddleware, controller.listUsers);
  router.post('/api/users', authMiddleware, controller.createUser);

  return { router, controller };
}
