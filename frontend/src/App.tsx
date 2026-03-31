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
        )}
      </main>
    </div>
  );
}

export default App;