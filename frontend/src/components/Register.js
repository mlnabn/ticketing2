import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import bgImage2 from '../Image/Login.png'; // Ganti sesuai gambar background yang dipakai

const API_URL = 'http://127.0.0.1:8000/api';

function Register({ onRegister, onShowLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      alert('Password dan konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, form);
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        onRegister();
      } else {
        alert('Registrasi berhasil tapi token tidak ditemukan.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Registrasi gagal: ${err.response.data.message}`);
      } else {
        alert('Registrasi gagal. Cek input atau email sudah terdaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Card dengan 2 kolom */}
      <div className="split-card">

        {/* Kiri - Form Register */}
        <div className="register-card">
          <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="name"
                placeholder="Nama"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi Password"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Memproses...' : 'Register'}
            </button>

            <p className="auth-toggle">
              Have an account?{" "}
              <button
                type="button"
                onClick={onShowLogin}
                className="login-link"
              >
                Login
              </button>
            </p>
          </form>
        </div>

        {/* Kanan - Gambar */}
        <div
          className="login-background-side"
          style={{
            backgroundImage: `url(${bgImage2})`
          }}
        />
      </div>
    </div>
  );
}

export default Register;
