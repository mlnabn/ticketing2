import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../services/api';
import Register from '../components/Register';

export default function RegisterPage() {
  const { login, loggedIn, user } = useAuth();
  const navigate = useNavigate();
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
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [cooldown]);
  
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
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
      setStep(2);
      setCooldown(300);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && errorData.errors) {
        const firstError = Object.values(errorData.errors)[0][0];
        setError(firstError);
      } else {
        setError(errorData?.message || 'Registrasi gagal. Cek kembali data Anda.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form, 
        otp: otp
      };
      delete payload.password_confirmation; 

      const response = await api.post('/otp/verify', payload);
      
      login(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verifikasi gagal.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true); 
    try {
      const response = await api.post('/otp/resend', { phone: form.phone });
      alert(response.data.message);
      setCooldown(300);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal mengirim ulang OTP.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [loggedIn, user, navigate]);

  return (
    <div className="auth-page-container">
      <Register
        step={step}
        form={form}
        otp={otp}
        loading={loading}
        error={error}
        cooldown={cooldown} 
        onFormChange={handleFormChange}
        onOtpChange={(e) => setOtp(e.target.value)}
        onRegisterSubmit={handleRegisterSubmit}
        onOtpSubmit={handleOtpSubmit}
        onResendOtp={handleResendOtp}
        onShowLogin={() => navigate('/login')}
        onBackToLanding={() => navigate('/')}
      />
    </div>
  );
}