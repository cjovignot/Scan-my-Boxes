import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MobileLayout from "./layouts/MobileLayout";
import Callback from "./pages/Callback";
import AuthSuccess from "./pages/AuthSuccess";
import Profile from "./pages/Profile";
import Boxes from "./pages/Boxes";
import Settings from "./pages/Settings";
import { PrintProvider } from "./contexts/PrintProvider";

function App() {
  return (
    <PrintProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/boxes" element={<Boxes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </PrintProvider>
  );
}

export default App;
