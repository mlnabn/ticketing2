// components/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { login } from '../auth'; // Kita butuh ini untuk login otomatis
import '../App.css';
import bgImage2 from '../Image/Login.png';

const API_URL = 'http://127.0.0.1:8000/api';

function Register({ onRegister, onShowLogin, onBackToLanding }) { // onBackToLanding ditambahkan
  // State untuk kontrol UI
  const [step, setStep] = useState(1); // 1: form register, 2: form OTP
  
  // State untuk form register
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '' // Tambahkan input nomor telepon
  });

  // State untuk form OTP
  const [otp, setOtp] = useState('');
  
  // State umum
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Langkah 1: Submit form registrasi
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, form);
      // Jika sukses, backend akan mengirim OTP. Kita pindah ke langkah 2.
      alert(response.data.message); // Tampilkan pesan dari backend
      setStep(2); // Pindah ke tampilan verifikasi OTP
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registrasi gagal. Cek kembali data Anda.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Langkah 2: Submit OTP untuk verifikasi
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/otp/verify`, { 
        phone: form.phone, // Gunakan nomor telepon dari form sebelumnya
        otp: otp 
      });

      const { access_token, user } = response.data;
      // Jika OTP benar, langsung login
      login(access_token, user); 
      onRegister(); // Panggil onRegister dari App.js untuk finalisasi
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verifikasi gagal.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="split-card">
        {/* Kiri - Form Dinamis */}
        <div className="register-card">
          {error && <p className="error-message">{error}</p>}

          {step === 1 ? (
            // Tampilan Form Registrasi
            <form onSubmit={handleRegisterSubmit}>
              <h2>Register</h2>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input type="text" name="name" placeholder="Nama" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              </div>
              <div className="input-group">
                  <span className="input-icon">📱</span>
                  <input type="tel" name="phone" placeholder="Nomor WhatsApp (e.g., 628...)" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password_confirmation" placeholder="Konfirmasi Password" onChange={handleChange} required />
              </div>
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Memproses...' : 'Register & Send OTP'}
              </button>
            </form>
          ) : (
            // Tampilan Form Verifikasi OTP
            <form onSubmit={handleOtpSubmit}>
              <h2>Verify Your Number</h2>
              <p className="form-description">Masukkan 6 digit kode yang dikirim ke nomor {form.phone}.</p>
              <div className="input-group">
                  <span className="input-icon">🔑</span>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-Digit OTP" maxLength="6" required />
              </div>
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Memverifikasi...' : 'Verify & Complete Registration'}
              </button>
            </form>
          )}

          <p className="auth-toggle">
            Sudah punya akun?{" "}
            <button type="button" onClick={onShowLogin} className="login-link">Login</button>
          </p>
           {/* Tombol kembali ke landing, pastikan prop onBackToLanding di-pass dari App.js ke Register.js */}
           <button type="button" onClick={onBackToLanding} className="back-to-landing">
                ← Back to Landing
            </button>
        </div>

        {/* Kanan - Gambar */}
        <div className="login-background-side" style={{ backgroundImage: `url(${bgImage2})` }} />
      </div>
    </div>
  );
}

export default Register;