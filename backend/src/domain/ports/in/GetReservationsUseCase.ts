import { Reservation } from '../../models/Reservation';

export interface GetReservationsUseCase {
  execute(): Promise<Reservation[]>
}
