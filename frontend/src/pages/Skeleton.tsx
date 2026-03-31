import { useState } from "react";
import { FiServer, FiActivity, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function SkeletonPage() {
  const [response, setResponse] = useState<{ message: string; status: "success" | "error" } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testBackend = async () => {
    setIsTesting(true);
    setResponse(null);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5050/api"}/test`);
      const data = await res.json();
      setResponse({ message: data.message, status: "success" });
    } catch (error) {
      setResponse({
        message: "Le serveur distant ne répond pas. Vérifiez votre configuration réseau.",
        status: "error"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          
          {}
          <div className="p-8 pb-4 text-center">
            <div className="relative inline-flex mb-6">
              <div className={`absolute inset-0 rounded-3xl blur-xl transition-colors duration-500 ${
                isTesting ? "bg-amber-500/30" : response?.status === "success" ? "bg-emerald-500/30" : response?.status === "error" ? "bg-rose-500/30" : "bg-indigo-500/20"
              }`} />
              <div className="relative bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-inner">
                <FiServer className={`text-4xl transition-colors duration-500 ${
                  isTesting ? "text-amber-400 animate-pulse" : response?.status === "success" ? "text-emerald-400" : response?.status === "error" ? "text-rose-400" : "text-indigo-400"
                }`} />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
              Status du Système
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Vérification de la passerelle API v1.0
            </p>
          </div>

          <div className="p-8 pt-4">
            {}
            <button
              onClick={testBackend}
              disabled={isTesting}
              className={`group relative w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                isTesting
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-[0.97]"
              }`}
            >
              {isTesting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
                  <span>Analyse des paquets...</span>
                </>
              ) : (
                <>
                  <FiActivity className="group-hover:rotate-12 transition-transform" />
                  <span>Lancer le diagnostic</span>
                </>
              )}
            </button>

            {}
            <div className={`mt-6 overflow-hidden transition-all duration-500 ease-out ${response ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className={`p-5 rounded-2xl border flex flex-col items-center gap-3 ${
                response?.status === "success" 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/5 border-rose-500/20 text-rose-400"
              }`}>
                {response?.status === "success" ? (
                  <FiCheckCircle className="text-3xl animate-bounce" />
                ) : (
                  <FiAlertCircle className="text-3xl animate-pulse" />
                )}
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.2em] font-black opacity-60 mb-1">
                    Résultat du test
                  </p>
                  <p className="text-sm font-semibold leading-relaxed">
                    {response?.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>Protocol: HTTPS/JSON</span>
            <div className="flex gap-2 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonPage;