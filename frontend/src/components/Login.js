import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import bgImage2 from '../Image/Login.png';
import GoogleLogo from "../Image/google.svg";

const API_URL = 'http://127.0.0.1:8000/api';

const imageVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      delay: 0.4,
    },
  },
};

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
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
    window.location.href = 'http://127.0.0.1:8000/api/auth/google/redirect';
  };

  return (
    <div className="auth-page-container">
      <div className="split-card">
        <div className="login-card">
          <motion.form
            onSubmit={handleSubmit}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={formItemVariants}>Login</motion.h2>

            {error && (
              <motion.p variants={formItemVariants} className="error-message">
                {error}
              </motion.p>
            )}

            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={formItemVariants} className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
          </motion.form>
        </div>

        <div className="login-background-side">
          <motion.img
            src={bgImage2}
            alt="DTECH Engineering Logo"
            className="login-logo-image"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
