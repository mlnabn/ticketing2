import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import bgImage2 from '../Image/Login.svg'; 
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

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
  exit: { 
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
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

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

function Register({
  step,
  form,
  otp,
  loading,
  error,
  cooldown,
  onFormChange,
  onOtpChange,
  onRegisterSubmit,
  onOtpSubmit,
  onResendOtp,
  onShowLogin,
  onBackToLanding,
}) {

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
  const handleRegister = (e) => {
    e.preventDefault();
    onRegisterSubmit();
  };

  const handleOtp = (e) => {
    e.preventDefault();
    onOtpSubmit();
  };

  return (
    <div className="auth-page-container">
      <Particles
        id="tsparticles-register"
        init={particlesInit}
        options={particlesOptions}
        className="particles-background"
      />
      <motion.div
        className="auth-content-centered"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.img
          src={bgImage2}
          alt="DTECH Engineering Logo"
          className="login-logo-image-centered"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        />
        {error && (
          <motion.p
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1" 
              onSubmit={handleRegister}
              className="login-form-inner"
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon">👤</span>
                <input type="text" name="name" value={form.name} placeholder="Nama" onChange={onFormChange} required />
              </motion.div>

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon">📧</span>
                <input type="email" name="email" value={form.email} placeholder="Email" onChange={onFormChange} required />
              </motion.div>

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon">📱</span>
                <input type="tel" name="phone" value={form.phone} placeholder="Nomor WhatsApp (e.g., 628...)" onChange={onFormChange} required />
              </motion.div>

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password" value={form.password} placeholder="Password" onChange={onFormChange} required />
              </motion.div>

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password_confirmation" value={form.password_confirmation} placeholder="Konfirmasi Password" onChange={onFormChange} required />
              </motion.div>

              {/* 11. Ganti class tombol */}
              <motion.button variants={formItemVariants} type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Mengirim OTP...' : 'Send OTP'}
              </motion.button>

              <motion.p variants={formItemVariants} className="auth-toggle">
                Sudah punya akun?{" "}
                <button type="button" onClick={onShowLogin} className="register-link">Login</button>
              </motion.p>
              <motion.button variants={formItemVariants} type="button" onClick={onBackToLanding} className="back-to-landing">
                ← Back to Landing
              </motion.button>
            </motion.form>

          ) : (
            <motion.form
              key="step2" 
              onSubmit={handleOtp}
              className="login-form-inner"
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 variants={formItemVariants}>Verify Your Number</motion.h2>

              <motion.p variants={formItemVariants} className="form-description" style={{color: '#e0e0e0'}}>
                Masukkan 6 digit kode yang dikirim ke nomor <strong>{form.phone}</strong>.
              </motion.p>

              <motion.div variants={formItemVariants} className="input-group">
                <span className="input-icon"></span>
                <input type="text" value={otp} onChange={onOtpChange} placeholder="6-Digit OTP" maxLength="6" required />
              </motion.div>

              <motion.p variants={formItemVariants} className="auth-toggle">
                Tidak menerima kode?{" "}
                <button
                  type="button"
                  onClick={onResendOtp}
                  className="register-link"
                  disabled={loading || cooldown > 0}
                >
                  {cooldown > 0
                    ? `Kirim ulang dalam (${formatTime(cooldown)})`
                    : 'Kirim ulang OTP?'
                  }
                </button>
              </motion.p>

              <motion.button variants={formItemVariants} type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Memverifikasi...' : 'Verify & Complete'}
              </motion.button>

              <motion.p variants={formItemVariants} className="auth-toggle">
                Sudah punya akun?{" "}
                <button type="button" onClick={onShowLogin} className="register-link">Login</button>
              </motion.p>
              <motion.button variants={formItemVariants} type="button" onClick={onBackToLanding} className="back-to-landing">
                ← Back to Landing
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence> 
      </motion.div> 
    </div> 
  );
}

export default Register;