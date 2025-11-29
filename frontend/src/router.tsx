import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { createBrowserRouter, Navigate } from "react-router-dom";
// import Home from "./pages/Home";
import AuthSuccess from "./pages/AuthSuccess";
import AuthError from "./pages/AuthError";
import MobileLayout from "./layouts/MobileLayout";
import { useAuth } from "./contexts/AuthContext";
import Profile from "./pages/Profile";
import Boxes from "./pages/Boxes";
import Storages from "./pages/Storages";
import BoxDetails from "./pages/Box/BoxDetails";
import BoxEdit from "./pages/Box/BoxEdit";
import PrintGroup from "./pages/PrintGroup";
import BoxCreate from "./pages/BoxCreate";
import StorageCreate from "./pages/StorageCreate";
import ScanPage from "./pages/ScanPage";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/Admin/Users";
import UserAccount from "./pages/UserAccount";
import Register from "./pages/Register";

// ✅ Composant pour protéger les routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <p className="flex items-center justify-center min-h-screen text-center text-yellow-400">
        Chargement...
      </p>
    );
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>; // wrapper fragment pour ReactNode
}

// ✅ Routes
export const router = createBrowserRouter([
  // Routes publiques
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/success", element: <AuthSuccess /> },
  { path: "/auth/error", element: <AuthError /> },

  // Routes protégées (wrapper MobileLayout + PrivateRoute)
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MobileLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/", element: <Dashboard /> },
      // { path: "/", element: <Home /> },
      { path: "profile", element: <Profile /> },
      { path: "/useraccount", element: <UserAccount /> },
      { path: "/settings", element: <Settings /> },

      { path: "/scan", element: <ScanPage /> },

      { path: "storages", element: <Storages /> },
      { path: "/storages/new", element: <StorageCreate /> },

      { path: "boxes", element: <Boxes /> },
      { path: "/boxes/new", element: <BoxCreate /> },
      { path: "/box/boxdetails/:id", element: <BoxDetails /> },
      { path: "/box/boxEdit/:id", element: <BoxEdit /> },

      { path: "/printgroup", element: <PrintGroup /> },

      { path: "/admin/users", element: <AdminUsers /> },
    ],
  },

  // Fallback 404
  { path: "*", element: <Navigate to="/" /> },
]);
