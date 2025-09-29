import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from './services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load dari localStorage saat awal
  useEffect(() => {
    try {
      const t = localStorage.getItem('auth.accessToken');
      const u = localStorage.getItem('auth.user');
      if (t) setAccessToken(t);
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      console.error("Gagal memuat auth state dari localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist ke localStorage
  useEffect(() => {
    try {
      if (accessToken) localStorage.setItem('auth.accessToken', accessToken);
      else localStorage.removeItem('auth.accessToken');
      if (user) localStorage.setItem('auth.user', JSON.stringify(user));
      else localStorage.removeItem('auth.user');
    } catch {}
  }, [user, accessToken]);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    // Hapus dari localStorage secara manual untuk memastikan
    try {
      localStorage.removeItem('auth.accessToken');
      localStorage.removeItem('auth.user');
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      loggedIn: !loading && Boolean(user && accessToken),
      role: user?.role ?? null,
      name: user?.name ?? null,
      userId: user?.id ?? null,
      logout,
      setUser,
      setAccessToken,
    }),
    [user, accessToken, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
export default AuthContext;
