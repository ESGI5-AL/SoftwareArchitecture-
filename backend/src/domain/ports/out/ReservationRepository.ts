import { Reservation, ReservationStatus, TimeSlot } from '../../models/Reservation';

export interface RawDashboardStats {
  todayCount: number;
  avgDaily: number;
  noShowCount: number;
  totalPast: number;
  activeUsers: number;
  evCount: number;
  totalCount: number;
}

export interface ReservationRepository {
  save(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation>
  findById(id: string): Promise<Reservation | null>
  findByUserId(userId: string): Promise<(Reservation & { spotNumber: string })[]>
  findBySpotAndDateSlot(spotId: string, date: string, slot: TimeSlot): Promise<Reservation | null>
  findAll(): Promise<Reservation[]>
  updateStatus(id: string, status: ReservationStatus, checkedInAt?: Date): Promise<Reservation>
  getRawStats(): Promise<RawDashboardStats>
}
