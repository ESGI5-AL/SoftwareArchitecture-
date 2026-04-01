import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiLogIn, FiAlertCircle, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/reservation", { replace: true });
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <FiMapPin className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Parking<span className="text-indigo-600">Reservation System</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 px-8 py-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FiLogIn /> Connexion
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Adresse e-mail
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-bold">
                <FiAlertCircle className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-[1.25rem] text-base font-black transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <FiLogIn /> Se connecter
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
