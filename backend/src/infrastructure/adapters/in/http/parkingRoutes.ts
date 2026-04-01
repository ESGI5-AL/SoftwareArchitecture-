import { Router } from 'express';
import { GetAvailabilityHandler } from './handlers/GetAvailabilityHandler';
import { authMiddleware } from './authMiddleware';
import { ParkingSpotRepository } from '../../../../domain/ports/out/ParkingSpotRepository';

export const parkingRoutes = (availabilityHandler: GetAvailabilityHandler, spotRepository: ParkingSpotRepository) => {
  const router = Router();

  router.get('/all', async (_req, res) => {
    try {
      const spots = await spotRepository.findAll();
      res.json(spots);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  router.get('/', authMiddleware, (req, res) => availabilityHandler.handle(req, res));

  return router;
};
