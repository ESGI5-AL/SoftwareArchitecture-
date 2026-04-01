import { FiCalendar } from "react-icons/fi";
import { useReservations } from "./hooks/useReservations";
import { useCalendar } from "./hooks/useCalendar";
import { SlotSelector } from "./components/SlotSelector";
import { Calendar } from "./components/Calendar";
import { ParkingGrid } from "./components/ParkingGrid";
import { StatusMessage } from "./components/StatusMessage";

function ReservationPage() {
  const {
    selectedSpot,
    selectedDates,
    slot,
    reservations,
    spots,
    message,
    isSubmitting,
    handleSpotSelect,
    handleDateSelect,
    handleSubmit,
    changeSlot,
  } = useReservations();

  const { viewDate, getDaysInMonth, changeMonth } = useCalendar();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl shadow-indigo-100 rounded-[2rem] overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <FiCalendar className="text-indigo-200" /> Réserver mon parking
            </h1>
          </div>

          <div className="p-8 text-left">
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

            <div className="pt-8 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0 || isSubmitting || !selectedSpot}
                className={`w-full py-5 rounded-[1.25rem] text-lg font-black transition-all ${
                  selectedDates.length === 0 || isSubmitting || !selectedSpot
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"
                }`}
              >
                {isSubmitting
                  ? "Traitement..."
                  : `Réserver${selectedSpot ? ` la place ${selectedSpot}` : ""} (${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""})`}
              </button>
              <StatusMessage message={message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationPage;
