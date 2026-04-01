import { Router } from 'express';
import { CreateReservationHandler } from './handlers/CreateReservationHandler';
import { GetMyReservationsHandler } from './handlers/GetMyReservationsHandler';
import { GetReservationsHandler } from './handlers/GetReservationsHandler';
import { authMiddleware } from './authMiddleware';

export const reservationRoutes = (
  createHandler: CreateReservationHandler,
  getHandler: GetMyReservationsHandler,
  getAllHandler: GetReservationsHandler
) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => createHandler.handle(req, res));
  router.get('/my', authMiddleware, (req, res) => getHandler.handle(req, res));
  router.get('/', (req, res) => getAllHandler.handle(req, res));

  return router;
};
