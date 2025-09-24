import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Login from '../components/Login';
import loginBackground from '../Image/LoginBg.jpg';

export default function LoginPage() {
  const { setUser, setToken, loggedIn } = useAuth();
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
  const handleLoginSuccess = React.useCallback(
    (newToken, newUser) => {
      if (newToken && newUser) {
        setToken(newToken);
        setUser(newUser);
      } else {
        console.error("handleLoginSuccess dipanggil tanpa token atau user.");
      }
    },
    [setToken, setUser]
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