import { useEffect, useState } from "react";

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

  const handleDateSelect = (date: string) => {
    if (isSlotReserved(date, slot)) return;
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
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

      const allSuccess = responses.every((res) => res.ok);
      if (allSuccess) {
        setMessage({ text: "✨ Réservations effectuées avec succès !", type: "success" });
        fetchReservations();
        setSelectedDates([]);
      } else {
        setMessage({ text: "❌ Une ou plusieurs réservations ont échoué.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "❌ Une erreur réseau est survenue.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000); // Auto-hide message
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      dayName: d.toLocaleDateString("fr-FR", { weekday: "short" }).replace('.', ''),
      dayNum: d.toLocaleDateString("fr-FR", { day: "numeric" }),
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
    };
  };

  const getNextDates = (count: number) => {
    const dates = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden border border-slate-100">
          
          {/* Header Section */}
          <div className="bg-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-extrabold tracking-tight">Réserver un créneau</h1>
            <p className="mt-2 text-indigo-100 opacity-90">Sélectionnez vos dates et l'horaire souhaité.</p>
          </div>

          <div className="p-8">
            {/* Slot Selection */}
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center">
                <span className="mr-2">🕒</span> 1. Choisir le moment
              </h2>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                {(["morning", "afternoon", "day"] as const).map((currentSlot) => (
                  <button
                    key={currentSlot}
                    onClick={() => { setSlot(currentSlot); setSelectedDates([]); }}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      slot === currentSlot
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    {currentSlot === "morning" ? "Matin" : currentSlot === "afternoon" ? "Après-midi" : "Journée"}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection Grid */}
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center">
                <span className="mr-2">📅</span> 2. Sélectionner les dates
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {getNextDates(14).map((dateString) => {
                  const isReserved = isSlotReserved(dateString, slot);
                  const isSelected = selectedDates.includes(dateString);
                  const { dayName, dayNum, month } = formatDate(dateString);

                  return (
                    <button
                      key={dateString}
                      onClick={() => handleDateSelect(dateString)}
                      disabled={isReserved}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                          : isReserved
                          ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60"
                          : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-60 leading-tight">{dayName}</span>
                      <span className="text-xl font-black my-0.5">{dayNum}</span>
                      <span className="text-[10px] font-medium leading-tight">{month}</span>
                      {isReserved && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 rounded-2xl">
                           <div className="w-6 h-[2px] bg-slate-300 rotate-45 absolute" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Section */}
            <div className="border-t border-slate-100 pt-8">
              <button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0 || isSubmitting}
                className={`w-full group relative flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white transition-all duration-300 ${
                  selectedDates.length === 0 || isSubmitting
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Traitement...
                  </span>
                ) : (
                  `Réserver ${selectedDates.length > 0 ? `(${selectedDates.length})` : "maintenant"}`
                )}
              </button>

              {message && (
                <div
                  className={`mt-6 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center justify-center ${
                    message.type === "success" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-slate-400 text-sm italic">
          Une question ? Contactez le support au 01 23 45 67 89
        </p>
      </div>
    </div>
  );
}

export default ReservationPage;