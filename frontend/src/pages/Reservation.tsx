import { useEffect, useState } from "react";
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiZap, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Reservation = {
  date: string;
  slot: "AM" | "PM" | "FULL";
  spotId: string; // UUID from backend
};

type ParkingSpot = {
  id: string;
  spotNumber: string;
};

const SLOT_TO_API: Record<"morning" | "afternoon" | "day", "AM" | "PM" | "FULL"> = {
  morning: "AM",
  afternoon: "PM",
  day: "FULL",
};

const ROWS = ["A", "B", "C", "D", "E", "F"];
const SPOTS_PER_ROW = 10;
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function ReservationPage() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [slot, setSlot] = useState<"morning" | "afternoon" | "day">("day");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const API = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API}/reservations`);
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    fetch(`${API}/parking-spots/all`)
      .then((r) => r.json())
      .then((data: ParkingSpot[]) => setSpots(data))
      .catch((err) => console.error("Erreur chargement places :", err));
    fetchReservations();
  }, []);

  const isSlotReserved = (date: string, uiSlot: "morning" | "afternoon" | "day"): boolean => {
    if (!selectedSpot) return false;
    const spotUuid = spots.find((s) => s.spotNumber === selectedSpot)?.id;
    if (!spotUuid) return false;
    return reservations.some(
      (r) => r.date === date && r.slot === SLOT_TO_API[uiSlot] && r.spotId === spotUuid
    );
  };

  const handleSpotSelect = (id: string) => {
    if (selectedSpot === id) {
      setSelectedSpot(null);
    } else {
      setSelectedSpot(id);
    }
  };

  const handleDateSelect = (date: string) => {
    const d = new Date(date);
    if (d.getDay() === 0 || d.getDay() === 6) return;
    if (isSlotReserved(date, slot)) return;

    setSelectedDates((prev) => {
      if (prev.includes(date)) return prev.filter((d) => d !== date);
      if (prev.length >= 5) {
        setMessage({ text: "Max 5 jours par réservation.", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }
      return [...prev, date];
    });
  };

  const handleSubmit = async () => {
    if (!selectedSpot || selectedDates.length === 0) {
      setMessage({ text: "Veuillez sélectionner une place et au moins une date.", type: "error" });
      return;
    }

    const spotUuid = spots.find((s) => s.spotNumber === selectedSpot)?.id;
    if (!spotUuid) {
      setMessage({ text: "Place introuvable, veuillez réessayer.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const responses = await Promise.all(
        selectedDates.map((date) =>
          fetch(`${API}/reservations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, slot: SLOT_TO_API[slot], spotId: spotUuid }),
          })
        )
      );

      if (responses.every((res) => res.ok)) {
        setMessage({ text: "Réservations effectuées !", type: "success" });
        fetchReservations();
        setSelectedDates([]);
        setSelectedSpot(null);
      } else {
        setMessage({ text: " Échec de la réservation.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: " Erreur de connexion.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6; 

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

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
            {/* Step 1: Slot */}
            <div className="mb-12 border-b border-slate-50 pb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 block text-left">
                1. Moment de la journée
              </label>
              <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl gap-2 w-full max-w-sm mx-auto">
                {(["morning", "afternoon", "day"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSlot(s); setSelectedDates([]); setSelectedSpot(null); }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${slot === s
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s === "morning" ? "Matin" : s === "afternoon" ? "Après-midi" : "Journée"}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="mb-12 border-b border-slate-50 pb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 block">
                2. Sélectionner les dates ({selectedDates.length}/5)
              </label>

              <div className="max-w-md mx-auto">
                {}
                <div className="flex items-center justify-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 mb-6 w-fit mx-auto">
                  <button 
                    onClick={() => changeMonth(-1)} 
                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-black text-indigo-950 px-4 min-w-[140px] text-center capitalize">
                    {viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </span>
                  <button 
                    onClick={() => changeMonth(1)} 
                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>

                {}
                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="text-[10px] font-black text-slate-300 text-center uppercase tracking-tighter">
                      {w}
                    </span>
                  ))}
                </div>

                {}
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(viewDate).map((dateObj, idx) => {
                    if (!dateObj) return <div key={`empty-${idx}`} />;
                    
                    const dateStr = dateObj.toISOString().split("T")[0];
                    const isSelected = selectedDates.includes(dateStr);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateSelect(dateStr)}
                        disabled={isWeekend || isPast}
                        className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : isWeekend || isPast
                              ? "bg-slate-50 border-transparent text-slate-200 cursor-not-allowed"
                              : isToday
                                ? "bg-white border-indigo-200 text-indigo-600 ring-4 ring-indigo-50/50"
                                : "bg-white border-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30"
                        }`}
                      >
                        {dateObj.getDate()}
                        {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {}
            <div className={`mb-12 transition-all duration-500 ${selectedDates.length === 0 ? "opacity-30 pointer-events-none" : ""}`}>
              <div className="flex justify-between mb-8">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                  3. Choisir votre place disponible
                </label>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <FiZap /> Electrique
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-2 h-2 rounded bg-indigo-600"></div> Sélectionnée
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-8">
                <div className="w-full flex items-center justify-start gap-3 text-slate-300 font-black text-xs mb-2 pl-4">
                  <div className="bg-slate-200 p-1.5 rounded-lg text-white">↓</div>
                  <span>ENTRÉE</span>
                </div>

                <div className="w-full space-y-4 max-w-2xl mx-auto">
                  {ROWS.map((row) => (
                    <div key={row} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="w-4 sm:w-6 text-[10px] sm:text-sm font-black text-slate-300 text-center">{row}</span>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                          {Array.from({ length: SPOTS_PER_ROW }, (_, i) => {
                            const id = `${row}${(i + 1).toString().padStart(2, "0")}`;
                            const isElectric = row === "A" || row === "F";
                            const isSelected = selectedSpot === id;
                            

                            const spotUuid = spots.find((s) => s.spotNumber === id)?.id;
                            const isTaken = !!spotUuid && reservations.some(r =>
                              r.spotId === spotUuid &&
                              r.slot === SLOT_TO_API[slot] &&
                              selectedDates.includes(r.date)
                            );

                            return (
                              <button
                                key={id}
                                onClick={() => handleSpotSelect(id)}
                                disabled={isTaken}
                                className={`group relative h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all duration-300 active:scale-90 ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : isTaken
                                      ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/30"
                                }`}
                              >
                                <span className="text-[9px] sm:text-[10px] font-bold tracking-tighter">{id}</span>
                                {isElectric && (
                                  <FiZap className={`absolute top-0.5 right-0.5 text-[7px] sm:text-[8px] ${isSelected ? "text-indigo-200" : isTaken ? "text-slate-200" : "text-amber-400"}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-4 sm:w-6 text-[10px] sm:text-sm font-black text-slate-300 text-center">{row}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full flex items-center justify-end gap-3 text-slate-300 font-black text-xs mt-2 pr-4">
                  <span>SORTIE</span>
                  <div className="bg-slate-200 p-1.5 rounded-lg text-white">↓</div>
                </div>
              </div>
            </div>

            {}
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
                {isSubmitting ? "Traitement..." : `Réserver${selectedSpot ? ` la place ${selectedSpot}` : ""} (${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""})`}
              </button>

              {message && (
                <div className={`mt-6 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${
                  message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationPage;