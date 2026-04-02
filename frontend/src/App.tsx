import { type ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { PrivateRoute } from "./features/auth/components/PrivateRoute";
import { Navbar } from "./shared/components/Navbar";
import { Footer } from "./shared/components/Footer";
import { useAuth } from "./features/auth/hooks/useAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import ReservationPage from "./features/reservation/ReservationPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";

function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/reservation" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === "manager" || user?.role === "secretary") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/reservation" replace />;
}

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
            <Route path="/" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />
            <Route path="/reservation" element={<PrivateRoute><ReservationPage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleRoute roles={["manager", "secretary"]}>
                    <DashboardPage />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
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
