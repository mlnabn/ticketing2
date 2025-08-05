import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        onLogin();
      } else {
        alert('Login gagal: Token tidak ditemukan.');
      }
    } catch (err) {
      alert('Login gagal. Periksa kembali email & password!');
    } finally {
      setLoading(false);
    }
  };

//   return (
//     <form onSubmit={handleSubmit} className="auth-form">
//       <h2>Login</h2>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit" disabled={loading}>
//         {loading ? 'Memproses...' : 'Login'}
//       </button>
//     </form>
//   );

    return (
        <div className="login-page">
        <form onSubmit={handleSubmit} className="login-card">
            <h2>Login</h2>
            <div className="input-group">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>
            <div className="input-group">
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
            <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="login-btn">Login</button>
            <p className="auth-toggle">
                Don't have an account? <button type="button" onClick={onShowRegister} className="register-link">Register</button>
            </p>
        </form>
        </div>
        );
    }

export default Login;
