import { RawDashboardStats, ReservationRepository } from '../../../../domain/ports/out/ReservationRepository';
import { Reservation, ReservationStatus, TimeSlot } from '../../../../domain/models/Reservation';
import { query } from '../../../config/database';

export class PostgresReservationRepository implements ReservationRepository {
  async save(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const { userId, spotId, date, slot, status } = reservation;
    const result = await query(
      `INSERT INTO reservations (user_id, spot_id, date, slot, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id AS "userId", spot_id AS "spotId", date, slot, status, created_at AS "createdAt"`,
      [userId, spotId, date, slot, status]
    );

    return {
      ...result.rows[0],
      date: result.rows[0].date.toISOString().split('T')[0]
    };
  }

  async findById(id: string): Promise<Reservation | null> {
    const result = await query(
      `SELECT id, user_id AS "userId", spot_id AS "spotId", date, slot, status,
              checked_in_at AS "checkedInAt", created_at AS "createdAt"
       FROM reservations WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return {
      ...result.rows[0],
      date: result.rows[0].date.toISOString().split('T')[0]
    };
  }

  async findByUserId(userId: string): Promise<(Reservation & { spotNumber: string })[]> {
    const result = await query(
      `SELECT r.id, r.user_id AS "userId", r.spot_id AS "spotId", r.date, r.slot,
              r.status, r.checked_in_at AS "checkedInAt", r.created_at AS "createdAt",
              s.spot_number AS "spotNumber"
       FROM reservations r
       JOIN parking_spots s ON r.spot_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.date DESC, r.slot DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0]
    }));
  }

  async findBySpotAndDateSlot(spotId: string, date: string, slot: TimeSlot): Promise<Reservation | null> {
    const result = await query(
      `SELECT id, user_id AS "userId", spot_id AS "spotId", date, slot, status, created_at AS "createdAt"
       FROM reservations
       WHERE spot_id = $1 AND date = $2
         AND (slot = $3 OR slot = 'FULL' OR $3 = 'FULL')
         AND status != 'cancelled'
       LIMIT 1`,
      [spotId, date, slot]
    );

    if (result.rowCount === 0) return null;

    return {
      ...result.rows[0],
      date: result.rows[0].date.toISOString().split('T')[0]
    };
  }

  async findAll(): Promise<Reservation[]> {
    const result = await query(
      `SELECT id, user_id AS "userId", spot_id AS "spotId", date, slot, status, created_at AS "createdAt"
       FROM reservations
       WHERE status != 'cancelled'
       ORDER BY date ASC`
    );

    return result.rows.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0]
    }));
  }

  async updateStatus(id: string, status: ReservationStatus, checkedInAt?: Date): Promise<Reservation> {
    const result = await query(
      `UPDATE reservations
       SET status = $2, checked_in_at = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id AS "userId", spot_id AS "spotId", date, slot, status,
                 checked_in_at AS "checkedInAt", created_at AS "createdAt"`,
      [id, status, checkedInAt ?? null]
    );
    return {
      ...result.rows[0],
      date: result.rows[0].date.toISOString().split('T')[0]
    };
  }

  async getRawStats(): Promise<RawDashboardStats> {
    const result = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM reservations
         WHERE date = CURRENT_DATE AND status IN ('pending', 'checked_in', 'completed')) AS "todayCount",

        COALESCE((SELECT AVG(cnt) FROM (
          SELECT COUNT(*)::float AS cnt
          FROM reservations
          WHERE date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
            AND status IN ('pending', 'checked_in', 'completed', 'no_show')
          GROUP BY date
        ) sub), 0) AS "avgDaily",

        (SELECT COUNT(*)::int FROM reservations WHERE status = 'no_show') AS "noShowCount",
        (SELECT COUNT(*)::int FROM reservations WHERE date < CURRENT_DATE AND status != 'cancelled') AS "totalPast",

        (SELECT COUNT(DISTINCT user_id)::int FROM reservations
         WHERE date >= CURRENT_DATE - INTERVAL '30 days') AS "activeUsers",

        (SELECT COUNT(*)::int FROM reservations r
         JOIN parking_spots p ON r.spot_id = p.id
         WHERE p.has_charger = true AND r.status != 'cancelled') AS "evCount",

        (SELECT COUNT(*)::int FROM reservations WHERE status != 'cancelled') AS "totalCount"
    `);

    return result.rows[0];
  }
}
