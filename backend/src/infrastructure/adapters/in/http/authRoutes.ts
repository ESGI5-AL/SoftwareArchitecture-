import { Router } from 'express';
import { LoginHandler } from './handlers/LoginHandler';

export const authRoutes = (loginHandler: LoginHandler) => {
  const router = Router();

  router.post('/login', (req, res) => loginHandler.handle(req, res));

  return router;
};
