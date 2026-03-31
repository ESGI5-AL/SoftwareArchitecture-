import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="container">
      <header className="header">
        <h1>🚗 Parking Reservation System</h1>
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
        {activeTab === "home" && <p>Welcome to your parking system</p>}

        {activeTab === "skeleton" && (
          <div className="centered">
            <button
              className="main-button"
              onClick={() => alert("Flux de réservation en cours...")}
            >
              Tester le flux
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;