import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { PrivateRoute } from "./features/auth/components/PrivateRoute";
import { Navbar } from "./shared/components/Navbar";
import { Footer } from "./shared/components/Footer";
import LoginPage from "./features/auth/pages/LoginPage";
import SkeletonPage from "./pages/Skeleton";
import ReservationPage from "./features/reservation/ReservationPage";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!isLoginPage && <Navbar />}

      <main className={`grow ${!isLoginPage ? "flex items-center justify-center" : ""}`}>
        <div
          className={
            !isLoginPage
              ? "max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-500"
              : "w-full"
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><SkeletonPage /></PrivateRoute>} />
            <Route path="/reservation" element={<PrivateRoute><ReservationPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>

      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
