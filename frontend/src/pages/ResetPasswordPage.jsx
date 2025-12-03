import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import '../App.css';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// const imageVariants = {
//   hidden: { opacity: 0, y: -20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { type: 'spring', stiffness: 120, damping: 15, delay: 0.1 },
//   },
// };
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
  const { login, loggedIn } = useAuth();
  const phone = location.state?.phone;

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

  useEffect(() => {
    if (!phone) {
      navigate('/forgot-password');
    }
  }, [phone, navigate]);

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

  if (!phone) return null;

  return (
    <div className="auth-page-container">
      <Particles
        id="tsparticles-reset"
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
        >
          <motion.h2 variants={formItemVariants}>Set Password Baru</motion.h2>
          <motion.p variants={formItemVariants} className="form-description" style={{ color: '#e0e0e0' }}>
            Reset password untuk nomor <strong>{phone}</strong>.
          </motion.p>

          {error && (
            <motion.p variants={formItemVariants} className="error-message">
              {error}
            </motion.p>
          )}

          <motion.div variants={formItemVariants} className="input-group floating-label-group">
            <span className="input-icon">🔑</span>
            <input
              id="otp-input"
              type="text"
              name="otp"
              maxLength="6"
              value={form.otp}
              onChange={handleChange}
              required
            />
            <label htmlFor="otp-input" className={form.otp ? 'active' : ''}>
              Kode OTP
            </label>
          </motion.div>

          <motion.div variants={formItemVariants} className="input-group floating-label-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              name="password"
              id="password-input"
              value={form.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password-input" className={form.password ? 'active' : ''}>
              Password Baru
            </label>
          </motion.div>

          <motion.div variants={formItemVariants} className="input-group floating-label-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              name="password_confirmation"
              id="password-confirmation-input"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
            <label htmlFor="password-confirmation-input" className={form.password_confirmation ? 'active' : ''}>
              Konfirmasi Password Baru
            </label>
          </motion.div>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            variants={formItemVariants}
          >
            {loading ? 'Menyimpan...' : 'Reset Password & Login'}
          </motion.button>

          <motion.p variants={formItemVariants} className="auth-toggle">
            Salah halaman?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="register-link"
            >
              Kembali ke Login
            </button>
          </motion.p>
        </motion.form>
      </motion.div>
    </div>
  );
}