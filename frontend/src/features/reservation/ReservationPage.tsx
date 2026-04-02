import { FiCalendar } from "react-icons/fi";
import { useReservations } from "./hooks/useReservations";
import { useCalendar } from "./hooks/useCalendar";
import { SlotSelector } from "./components/SlotSelector";
import { Calendar } from "./components/Calendar";
import { ParkingGrid } from "./components/ParkingGrid";
import { StatusMessage } from "./components/StatusMessage";
import { MyReservations } from "./components/MyReservations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ReservationPage() {
  const {
    selectedSpot,
    selectedDates,
    slot,
    reservations,
    myReservations,
    spots,
    message,
    isSubmitting,
    handleSpotSelect,
    handleDateSelect,
    handleSubmit,
    handleCheckIn,
    changeSlot,
  } = useReservations();

  const { viewDate, getDaysInMonth, changeMonth } = useCalendar();

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl shadow-primary/10 rounded-4xl overflow-hidden border-border">
          <div className="bg-primary p-8 text-primary-foreground rounded-t-4xl">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <FiCalendar className="text-primary-foreground/60" /> Réserver mon parking
            </h1>
          </div>

          <CardContent className="p-8 text-left">
            <SlotSelector slot={slot} onChange={changeSlot} />

            <Calendar
              selectedDates={selectedDates}
              viewDate={viewDate}
              getDaysInMonth={getDaysInMonth}
              changeMonth={changeMonth}
              onDateSelect={handleDateSelect}
            />

            <ParkingGrid
              selectedSpot={selectedSpot}
              selectedDates={selectedDates}
              slot={slot}
              spots={spots}
              reservations={reservations}
              onSpotSelect={handleSpotSelect}
            />

            <div className="pt-8 border-t border-border">
              <Button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0 || isSubmitting || !selectedSpot}
                size="lg"
                className="w-full py-5 rounded-[1.25rem] text-lg font-black active:scale-95"
              >
                {isSubmitting
                  ? "Traitement..."
                  : `Réserver${selectedSpot ? ` la place ${selectedSpot}` : ""} (${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""})`}
              </Button>
              <StatusMessage message={message} />
            </div>

            <MyReservations reservations={myReservations} onCheckIn={handleCheckIn} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReservationPage;
