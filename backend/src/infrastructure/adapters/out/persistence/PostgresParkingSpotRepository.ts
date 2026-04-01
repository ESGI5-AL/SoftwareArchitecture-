import { ParkingSpotRepository } from '../../../../domain/ports/out/ParkingSpotRepository';
import { ParkingSpot, ParkingSpotAvailability } from '../../../../domain/models/ParkingSpot';
import { TimeSlot } from '../../../../domain/models/Reservation';
import { query } from '../../../config/database';

export class PostgresParkingSpotRepository implements ParkingSpotRepository {
  async findAll(): Promise<ParkingSpot[]> {
    const result = await query(
      `SELECT id, spot_number AS "spotNumber", row, position,
              has_charger AS "hasCharger", is_active AS "isActive"
       FROM parking_spots WHERE is_active = true`
    );
    return result.rows;
  }

  async findById(id: string): Promise<ParkingSpot | null> {
    const result = await query(
      `SELECT id, spot_number AS "spotNumber", row, position,
              has_charger AS "hasCharger", is_active AS "isActive"
       FROM parking_spots WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAvailableSpots(date: string, slot: TimeSlot): Promise<ParkingSpotAvailability[]> {
    const result = await query(
      `SELECT p.id, p.spot_number AS "spotNumber", p.row, p.position,
              p.has_charger AS "hasCharger", p.is_active AS "isActive",
              (CASE WHEN r.id IS NULL THEN true ELSE false END) AS "isAvailable"
       FROM parking_spots p
       LEFT JOIN reservations r ON p.id = r.spot_id
          AND r.date = $1
          AND (r.slot = $2 OR r.slot = 'FULL' OR $2 = 'FULL')
          AND r.status != 'cancelled'
       WHERE p.is_active = true`,
      [date, slot]
    );
    return result.rows;
  }
}
