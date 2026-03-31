import { Router, Request, Response } from 'express';
import pool from '../infrastructure/config/database';

const router = Router();

/**
 * GET /api/reservations/availability
 * Check available spots for a given parking lot, date, and slot (AM/PM).
 *
 * Query params:
 *   - parkingLotId (UUID)
 *   - date (YYYY-MM-DD)
 *   - slot (AM | PM)
 */
router.get('/availability', async (req: Request, res: Response) => {
  const { parkingLotId, date, slot } = req.query;

  if (!parkingLotId || !date || !slot) {
    res.status(400).json({
      error: 'Paramètres manquants: parkingLotId, date, slot (AM ou PM) sont requis',
    });
    return;
  }

  if (slot !== 'AM' && slot !== 'PM') {
    res.status(400).json({ error: 'Le créneau doit être AM ou PM' });
    return;
  }

  try {
    // 1. Get parking lot info
    const lotResult = await pool.query(
      'SELECT id, name, total_spots FROM parking_lots WHERE id = $1',
      [parkingLotId]
    );

    if (lotResult.rows.length === 0) {
      res.status(404).json({ error: 'Parking non trouvé' });
      return;
    }

    const lot = lotResult.rows[0];

    // 2. Get occupied spots for this lot/date/slot
    const occupiedResult = await pool.query(
      `SELECT spot_number FROM reservations
       WHERE parking_lot_id = $1
         AND reservation_date = $2
         AND slot = $3
         AND status = 'active'
       ORDER BY spot_number`,
      [parkingLotId, date, slot]
    );

    const occupiedSpots = occupiedResult.rows.map((r: any) => r.spot_number);
    const totalSpots = lot.total_spots;
    const availableCount = totalSpots - occupiedSpots.length;

    // 3. Build list of available spot numbers
    const availableSpots: number[] = [];
    for (let i = 1; i <= totalSpots; i++) {
      if (!occupiedSpots.includes(i)) {
        availableSpots.push(i);
      }
    }

    res.json({
      parking: lot.name,
      date,
      slot,
      totalSpots,
      occupiedCount: occupiedSpots.length,
      availableCount,
      occupiedSpots,
      availableSpots,
    });
  } catch (error: any) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reservations
 * List all reservations (optionally filtered by date).
 *
 * Query params:
 *   - date (optional, YYYY-MM-DD)
 */
router.get('/', async (req: Request, res: Response) => {
  const { date } = req.query;

  try {
    let query = `
      SELECT r.id, r.spot_number, r.slot, r.reservation_date, r.status,
             u.email AS user_email,
             p.name AS parking_name
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN parking_lots p ON r.parking_lot_id = p.id
    `;
    const params: any[] = [];

    if (date) {
      query += ' WHERE r.reservation_date = $1';
      params.push(date);
    }

    query += ' ORDER BY r.reservation_date, r.slot, r.spot_number';

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      reservations: result.rows,
    });
  } catch (error: any) {
    console.error('List reservations error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
