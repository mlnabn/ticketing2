import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import bgImage2 from '../Image/Login.png';   // ✅ pakai react-icons Google
import GoogleLogo from "../Image/google.svg";

const API_URL = 'http://127.0.0.1:8000/api';

function Login({ onLogin, onShowRegister, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { access_token, user } = response.data;

      if (access_token && user) {
        onLogin(response.data);
      } else {
        setError('Login gagal: Respons dari server tidak lengkap.');
      }
    } catch (err) {
      setError('Login gagal. Periksa kembali email & password!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Silakan hubungi admin atau reset melalui email.');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/api/auth/google/redirect';
  };

  return (
    <div className="auth-page-container">
      <div className="split-card">
        {/* Kiri - Form Login */}
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Login'}
            </button>

            <div className="divider">atau</div>

            {/* Tombol Google */}
            <button onClick={handleGoogleLogin} className="google-login-button">
              <img src={GoogleLogo} alt="Google Logo" className="google-icon" />
              <span>Login with Google</span>
            </button>


            <p className="auth-toggle">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onShowRegister}
                className="register-link"
              >
                Register
              </button>
            </p>

            <button
              type="button"
              onClick={onBackToLanding}
              className="back-to-landing"
            >
              ← Back to Landing
            </button>
          </form>
        </div>

        {/* Kanan - Gambar */}
        <div
          className="login-background-side"
          style={{ backgroundImage: `url(${bgImage2})` }}
        />
      </div>
    </div>
  );
}

export default Login;
