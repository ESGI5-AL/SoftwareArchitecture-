export type ReservationStatus = "pending" | "checked_in" | "completed" | "no_show" | "cancelled";

export type Reservation = {
  id: string;
  date: string;
  slot: "AM" | "PM" | "FULL";
  spotId: string;
  spotNumber?: string;
  status: ReservationStatus;
};

export type ParkingSpot = {
  id: string;
  spotNumber: string;
  hasCharger?: boolean;
};
