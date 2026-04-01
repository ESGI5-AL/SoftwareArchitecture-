import { CreateReservationUseCase } from '../ports/in/CreateReservationUseCase';
import { ReservationRepository } from '../ports/out/ReservationRepository';
import { ParkingSpotRepository } from '../ports/out/ParkingSpotRepository';
import { MessagePublisher } from '../ports/out/MessagePublisher';
import { Reservation } from '../models/Reservation';
import { CreateReservationRequestDTO } from '../dtos/ReservationDTOs';

export class CreateReservationService implements CreateReservationUseCase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly messagePublisher: MessagePublisher
  ) {}

  async create(dto: CreateReservationRequestDTO): Promise<Reservation> {
    const { userId, spotId, date, slot } = dto;

    // 1. Check spot exists and is active
    const spot = await this.parkingSpotRepository.findById(spotId);
    if (!spot || !spot.isActive) {
      throw new Error(`Parking spot ${spotId} is not available`);
    }

    // 2. Check for conflicts
    const existing = await this.reservationRepository.findBySpotAndDateSlot(spotId, date, slot);
    if (existing) {
      throw new Error(`Spot ${spotId} is already reserved for this time`);
    }

    // 3. Save reservation
    const reservation = await this.reservationRepository.save({
      userId,
      spotId,
      date,
      slot,
      status: 'pending'
    });

    // 4. Publish event (fire-and-forget)
    try {
      await this.messagePublisher.publish('reservation.created', {
        reservationId: reservation.id,
        userId: reservation.userId,
        spotId: reservation.spotId,
        date: reservation.date,
        slot: reservation.slot
      });
    } catch (error) {
      console.warn('Failed to publish reservation event:', error);
    }

    return reservation;
  }
}
