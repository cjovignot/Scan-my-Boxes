import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [message, setMessage] = useState<string>("Loading...");

  // useEffect(() => {
  //   const apiUrl = import.meta.env.VITE_API_URL;
  //   fetch(`${apiUrl}/api/example`)
  //     .then((res) => res.json())
  //     .then((data) => setMessage(data.message))
  //     .catch((err) => {
  //       console.error("❌ Error fetching API:", err);
  //       setMessage("Error connecting to API");
  //     });
  // }, []);

  useEffect(() => {
    fetch("https://scan-my-boxes-api.vercel.app/api/example")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => {
        console.error("❌ Error fetching API:", err);
        setMessage("Error connecting to API");
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <div className="card">
        <p>🛰️ API response:</p>
        <code>{message}</code>
      </div>
    </>
  );
}

export default App;
