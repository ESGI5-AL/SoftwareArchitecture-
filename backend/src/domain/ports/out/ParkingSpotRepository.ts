import { ParkingSpot, ParkingSpotAvailability } from '../../models/ParkingSpot';
import { TimeSlot } from '../../models/Reservation';

export interface ParkingSpotRepository {
  findAll(): Promise<ParkingSpot[]>
  findById(id: string): Promise<ParkingSpot | null>
  findAvailableSpots(date: string, slot: TimeSlot): Promise<ParkingSpotAvailability[]>
}
