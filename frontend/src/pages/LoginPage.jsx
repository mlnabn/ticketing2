import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Login from '../components/Login';
import loginBackground from '../Image/LoginBg.jpg';

export default function LoginPage() {
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--auth-background-image-light',
      `url(${loginBackground})`
    );
    return () => {
      document.documentElement.style.removeProperty('--auth-background-image-light');
    };
  }, []);

  // Fungsi ini HANYA mengatur state
  const handleLoginSuccess = useCallback(
    // Parameter pertama sekarang adalah 'response' dari API
    (response) => {
      if (response.access_token && response.user) {
        login(response);
      } else {
        console.error("handleLoginSuccess dipanggil dengan respons yang tidak valid.");
      }
    },
    [login]
  );

  // useEffect ini HANYA menangani navigasi setelah state diperbarui
  React.useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, navigate]);

  // Render logic
  return (
    <div className="auth-page-container">
      <Login
        onLogin={handleLoginSuccess}
        onShowRegister={() => navigate('/register')}
        onBackToLanding={() => navigate('/')}
      />

    </div>
  );
}