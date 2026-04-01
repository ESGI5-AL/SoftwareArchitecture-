import { GetReservationsUseCase } from '../ports/in/GetReservationsUseCase';
import { ReservationRepository } from '../ports/out/ReservationRepository';
import { Reservation } from '../models/Reservation';

export class GetReservationsService implements GetReservationsUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(): Promise<Reservation[]> {
    return this.reservationRepository.findAll();
  }
}
