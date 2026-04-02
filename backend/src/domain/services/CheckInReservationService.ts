import { CheckInReservationUseCase } from '../ports/in/CheckInReservationUseCase';
import { ReservationRepository } from '../ports/out/ReservationRepository';
import { Reservation } from '../models/Reservation';

export class CheckInReservationService implements CheckInReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async checkIn(reservationId: string, userId: string, userRole: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Only the owner or a secretary can check in
    if (reservation.userId !== userId && userRole !== 'secretary') {
      throw new Error('You are not authorized to check in this reservation');
    }

    if (reservation.status !== 'pending') {
      throw new Error(`Cannot check in: reservation status is '${reservation.status}'`);
    }

    const today = new Date().toISOString().split('T')[0];
    if (reservation.date !== today) {
      throw new Error('Check-in is only allowed on the day of the reservation');
    }

    return this.reservationRepository.updateStatus(reservationId, 'checked_in', new Date());
  }
}
