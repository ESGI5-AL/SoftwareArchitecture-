export type TimeSlot = 'AM' | 'PM' | 'FULL'
export type ReservationStatus = 'pending' | 'checked_in' | 'completed' | 'no_show' | 'cancelled'

export interface Reservation {
  id: string
  userId: string
  spotId: string
  date: string            // "YYYY-MM-DD"
  slot: TimeSlot
  status: ReservationStatus
  checkedInAt?: Date
  createdAt: Date
  cancelledAt?: Date
  cancelledBy?: string
}
