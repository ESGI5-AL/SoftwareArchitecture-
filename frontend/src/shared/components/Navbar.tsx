import { Link, useLocation } from "react-router-dom";
import { FiActivity, FiCalendar, FiMapPin, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <FiMapPin className="text-white text-xl" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              Parking<span className="text-indigo-600">Reservation System</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive("/")
                  ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <FiActivity className={isActive("/") ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">Status Système</span>
              <span className="sm:hidden">Status</span>
            </Link>

            <Link
              to="/reservation"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive("/reservation")
                  ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <FiCalendar />
              <span>Réservations</span>
            </Link>

            {isAuthenticated && user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <FiUser className="text-indigo-600 text-sm" />
                  <span className="text-sm font-bold text-slate-700">{user.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-lg">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
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
