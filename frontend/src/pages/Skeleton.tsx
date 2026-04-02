import { FiServer, FiActivity, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useHealth } from "../shared/hooks/useHealth";

function SkeletonPage() {
  const { response, isTesting, testBackend } = useHealth();

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="bg-card/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-border overflow-hidden">

          {}
          <div className="p-8 pb-4 text-center">
            <div className="relative inline-flex mb-6">
              <div className={`absolute inset-0 rounded-3xl blur-xl transition-colors duration-500 ${
                isTesting ? "bg-ring/30" : response?.status === "success" ? "bg-primary/30" : response?.status === "error" ? "bg-destructive/30" : "bg-primary/20"
              }`} />
              <div className="relative bg-muted p-5 rounded-3xl border border-border shadow-inner">
                <FiServer className={`text-4xl transition-colors duration-500 ${
                  isTesting ? "text-ring animate-pulse" : response?.status === "success" ? "text-primary" : response?.status === "error" ? "text-destructive" : "text-primary"
                }`} />
              </div>
            </div>

            <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">
              Status du Système
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
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
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] active:scale-[0.97]"
              }`}
            >
              {isTesting ? (
                <>
                  <div className="w-5 h-5 border-2 border-border border-t-ring rounded-full animate-spin" />
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
                  ? "bg-primary/5 border-primary/20 text-primary"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
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
          <div className="px-8 py-4 bg-background/50 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <span>Protocol: HTTPS/JSON</span>
            <div className="flex gap-2 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonPage;
