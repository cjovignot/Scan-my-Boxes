import "./App.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./contexts/useAuth";
import FloatingPrintButton from "./components/FloatingPrintButton";
import MobileLayout from "./layouts/MobileLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserAccount from "./pages/UserAccount";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminUsers from "./pages/Admin/Users";
import Settings from "./pages/Settings";
import Storages from "./pages/Storages";
import Boxes from "./pages/Boxes";
import BoxDetails from "./pages/Box/BoxDetails";
import BoxEdit from "./pages/Box/BoxEdit";
import PrintGroup from "./pages/PrintGroup";
import ScanPage from "./pages/ScanPage";
import BoxCreate from "./pages/BoxCreate";
import StorageCreate from "./pages/StorageCreate";
import AuthSuccess from "./pages/AuthSuccess";

// ✅ Composant de protection des routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const location = useLocation();

  // Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.error("🔴 Erreur Service Worker :", err));
      });
    }
  }, []);

  // Mode PWA
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isStandalone) {
      console.log("📱 PWA standalone");
    }
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MobileLayout />}>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/success" element={<AuthSuccess />} />

            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/useraccount"
              element={
                <ProtectedRoute>
                  <UserAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route path="/storages" element={<Storages />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/boxes" element={<Boxes />} />
            <Route path="/box/boxdetails/:id" element={<BoxDetails />} />
            <Route
              path="/box/boxEdit/:id"
              element={
                <ProtectedRoute>
                  <BoxEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/printgroup"
              element={
                <ProtectedRoute>
                  <PrintGroup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/boxes/new"
              element={
                <ProtectedRoute>
                  <BoxCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storages/new"
              element={
                <ProtectedRoute>
                  <StorageCreate />
                </ProtectedRoute>
              }
            />
            <Route path="/scan" element={<ScanPage />} />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <FloatingPrintButton />
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
