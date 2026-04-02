import { useEffect, useState } from "react";
import { FiBarChart2, FiUsers, FiZap, FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import api from "../shared/api/client";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  occupancyToday: number;
  avgOccupancyLast30Days: number;
  noShowRate: number;
  evChargerUsageRate: number;
  activeUsers: number;
  totalSpots: number;
  evSpots: number;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border border-border bg-white`}>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardStats>("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl shadow-primary/10 rounded-4xl overflow-hidden border-border">
          <div className="bg-primary p-8 text-primary-foreground rounded-t-4xl">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <FiBarChart2 className="text-primary-foreground/60" /> Tableau de bord
            </h1>
            <p className="text-primary-foreground/60 mt-1 text-sm">Vue d'ensemble du parking</p>
          </div>

          <CardContent className="p-8">
            {loading && <p className="text-slate-500 text-center py-8">Chargement...</p>}
            {error && <p className="text-red-500 text-center py-8">{error}</p>}

            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  icon={<FiTrendingUp className="text-indigo-600 text-xl" />}
                  label="Occupation aujourd'hui"
                  value={`${stats.occupancyToday}%`}
                  sub={`sur ${stats.totalSpots} places`}
                  color="bg-indigo-50"
                />
                <StatCard
                  icon={<FiBarChart2 className="text-blue-600 text-xl" />}
                  label="Occupation moyenne (30j)"
                  value={`${stats.avgOccupancyLast30Days}%`}
                  sub="moyenne journalière"
                  color="bg-blue-50"
                />
                <StatCard
                  icon={<FiAlertCircle className="text-red-500 text-xl" />}
                  label="Taux d'absence"
                  value={`${stats.noShowRate}%`}
                  sub="réservations non utilisées"
                  color="bg-red-50"
                />
                <StatCard
                  icon={<FiZap className="text-yellow-500 text-xl" />}
                  label="Usage bornes électriques"
                  value={`${stats.evChargerUsageRate}%`}
                  sub={`${stats.evSpots} places sur ${stats.totalSpots}`}
                  color="bg-yellow-50"
                />
                <StatCard
                  icon={<FiUsers className="text-green-600 text-xl" />}
                  label="Utilisateurs actifs (30j)"
                  value={`${stats.activeUsers}`}
                  sub="utilisateurs ayant réservé"
                  color="bg-green-50"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
