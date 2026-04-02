import { GetParkingAvailabilityUseCase } from '../ports/in/GetParkingAvailabilityUseCase';
import { ParkingSpotRepository } from '../ports/out/ParkingSpotRepository';
import { ParkingSpotAvailability } from '../models/ParkingSpot';
import { TimeSlot } from '../models/Reservation';

export class GetAvailabilityService implements GetParkingAvailabilityUseCase {
  constructor(private readonly parkingSpotRepository: ParkingSpotRepository) {}

  async getAvailability(date: string, slot: TimeSlot): Promise<ParkingSpotAvailability[]> {
    return this.parkingSpotRepository.findAvailableSpots(date, slot);
  }
}
