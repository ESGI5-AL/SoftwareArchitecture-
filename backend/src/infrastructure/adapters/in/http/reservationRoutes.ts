import { Router } from 'express';
import { CreateReservationHandler } from './handlers/CreateReservationHandler';
import { GetMyReservationsHandler } from './handlers/GetMyReservationsHandler';
import { GetReservationsHandler } from './handlers/GetReservationsHandler';
import { CheckInReservationHandler } from './handlers/CheckInReservationHandler';
import { authMiddleware } from './authMiddleware';

export const reservationRoutes = (
  createHandler: CreateReservationHandler,
  getHandler: GetMyReservationsHandler,
  getAllHandler: GetReservationsHandler,
  checkInHandler: CheckInReservationHandler
) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => createHandler.handle(req, res));
  router.get('/my', authMiddleware, (req, res) => getHandler.handle(req, res));
  router.get('/', authMiddleware, (req, res) => getAllHandler.handle(req, res));
  router.patch('/:id/check-in', authMiddleware, (req, res) => checkInHandler.handle(req, res));

  return router;
};
