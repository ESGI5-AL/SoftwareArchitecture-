import { Router, Request, Response } from 'express';
import pool from '../infrastructure/config/database';

const router = Router();

/**
 * GET /api/test
 * Walking-skeleton endpoint: verifies full connectivity
 *   Frontend → Backend → PostgreSQL → Backend → Frontend
 */
router.get('/test', async (_req: Request, res: Response) => {
  try {
    const dbResult = await pool.query('SELECT NOW() AS server_time, current_database() AS db_name');
    const { server_time, db_name } = dbResult.rows[0];

    const usersResult = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const spotsResult = await pool.query('SELECT COUNT(*)::int AS count FROM parking_spots');
    const reservationsResult = await pool.query('SELECT COUNT(*)::int AS count FROM reservations');

    res.json({
      message: 'Skeleton flow OK — Frontend → Backend → Database round-trip successful!',
      details: {
        database: db_name,
        serverTime: server_time,
        seedData: {
          users: usersResult.rows[0].count,
          parkingSpots: spotsResult.rows[0].count,
          reservations: reservationsResult.rows[0].count,
        },
      },
    });
  } catch (error: any) {
    console.error('Test route error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

export default router;
