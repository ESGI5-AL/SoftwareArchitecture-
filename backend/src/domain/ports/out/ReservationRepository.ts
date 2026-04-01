import { Reservation, TimeSlot } from '../../models/Reservation';

export interface ReservationRepository {
  save(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation>
  findByUserId(userId: string): Promise<(Reservation & { spotNumber: string })[]>
  findBySpotAndDateSlot(spotId: string, date: string, slot: TimeSlot): Promise<Reservation | null>
  findAll(): Promise<Reservation[]>
}
