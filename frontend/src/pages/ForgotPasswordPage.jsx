import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import loginBackground from '../Image/LoginBg.jpg'; // Menggunakan background yang sama
import '../App.css'; // Menggunakan style yang sama
import { motion } from 'framer-motion';
import logoImg from '../Image/Login.png';

// (Anda bisa copy-paste varian animasi dari Login.js/Register.js jika mau)
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/password/request-otp', { phone });
      setMessage(response.data.message);
      // Jika sukses, arahkan ke halaman reset dan bawa nomor HP
      navigate('/reset-password', { state: { phone: phone } });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && errorData.errors) {
        setError(Object.values(errorData.errors)[0][0]);
      } else {
        setError(errorData?.message || 'Gagal mengirim permintaan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="split-card">
        <div className="login-card" style={{ maxWidth: '450px' }}> {/* Mirip Login.js */}
          <motion.form
            onSubmit={handleSubmit}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={formItemVariants}>Lupa Password</motion.h2>
            <motion.p variants={formItemVariants} className="form-description">
              Masukkan nomor WhatsApp Anda yang terdaftar. Kami akan mengirimkan kode OTP untuk reset password.
            </motion.p>

            {error && (
              <motion.p variants={formItemVariants} className="error-message">
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p variants={formItemVariants} className="success-message">
                {message}
              </motion.p>
            )}

            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon">📱</span>
              <input
                type="tel"
                placeholder="Nomor WhatsApp (cth: 628...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              className="login-btn" // Pakai style tombol login
              disabled={loading}
              variants={formItemVariants}
            >
              {loading ? 'Memproses...' : 'Kirim Kode OTP'}
            </motion.button>

            <motion.p variants={formItemVariants} className="auth-toggle">
              Sudah ingat?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="register-link"
              >
                Login
              </button>
            </motion.p>
          </motion.form>
        </div>
        <div className="login-background-side"> 
            <motion.img
                src={logoImg}
                alt="DTECH Engineering Logo"
                className="login-logo-image"
                initial="hidden"
                animate="visible"
            />
        </div>
      </div>
    </div>
  );
}