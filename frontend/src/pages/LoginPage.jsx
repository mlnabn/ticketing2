import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Login from '../components/Login';
import api from '../services/api';

export default function LoginPage() {
  const { login, loggedIn, user } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();

  const [isValidatingGoogle, setIsValidatingGoogle] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('user');
  });

  const handleLoginSuccess = useCallback((data) => {
      if (data.user) login(data);
    }, [login]);

  useEffect(() => {
    if (isValidatingGoogle && !loggedIn) {
      window.history.replaceState(null, '', window.location.pathname);
      
      api.get('/user')
        .then(response => {
          console.log("Validasi Cookie Google Berhasil");
          login({ 
              user: response.data,
              access_token: "cookie-auth-mode" 
          });
        })
        .catch(e => {
          console.error("Validasi Cookie Gagal", e);
          setIsValidatingGoogle(false); 
        });
    }
  }, [isValidatingGoogle, loggedIn, login]); 

  useEffect(() => {
    if (loggedIn && user) {
      const targetPath = user.role?.toLowerCase() === 'admin' ? '/admin' : '/user';
      navigate(targetPath, { replace: true });
    }
  }, [loggedIn, user, navigate]);

  return (
    <div className="auth-page-container">
      <Login
        onLogin={handleLoginSuccess}
        onShowRegister={() => navigate('/register')}
        onBackToLanding={() => navigate('/')}
        isGoogleLoading={isValidatingGoogle} 
      />
    </div>
  );
}