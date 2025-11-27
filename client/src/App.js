import React from "react";
import LandingPage from "./pages/landing/Landingpage";
import AuthPage from "./pages/auth/AuthPage";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import MemberDashboard from "./pages/member/MemberDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/*" element={<ResetPassword />} />

        {/* Protected Member Dashboard */}
        <Route
          path="/member/*"
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
