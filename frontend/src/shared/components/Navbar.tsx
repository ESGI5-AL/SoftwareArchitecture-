import { Link, useLocation } from "react-router-dom";
import { FiBarChart2, FiCalendar, FiClock, FiMapPin, FiLogOut, FiUser, FiServer } from "react-icons/fi";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isManagerOrSecretary = user?.role === "manager" || user?.role === "secretary";

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg">
              <FiMapPin className="text-primary-foreground text-xl" />
            </div>
            <span className="text-xl font-black text-foreground tracking-tight">
              Parking<span className="text-primary">Reservation System</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/reservation"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive("/reservation")
                  ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FiCalendar />
              <span>Réservations</span>
            </Link>

            <Link
              to="/skeleton"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive("/skeleton")
                  ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FiServer />
              <span className="hidden sm:inline">Système</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive("/history")
                  ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FiClock />
              <span className="hidden sm:inline">Historique</span>
            </Link>

            {isManagerOrSecretary && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive("/dashboard")
                    ? "bg-accent text-accent-foreground ring-1 ring-border shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <FiBarChart2 />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {isAuthenticated && user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border">
                  <FiUser className="text-primary text-sm" />
                  <span className="text-sm font-bold text-foreground">{user.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-accent-foreground bg-accent px-1.5 py-0.5 rounded-lg">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                >
                  <FiLogOut />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
