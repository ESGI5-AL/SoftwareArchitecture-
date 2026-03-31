import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import SkeletonPage from "./pages/Skeleton";
import ReservationPage from "./pages/Reservation";
import "./App.css";

function App() {
  const location = useLocation();

  // Fonction pour vérifier si le lien est actif
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* En-tête principal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight">
            PARKING<span className="text-slate-800">SYSTEM</span>
          </h1>

          {/* Navigation unifiée via React Router */}
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            <Link
              to="/"
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive("/") 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Status & Test
            </Link>
            <Link
              to="/reservation"
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive("/reservation") 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Réservations
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu principal dynamique */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="transition-all duration-300">
          <Routes>
            {/* Route par défaut (Page de test) */}
            <Route path="/" element={<SkeletonPage />} />
            
            {/* Route vers la page de réservation */}
            <Route path="/reservation" element={<ReservationPage />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 Parking Reservation System • Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;