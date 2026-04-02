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
    const { userId, userRole, spotId, date, slot } = dto;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      throw new Error('Cannot reserve a date in the past');
    }

    let maxDate: Date;
    if (userRole === 'manager') {
      // Managers can book up to 30 calendar days from today
      maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 30);
    } else {
      // Employees can book within the current and following calendar week (Mon–Fri)
      const dayOfWeek = today.getDay();
      const daysToThisMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisWeekMonday = new Date(today);
      thisWeekMonday.setDate(today.getDate() - daysToThisMonday);
      maxDate = new Date(thisWeekMonday);
      maxDate.setDate(thisWeekMonday.getDate() + 11);
    }

    if (reservationDate > maxDate) {
      const label = userRole === 'manager' ? '30-day' : 'current and following calendar week';
      throw new Error(`Reservation date exceeds the allowed booking window (${label})`);
    }

    // Check if spot exists and is active
    const spot = await this.parkingSpotRepository.findById(spotId);
    if (!spot || !spot.isActive) {
      throw new Error(`Parking spot ${spotId} is not available`);
    }

    // Check for conflicts
    const existing = await this.reservationRepository.findBySpotAndDateSlot(spotId, date, slot);
    if (existing) {
      throw new Error(`Spot ${spotId} is already reserved for this time`);
    }

    // Save reservation
    const reservation = await this.reservationRepository.save({
      userId,
      spotId,
      date,
      slot,
      status: 'pending'
    });

    // Publish event
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
