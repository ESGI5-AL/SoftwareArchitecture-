import { ReservationRepository } from '../../../../domain/ports/out/ReservationRepository';
import { Reservation, TimeSlot } from '../../../../domain/models/Reservation';
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

  async findByUserId(userId: string): Promise<(Reservation & { spotNumber: string })[]> {
    const result = await query(
      `SELECT r.id, r.user_id AS "userId", r.spot_id AS "spotId", r.date, r.slot,
              r.status, r.created_at AS "createdAt", s.spot_number AS "spotNumber"
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
}
