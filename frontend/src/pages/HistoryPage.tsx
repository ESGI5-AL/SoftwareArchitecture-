import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import api from "../shared/api/client";
import type { Reservation, ReservationStatus } from "../features/reservation/types";
import { Card, CardContent } from "@/components/ui/card";

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

export default function HistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Reservation[]>("/reservations/my")
      .then(({ data }) => setReservations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl shadow-primary/10 rounded-4xl overflow-hidden border-border">
          <div className="bg-primary p-8 text-primary-foreground rounded-t-4xl">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <FiClock className="text-primary-foreground/60" /> Historique de mes réservations
            </h1>
          </div>

          <CardContent className="p-8">
            {loading ? (
              <p className="text-slate-500 text-center py-8">Chargement...</p>
            ) : reservations.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune réservation trouvée.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <p className="text-sm font-bold text-slate-800">{r.date}</p>
                        <p className="text-xs text-slate-500">
                          {r.slot === "AM" ? "Matin" : r.slot === "PM" ? "Après-midi" : "Journée"}
                        </p>
                      </div>
                      <div className="text-lg font-black text-indigo-600">
                        {r.spotNumber ?? "—"}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
