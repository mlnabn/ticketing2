import React, { useState } from 'react';
import axios from 'axios';
import { login } from '../auth'; // ✅ 1. Import fungsi login dari auth.js
import '../App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State untuk pesan error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error setiap kali login

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // ✅ 2. Ambil KEDUA data: token dan user
      const { token, user } = response.data;

      if (token && user) {
        // ✅ 3. Gunakan fungsi login untuk menyimpan KEDUANYA
        login(token, user);
        
        onLogin(); // Beritahu App.js untuk refresh
      } else {
        setError('Login gagal: Respons dari server tidak lengkap.');
      }
    } catch (err) {
      setError('Login gagal. Periksa kembali email & password!');
      console.error(err); // Tampilkan error di console untuk debug
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Silakan hubungi admin atau reset melalui email.');
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Login</h2>
        {/* Tampilkan pesan error jika ada */}
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

        <p className="auth-toggle">
          Don't have an account?{' '}
          <button type="button" onClick={onShowRegister} className="register-link">
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;