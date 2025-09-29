import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

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
      // Tidak perlu load expiresAt ke state, cukup di localStorage
      if (t) setAccessToken(t);
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      console.error("Gagal memuat auth state dari localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // DIUBAH: Fungsi login sekarang menjadi bagian dari context
  const login = useCallback((data) => {
    const { access_token, user, expires_in } = data;
    const expiresAt = Date.now() + (expires_in * 1000) - 60000;

    localStorage.setItem('auth.accessToken', access_token);
    localStorage.setItem('auth.user', JSON.stringify(user));
    localStorage.setItem('auth.expiresAt', expiresAt.toString());

    setAccessToken(access_token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth.accessToken');
    localStorage.removeItem('auth.user');
    localStorage.removeItem('auth.expiresAt');

    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      loggedIn: !loading && Boolean(user && accessToken),
      role: user?.role ?? null,
      name: user?.name ?? null,
      userId: user?.id ?? null,
      login, // DIUBAH: Tambahkan login ke context
      logout,
      setUser,
      setAccessToken,
    }),
    [user, accessToken, loading, login, logout] // DIUBAH: Tambahkan login & logout
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
export default AuthContext;