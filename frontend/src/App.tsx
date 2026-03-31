import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [response, setResponse] = useState<string>("");

  const testBackend = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/test");
      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      setResponse("Erreur de connexion au backend");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Parking Reservation System</h1>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "skeleton" ? "active" : ""}
          onClick={() => setActiveTab("skeleton")}
        >
          Skeleton
        </button>
      </nav>

      <main className="content">
        {activeTab === "skeleton" && (
          <div className="centered">
            <div>
              <button className="main-button" onClick={testBackend}>
                Tester la communication backend & BDD
              </button>

              {response && <p style={{ marginTop: "20px" }}>{response}</p>}
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