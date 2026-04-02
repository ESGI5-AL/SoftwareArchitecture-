import { Reservation } from '../../models/Reservation';

export interface CheckInReservationUseCase {
  checkIn(reservationId: string, userId: string, userRole: string): Promise<Reservation>
}
