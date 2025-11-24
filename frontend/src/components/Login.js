import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import '../App.css';
import bgImage2 from '../Image/Login.svg';
import GoogleLogo from "../Image/google.svg";
import api, { API_BASE_URL } from '../services/api';

const imageVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 15,
      delay: 0.1,
    },
  },
};

const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.08,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

function Login({ onLogin, onShowRegister, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: "#0a0f1e",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
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
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;

      if (access_token && user) {
        onLogin(response.data);
      } else {
        setError('Login gagal: Respons dari server tidak lengkap.');
      }
    } catch (err) {
      setError('Login gagal. Periksa kembali email & password!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/redirect`;
  };

  return (
    <div className="auth-page-container">
      <Particles
        id="tsparticles"
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
        <motion.img
          src={bgImage2}
          alt="DTECH Engineering Logo"
          className="login-logo-image-centered"
          variants={imageVariants}
        />

        {error && (
          <motion.p variants={formItemVariants} className="error-message">
            {error}
          </motion.p>
        )}

        <motion.form onSubmit={handleSubmit} className="login-form-inner">

          <motion.div variants={formItemVariants} className="input-group floating-label-group"> 
            <span className="input-icon">📧</span>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="email-input" className={email ? 'active' : ''}>
              Email
            </label>
          </motion.div>

          <motion.div variants={formItemVariants} className="input-group floating-label-group">
            <span className="input-icon">🔒</span>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password-input" className={password ? 'active' : ''}>
              Password
            </label>
          </motion.div>

          <motion.div variants={formItemVariants} className="login-options">
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
          </motion.div>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            variants={formItemVariants}
          >
            {loading ? 'Processing...' : 'Login'}
          </motion.button>

          <motion.div variants={formItemVariants} className="divider">
            atau
          </motion.div>

          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="google-login-button"
            variants={formItemVariants}
          >
            <img src={GoogleLogo} alt="Google Logo" className="google-icon" />
            <span>Login with Google</span>
          </motion.button>
        </motion.form>

        <motion.p variants={formItemVariants} className="auth-toggle">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onShowRegister}
            className="register-link"
          >
            Register
          </button>
        </motion.p>

        <motion.button
          type="button"
          onClick={onBackToLanding}
          className="back-to-landing"
          variants={formItemVariants}
        >
          ← Back to Landing
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Login;