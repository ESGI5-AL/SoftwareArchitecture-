import { Reservation } from '../../models/Reservation';
import { CreateReservationRequestDTO } from '../../dtos/ReservationDTOs';

export interface CreateReservationUseCase {
  create(dto: CreateReservationRequestDTO): Promise<Reservation>
}
