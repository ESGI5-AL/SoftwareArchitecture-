import { Router, Request, Response } from 'express';
import pool from '../infrastructure/config/database';

const router = Router();

/**
 * GET /api/reservations
 * Returns active reservations mapped to frontend format: { date, slot, spotId }
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT reservation_date AS date, slot, spot_id AS "spotId"
       FROM reservations
       WHERE status = 'active'
       ORDER BY reservation_date, slot`
    );

    const reservations: { date: string; slot: string; spotId: string }[] = [];
    
    // Track pairs for 'day' logic
    const dayMap: Record<string, Record<string, { am: boolean; pm: boolean }>> = {};

    result.rows.forEach((r: any) => {
      const dateStr = r.date.toISOString().split('T')[0];
      const spotId = r.spotId;
      if (!dayMap[dateStr]) dayMap[dateStr] = {};
      if (!dayMap[dateStr][spotId]) dayMap[dateStr][spotId] = { am: false, pm: false };

      if (r.slot === 'AM') {
        reservations.push({ date: dateStr, slot: 'morning', spotId });
        dayMap[dateStr][spotId].am = true;
      } else if (r.slot === 'PM') {
        reservations.push({ date: dateStr, slot: 'afternoon', spotId });
        dayMap[dateStr][spotId].pm = true;
      }
    });

    // If a spot is taken for either AM or PM, mark it as taken for 'day' too
    Object.keys(dayMap).forEach(dateStr => {
      Object.keys(dayMap[dateStr]).forEach(spotId => {
        if (dayMap[dateStr][spotId].am || dayMap[dateStr][spotId].pm) {
          reservations.push({ date: dateStr, slot: 'day', spotId });
        }
      });
    });

    res.json(reservations);
  } catch (error: any) {
    console.error('GET /reservations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reservations
 * Body: { date: "YYYY-MM-DD", slot: "morning" | "afternoon" | "day", spotId: string }
 */
router.post('/', async (req: Request, res: Response) => {
  const { date, slot, spotId } = req.body;

  if (!date || !slot || !spotId) {
    res.status(400).json({ error: 'date, slot et spotId sont requis' });
    return;
  }

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'user@test.com' LIMIT 1");
    const userId = userRes.rows[0].id;

    const requiredSlots = slot === 'day' ? ['AM', 'PM'] : [slot === 'morning' ? 'AM' : 'PM'];

    // CHECK AVAILABILITY for the specific spot
    const existing = await pool.query(
      `SELECT id FROM reservations
       WHERE spot_id = $1 AND reservation_date = $2 AND slot = ANY($3) AND status = 'active'`,
      [spotId, date, requiredSlots]
    );

    if (existing && existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: `La place ${spotId} est déjà occupée pour ce créneau` });
      return;
    }

    for (const s of requiredSlots) {
      await pool.query(
        `INSERT INTO reservations (user_id, spot_id, slot, reservation_date, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [userId, spotId, s, date]
      );
    }

    res.status(201).json({ message: 'Réservation réussie', spot: spotId });
  } catch (error: any) {
    console.error('POST /reservations error:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
