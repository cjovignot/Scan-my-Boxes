import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // ton router avec PrivateRoute
import { AuthProvider } from "./contexts/AuthContext";
import { PrintProvider } from "./contexts/PrintProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <PrintProvider>
        <RouterProvider router={router} />
      </PrintProvider>
    </AuthProvider>
  </React.StrictMode>
);
