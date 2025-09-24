import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../services/api'; // Gunakan instance api terpusat
import Register from '../components/Register';
import loginBackground from '../Image/LoginBg.jpg';

export default function RegisterPage() {
  const { setToken, setUser, loggedIn } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Atur background saat komponen dimuat
  useEffect(() => {
    document.documentElement.style.setProperty('--auth-background-image-light', `url(${loginBackground})`);
    return () => {
      document.documentElement.style.removeProperty('--auth-background-image-light');
    };
  }, []);
  
  // Handler untuk perubahan form
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Handler untuk submit form registrasi
  const handleRegisterSubmit = async () => {
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi tidak cocok!');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/register', form);
      alert(response.data.message);
      setStep(2); // Pindah ke langkah OTP
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registrasi gagal. Cek kembali data Anda.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler untuk submit OTP
  const handleOtpSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/otp/verify', { phone: form.phone, otp: otp });
      const { access_token, user } = response.data;
      handleRegisterSuccess(access_token, user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verifikasi gagal.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler setelah registrasi berhasil (sama seperti di LoginPage)
  const handleRegisterSuccess = useCallback((newToken, newUser) => {
    if (newToken && newUser) {
      setToken(newToken);
      setUser(newUser);
    }
  }, [setToken, setUser]);

  // useEffect untuk navigasi setelah login berhasil
  useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, navigate]);

  return (
    <div className="auth-page-container">
      <Register
        step={step}
        form={form}
        otp={otp}
        loading={loading}
        error={error}
        onFormChange={handleFormChange}
        onOtpChange={(e) => setOtp(e.target.value)}
        onRegisterSubmit={handleRegisterSubmit}
        onOtpSubmit={handleOtpSubmit}
        onShowLogin={() => navigate('/login')}
        onBackToLanding={() => navigate('/')}
      />
    </div>
  );
}