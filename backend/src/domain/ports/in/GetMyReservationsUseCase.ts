import { Reservation } from '../../models/Reservation';

export interface GetMyReservationsUseCase {
  getMyReservations(userId: string): Promise<(Reservation & { spotNumber: string })[]>
}
