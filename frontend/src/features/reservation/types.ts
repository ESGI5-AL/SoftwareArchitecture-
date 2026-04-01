export type Reservation = {
  date: string;
  slot: "AM" | "PM" | "FULL";
  spotId: string;
};

export type ParkingSpot = {
  id: string;
  spotNumber: string;
};
