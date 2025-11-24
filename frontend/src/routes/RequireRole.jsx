// src/pages/RequireRole.jsx (Asumsi lokasi file)

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoadingScreen from '../components/LoadingScreen'; // <-- IMPORT

export default function RequireRole({ role, children }) {
  const { loggedIn, role: currentRole, loading } = useAuth();
  const location = useLocation();

  // MENGGANTI: return <div>Loading...</div>
  if (loading) {
    return <LoadingScreen />; // <-- Gunakan komponen Loading yang Profesional
  }
  
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (role && currentRole?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}