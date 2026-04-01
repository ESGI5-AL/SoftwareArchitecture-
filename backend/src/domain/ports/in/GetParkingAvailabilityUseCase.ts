import { ParkingSpotAvailability } from '../../models/ParkingSpot';
import { TimeSlot } from '../../models/Reservation';

export interface GetParkingAvailabilityUseCase {
  getAvailability(date: string, slot: TimeSlot): Promise<ParkingSpotAvailability[]>
}
