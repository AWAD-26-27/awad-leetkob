import { createRouter } from '../../lib/router.js';
import { createAuthController } from './auth-controller.js';

export function createAuthRouter(db, authMiddleware) {
  const router = createRouter();
  const controller = createAuthController(db);

  router.get('/api/me', authMiddleware, controller.me);
  router.post('/api/login', controller.login);
  router.post('/api/logout', controller.logout);
  router.post('/api/users/change-password', authMiddleware, controller.changePassword);
  router.get('/api/users', authMiddleware, controller.listUsers);
  router.post('/api/users', authMiddleware, controller.createUser);

  return { router, controller };
}
