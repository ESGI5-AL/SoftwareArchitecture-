import type { Reservation, ReservationStatus } from "../types";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "En attente",
  checked_in: "Checked-in",
  completed: "Terminé",
  no_show: "Absent",
  cancelled: "Annulé",
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  checked_in: "bg-green-100 text-green-800",
  completed: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-400",
};

interface Props {
  reservations: Reservation[];
  onCheckIn: (id: string) => void;
}

export function MyReservations({ reservations, onCheckIn }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = reservations.filter((r) => r.date >= today && r.status !== "cancelled");

  if (upcoming.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Mes réservations à venir</h2>
      <div className="space-y-3">
        {upcoming.map((r) => {
          const isToday = r.date === today;
          const canCheckIn = isToday && r.status === "pending";

          return (
            <div
              key={r.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-border bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {isToday ? "Aujourd'hui" : r.date}
                  </p>
                  <p className="text-lg font-black text-slate-800">{r.spotNumber ?? r.spotId.slice(0, 6)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    {r.slot === "AM" ? "Matin" : r.slot === "PM" ? "Après-midi" : "Journée complète"}
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
              </div>

              {canCheckIn && (
                <button
                  onClick={() => onCheckIn(r.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Check-in
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
