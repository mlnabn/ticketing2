import React from 'react';
import { motion } from 'framer-motion'; // 1. Impor motion
import '../App.css'; // Sesuaikan jika perlu
import bgImage2 from '../Image/Login.png'; // Gambar DTECH

// 2. Definisikan varian animasi
// Varian untuk gambar di sisi kanan
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      delay: 0.4
    },
  },
};

// Varian untuk container form (akan men-stagger anak-anaknya)
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08, // Jeda antar setiap item form
    },
  },
};

// Varian untuk setiap item di dalam form (input, tombol, dll.)
const formItemVariants = {
  hidden: { opacity: 0, y: 20 }, // Mulai dari bawah & transparan
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// 3. Buat helper function (ini ada di kode Anda)
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// 4. Komponen Register
function Register({
  step,
  form,
  otp,
  loading,
  error,
  cooldown,
  onFormChange,
  onOtpChange,
  onRegisterSubmit, // Prop dari parent
  onOtpSubmit,     // Prop dari parent
  onResendOtp,
  onShowLogin,
  onBackToLanding,
}) {

  // 5. Buat wrapper handler untuk form
  const handleRegister = (e) => {
    e.preventDefault();
    onRegisterSubmit(); // Panggil prop dari parent
  };

  const handleOtp = (e) => {
    e.preventDefault();
    onOtpSubmit(); // Panggil prop dari parent
  };

  return (
    // 6. Return JSX yang sudah dianimasikan
    <div className="split-card">
      <div className="register-card">
        {/* Kita tidak membungkus <AnimatePresence> di sini,
          karena 'RegisterPage.jsx' (parent) sudah melakukannya.
          Kita hanya perlu menganimasikan konten berdasarkan 'step'.
        */}

        {/* Tampilkan error di atas, dianimasikan */}
        {error && (
          <motion.p
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        {step === 1 ? (
          // --- FORM STEP 1: REGISTER ---
          <motion.form
            key="step1" // Beri key unik
            onSubmit={handleRegister}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          // Kita tidak perlu 'exit' karena parent yang mengurus
          >
            <motion.h2 variants={formItemVariants}>Register</motion.h2>

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

            <motion.button variants={formItemVariants} type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Mengirim OTP...' : 'Send OTP'}
            </motion.button>

            {/* Tombol navigasi bawah (harus ada di kedua step) */}
            <motion.p variants={formItemVariants} className="auth-toggle">
              Sudah punya akun?{" "}
              <button type="button" onClick={onShowLogin} className="login-link">Login</button>
            </motion.p>
            <motion.button variants={formItemVariants} type="button" onClick={onBackToLanding} className="back-to-landing">
              ← Back to Landing
            </motion.button>
          </motion.form>

        ) : (
          // --- FORM STEP 2: OTP ---
          <motion.form
            key="step2" // Beri key unik
            onSubmit={handleOtp}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 variants={formItemVariants}>Verify Your Number</motion.h2>

            <motion.p variants={formItemVariants} className="form-description">
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
                className="resend-otp-link"
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0
                  ? `Kirim ulang dalam (${formatTime(cooldown)})`
                  : 'Kirim ulang OTP?'
                }
              </button>
            </motion.p>

            <motion.button variants={formItemVariants} type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Verify & Complete Registration'}
            </motion.button>

            {/* Tombol navigasi bawah (harus ada di kedua step) */}
            <motion.p variants={formItemVariants} className="auth-toggle">
              Sudah punya akun?{" "}
              <button type="button" onClick={onShowLogin} className="login-link">Login</button>
            </motion.p>
            <motion.button variants={formItemVariants} type="button" onClick={onBackToLanding} className="back-to-landing">
              ← Back to Landing
            </motion.button>
          </motion.form>
        )}
      </div>

      {/* Sisi Kanan - Gambar */}
      {/* Ini akan beranimasi SETIAP kali step berubah (karena seluruh komponen di-mount ulang),
        yang konsisten dengan form di sebelahnya.
      */}
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
  );
}

export default Register;