import { Router } from 'express';
import { GetAvailabilityHandler } from './handlers/GetAvailabilityHandler';
import { authMiddleware } from './authMiddleware';

export const parkingRoutes = (availabilityHandler: GetAvailabilityHandler) => {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => availabilityHandler.handle(req, res));

  return router;
};
