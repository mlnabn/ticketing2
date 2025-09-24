import React from 'react';
import LandingLayout from './pages/Landing';
import WelcomeHomeUserWrapper from './components/WelcomeHomeUserWrapper';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import LegacyApp from './LegacyApp';
import AboutRoute from './pages/About';
import FeaturesRoute from './pages/Features';
import FAQRoute from './pages/FAQ';
import PublicTicketPage from './pages/PublicTicketPage';
import { AuthProvider, useAuth } from './AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './routes/RequireAuth';
import RequireRole from './routes/RequireRole';
import './App.css';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/user" replace />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingLayout />}>
            {/* PERUBAHAN DI SINI: Gunakan Wrapper */}
            <Route index element={<WelcomeHomeUserWrapper />} /> 
            <Route path="about" element={<AboutRoute />} />
            <Route path="features" element={<FeaturesRoute />} />
            <Route path="faq" element={<FAQRoute />} />
          </Route>
          <Route path="/history/:ticketCode" element={<PublicTicketPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Legacy safeguard */}
          <Route path="/legacy" element={<LegacyApp />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardRedirect />
              </RequireAuth>
            }
          />
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
