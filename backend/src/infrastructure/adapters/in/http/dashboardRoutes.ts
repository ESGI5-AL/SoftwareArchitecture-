import { Router } from 'express';
import { GetDashboardStatsHandler } from './handlers/GetDashboardStatsHandler';
import { authMiddleware, requireRole } from './authMiddleware';

export const dashboardRoutes = (statsHandler: GetDashboardStatsHandler) => {
  const router = Router();

  router.get('/stats', authMiddleware, requireRole('manager', 'secretary'), (req, res) =>
    statsHandler.handle(req, res)
  );

  return router;
};
