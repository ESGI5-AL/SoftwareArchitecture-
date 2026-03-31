import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

interface TestResponse {
  message: string;
  details?: {
    database: string;
    serverTime: string;
    seedData: {
      users: number;
      parkingLots: number;
    };
  };
}

function App() {
  const [activeTab, setActiveTab] = useState("skeleton");
  const [response, setResponse] = useState<TestResponse | null>(null);

  const testBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/test`);
      const data: TestResponse = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ message: "Erreur de connexion au backend" });
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

              {response && (
                <div style={{ marginTop: "20px", textAlign: "left" }}>
                  <p><strong>{response.message}</strong></p>

                  {response.details && (
                    <ul style={{ marginTop: "12px", listStyle: "none", padding: 0, fontSize: "14px", color: "#94a3b8" }}>
                      <li>Base de données : <strong style={{ color: "white" }}>{response.details.database}</strong></li>
                      <li>Utilisateurs : <strong style={{ color: "white" }}>{response.details.seedData.users}</strong></li>
                      <li>Parkings : <strong style={{ color: "white" }}>{response.details.seedData.parkingLots}</strong></li>
                      <li>Heure serveur : <strong style={{ color: "white" }}>{new Date(response.details.serverTime).toLocaleString()}</strong></li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;