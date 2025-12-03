import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from './services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem('auth.user');
      if (u) {
          setUser(JSON.parse(u));
          setAccessToken("cookie-token-exists"); 
      }
    } catch (e) {
      console.error("Gagal memuat auth state dari localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((data) => {
    const { user } = data;
    localStorage.setItem('auth.user', JSON.stringify(user));

    setAccessToken("cookie-token-exists");
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('auth.user');

    try {
        await api.post('/logout');
    } catch (e) {
        console.error("Gagal memanggil API logout, namun tetap melanjutkan logout lokal.", e);
    }

    setUser(null);
    setAccessToken(null);
    window.location.href = '/login'; 
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