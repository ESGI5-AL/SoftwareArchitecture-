import { TimeSlot } from '../models/Reservation';

export interface CreateReservationRequestDTO {
  userId: string;
  spotId: string;
  date: string;
  slot: TimeSlot;
}
