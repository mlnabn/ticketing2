import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../AuthContext'; // <-- 1. Import useAuth
import loginBackground from '../Image/LoginBg.jpg';
import '../App.css';
import { motion } from 'framer-motion';

// (Varian animasi bisa di-copy dari ForgotPasswordPage.jsx)
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ResetPasswordPage() {
  const [form, setForm] = useState({
    otp: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loggedIn } = useAuth(); // <-- 2. Ambil fungsi login
  
  // Ambil nomor HP dari state navigasi
  const phone = location.state?.phone;

  // Atur background
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--auth-background-image-light',
      `url(${loginBackground})`
    );
    return () => {
      document.documentElement.style.removeProperty('--auth-background-image-light');
    };
  }, []);

  // Jika tidak ada nomor HP, tendang balik ke halaman sebelumnya
  useEffect(() => {
    if (!phone) {
      navigate('/forgot-password');
    }
  }, [phone, navigate]);

  // Jika login sukses, arahkan ke dashboard
  // (Mengikuti pola dari LoginPage.jsx)
  useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi tidak cocok!');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        phone: phone,
        ...form,
      };
      
      const response = await api.post('/auth/password/reset-with-otp', payload);
      
      // 3. Panggil fungsi login dari AuthContext
      // Ini akan menyimpan token & user, dan memicu useEffect di atas
      login(response.data); 

    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && errorData.errors) {
        setError(Object.values(errorData.errors)[0][0]);
      } else {
        setError(errorData?.message || 'Gagal mereset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!phone) return null; // Mencegah render sebelum redirect

  return (
    <div className="auth-page-container">
      <div className="split-card">
        <div className="login-card" style={{ maxWidth: '450px' }}>
          <motion.form
            onSubmit={handleSubmit}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={formItemVariants}>Set Password Baru</motion.h2>
            <motion.p variants={formItemVariants} className="form-description">
              Reset password untuk nomor <strong>{phone}</strong>.
            </motion.p>

            {error && (
              <motion.p variants={formItemVariants} className="error-message">
                {error}
              </motion.p>
            )}

            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon"></span>
              <input
                type="text"
                name="otp"
                placeholder="Kode OTP 6 Digit"
                maxLength="6"
                value={form.otp}
                onChange={handleChange}
                required
              />
            </motion.div>
            
            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password Baru"
                value={form.password}
                onChange={handleChange}
                required
              N/>
            </motion.div>
            
            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi Password Baru"
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              className="login-btn"
              disabled={loading}
              variants={formItemVariants}
            >
              {loading ? 'Menyimpan...' : 'Reset Password & Login'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}