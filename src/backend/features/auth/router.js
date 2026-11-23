import { createRouter } from '../../lib/router.js';
import { createAuthController } from './auth-controller.js';

export function createAuthRouter(db, authMiddleware) {
  const router = createRouter();
  const controller = createAuthController(db);

  router.get('/api/me', authMiddleware, controller.me);
  router.post('/api/login', controller.login);

  return { router, controller };
}
