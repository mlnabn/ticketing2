import React from 'react';
import '../App.css';
import bgImage2 from '../Image/Login.png';

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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fungsi submit sekarang hanya memanggil prop dari parent
  const handleRegister = (e) => {
    e.preventDefault();
    onRegisterSubmit();
  };

  const handleOtp = (e) => {
    e.preventDefault();
    onOtpSubmit();
  };

  return (
    <div className="split-card">
      <div className="register-card">
        {error && <p className="error-message">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input type="text" name="name" value={form.name} placeholder="Nama" onChange={onFormChange} required />
            </div>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input type="email" name="email" value={form.email} placeholder="Email" onChange={onFormChange} required />
            </div>
            <div className="input-group">
              <span className="input-icon">📱</span>
              <input type="tel" name="phone" value={form.phone} placeholder="Nomor WhatsApp (e.g., 628...)" onChange={onFormChange} required />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input type="password" name="password" value={form.password} placeholder="Password" onChange={onFormChange} required />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input type="password" name="password_confirmation" value={form.password_confirmation} placeholder="Konfirmasi Password" onChange={onFormChange} required />
            </div>
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Menngirim OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtp}>
            <h2>Verify Your Number</h2>
            <p className="form-description">Masukkan 6 digit kode yang dikirim ke nomor <strong>{form.phone}</strong>.</p>
            <div className="input-group">
              <span className="input-icon"></span>
              <input type="text" value={otp} onChange={onOtpChange} placeholder="6-Digit OTP" maxLength="6" required />
            </div>
            <p className="auth-toggle">
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
            </p>
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Verify & Complete Registration'}
            </button>
          </form>
        )}

        <p className="auth-toggle">
          Sudah punya akun?{" "}
          <button type="button" onClick={onShowLogin} className="login-link">Login</button>
        </p>
        <button type="button" onClick={onBackToLanding} className="back-to-landing">
          ← Back to Landing
        </button>
      </div>

      <div className="login-background-side" style={{ backgroundImage: `url(${bgImage2})` }} />
    </div>
  );
}

export default Register;