import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MobileLayout from "./layouts/MobileLayout";
import Home from "./pages/Home";
import Examples from "./pages/Examples";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
