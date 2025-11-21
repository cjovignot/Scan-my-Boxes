// main.tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthProvider";
import { PrintProvider } from "./contexts/PrintProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Tu peux laisser React.StrictMode en DEV, ça double les effets intentionnellement
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PrintProvider>
          <App />
        </PrintProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
