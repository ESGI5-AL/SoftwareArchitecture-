import { Link, Routes, Route, useLocation } from "react-router-dom";
import SkeletonPage from "./pages/Skeleton";
import ReservationPage from "./pages/Reservation";
import { FiActivity, FiCalendar, FiMapPin } from "react-icons/fi";

function App() {
  const location = useLocation();

  // Fonction pour styliser le lien actif
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navbar Moderne */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo & Titre */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <FiMapPin className="text-white text-xl" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">
                Parking<span className="text-indigo-600">Reservation System</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive("/")
                    ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <FiActivity className={isActive("/") ? "animate-pulse" : ""} />
                <span>Status</span>
              </Link>
              
              <Link
                to="/reservation"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive("/reservation")
                    ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <FiCalendar />
                <span>Réservations</span>
              </Link>
            </div>

            {/* Profil / User Placeholder (Optionnel pour le look) */}
            <div className="hidden md:flex items-center">
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal avec effet de transition */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500">
          <Routes>
            <Route path="/" element={<SkeletonPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
          </Routes>
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 Parking Reservation System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;