import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function RequireRole({ role, children }) {
  const { loggedIn, role: currentRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role && currentRole?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
