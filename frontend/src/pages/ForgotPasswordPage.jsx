import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const imageVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 15, delay: 0.1 },
  },
};
const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.08 },
  },
};
const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
};

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: { color: { value: "#0a0f1e" } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
      color: { value: "#ffffff" },
      links: {
        color: "#3b82f6",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: "bounce",
        random: false,
        speed: 1,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/password/request-otp', { phone });
      setMessage(response.data.message);
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
      <Particles
        id="tsparticles-forgot"
        init={particlesInit}
        options={particlesOptions}
        className="particles-background"
      />

      <motion.div
        className="auth-content-centered"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >

        <motion.form
          onSubmit={handleSubmit}
          className="login-form-inner"
          variants={formContainerVariants}
        >
          <motion.h2 variants={formItemVariants}>Lupa Password</motion.h2>
          <motion.p variants={formItemVariants} className="form-description" style={{ color: '#e0e0e0' }}>
            Masukkan nomor WhatsApp Anda. Kami akan mengirimkan kode OTP untuk reset password.
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

          <motion.div variants={formItemVariants} className="input-group floating-label-group">
            <span className="input-icon">👤</span>
            <input
              id="phone-input"
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <label htmlFor="phone-input" className={phone ? 'active' : ''}>
              Nomor WhatsApp (e.g., 628...)
            </label>
          </motion.div>

          <motion.button
            type="submit"
            className="login-btn"
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

          <motion.button
            type="button"
            onClick={() => navigate('/')}
            className="back-to-landing"
            variants={formItemVariants}
          >
            ← Back to Landing
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}