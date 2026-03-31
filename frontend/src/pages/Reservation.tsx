import { useEffect, useState } from "react";
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type Reservation = {
  date: string;
  slot: "morning" | "afternoon" | "day";
};

function ReservationPage() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [slot, setSlot] = useState<"morning" | "afternoon" | "day">("day");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reservations");
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const isSlotReserved = (date: string, slot: Reservation["slot"]): boolean => {
    return reservations.some((r) => r.date === date && r.slot === slot);
  };

  // --- LOGIQUE DE SÉLECTION ---
  const handleDateSelect = (date: string) => {
    if (isSlotReserved(date, slot)) return;

    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date);
      }
      // Contrainte : Max 5 jours ouvrés
      if (prev.length >= 5) {
        setMessage({ text: "Vous ne pouvez pas réserver plus de 5 jours ouvrés.", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }
      return [...prev, date];
    });
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setMessage({ text: "Veuillez sélectionner au moins une date.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const responses = await Promise.all(
        selectedDates.map((date) =>
          fetch("http://localhost:3000/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, slot }),
          })
        )
      );

      if (responses.every((res) => res.ok)) {
        setMessage({ text: "✨ Réservations effectuées !", type: "success" });
        fetchReservations();
        setSelectedDates([]);
      } else {
        setMessage({ text: "❌ Échec de la réservation.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "❌ Erreur de connexion.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // --- LOGIQUE CALENDRIER (Jours ouvrés uniquement) ---
  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0: Dimanche, 6: Samedi
  };

  const getNextWorkingDates = (count: number) => {
    const dates = [];
    let d = new Date(); // Commence AUJOURD'HUI
    
    while (dates.length < count) {
      if (isWorkingDay(d)) {
        dates.push(d.toISOString().split("T")[0]);
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      dayName: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace('.', ''),
      dayNum: d.toLocaleDateString("fr-FR", { day: "numeric" }),
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl shadow-indigo-100 rounded-[2rem] overflow-hidden border border-slate-100">
          
          <div className="bg-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <FiCalendar className="text-indigo-200" /> Réserver une place
            </h1>
            <p className="mt-2 text-indigo-100 font-medium opacity-90">
              Maximum 5 jours ouvrés par réservation.
            </p>
          </div>

          <div className="p-8">
            {/* 1. Slot Selection */}
            <div className="mb-10">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">
                1. Moment de la journée
              </label>
              <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl gap-2">
                {(["morning", "afternoon", "day"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSlot(s); setSelectedDates([]); }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${
                      slot === s 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200" 
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s === "morning" ? "Matin" : s === "afternoon" ? "Après-midi" : "Journée"}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Date Selection */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                  2. Sélectionner les dates ({selectedDates.length}/5)
                </label>
                {selectedDates.length >= 5 && (
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded">LIMITE ATTEINTE</span>
                )}
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                {getNextWorkingDates(14).map((dateStr) => {
                  const isReserved = isSlotReserved(dateStr, slot);
                  const isSelected = selectedDates.includes(dateStr);
                  const { dayName, dayNum, month } = formatDate(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(dateStr)}
                      disabled={isReserved}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : isReserved
                          ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60"
                          : "bg-white border-slate-100 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-tighter mb-0.5">{dayName}</span>
                      <span className="text-lg font-black leading-none">{dayNum}</span>
                      <span className="text-[9px] font-medium mt-0.5">{month}</span>
                      
                      {isReserved && <div className="absolute inset-0 bg-slate-50/40 rounded-2xl backdrop-blur-[1px]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0 || isSubmitting}
                className={`w-full py-5 rounded-[1.25rem] text-lg font-black transition-all duration-300 ${
                  selectedDates.length === 0 || isSubmitting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"
                }`}
              >
                {isSubmitting ? "Traitement..." : `Réserver ${selectedDates.length} jour(s)`}
              </button>

              {message && (
                <div className={`mt-6 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top-2 ${
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