import { GetMyReservationsUseCase } from '../ports/in/GetMyReservationsUseCase';
import { ReservationRepository } from '../ports/out/ReservationRepository';
import { Reservation } from '../models/Reservation';

export class GetMyReservationsService implements GetMyReservationsUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async getMyReservations(userId: string): Promise<(Reservation & { spotNumber: string })[]> {
    return this.reservationRepository.findByUserId(userId);
  }
}
