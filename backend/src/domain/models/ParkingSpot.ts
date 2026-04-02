export interface ParkingSpot {
  id: string;
  spotNumber: string;      // "A01", "B05", "F10"
  row: string;             // "A" through "F"
  position: number;        // 1 through 10
  hasCharger: boolean;     // rows A and F have chargers
  isActive: boolean;
}

// Extended with availability info for a given date+slot
export interface ParkingSpotAvailability extends ParkingSpot {
  isAvailable: boolean;
}
