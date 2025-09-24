import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load dari localStorage saat awal
  useEffect(() => {
    try {
      const t = localStorage.getItem('auth.token');
      const u = localStorage.getItem('auth.user');
      if (t) setToken(t);
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
      if (token) localStorage.setItem('auth.token', token);
      else localStorage.removeItem('auth.token');
      if (user) localStorage.setItem('auth.user', JSON.stringify(user));
      else localStorage.removeItem('auth.user');
    } catch {}
  }, [user, token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Hapus dari localStorage secara manual untuk memastikan
    try {
      localStorage.removeItem('auth.token');
      localStorage.removeItem('auth.user');
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      loggedIn: !loading && Boolean(user && token),
      role: user?.role ?? null,
      name: user?.name ?? null,
      userId: user?.id ?? null,
      logout,
      setUser,
      setToken,
    }),
    [user, token, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
export default AuthContext;
