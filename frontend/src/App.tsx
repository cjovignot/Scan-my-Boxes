import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useApi } from "./hooks/useApi"; // 👈 ton hook générique

function App() {
  // 🔥 On appelle le hook générique pour récupérer les données de ton API
  const { data, loading, error } = useApi<{ message: string }>("/api/example");

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React + API</h1>

      <div className="card">
        {loading && <p>⏳ Chargement des données...</p>}
        {error && <p style={{ color: "red" }}>❌ {error}</p>}
        {data && (
          <>
            <p>🛰️ Réponse de l’API :</p>
            <code>{data.message}</code>
          </>
        )}
      </div>

      <p className="read-the-docs">Click on the logos to learn more</p>
    </>
  );
}

export default App;
