import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

function Register({ onRegister }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi password lokal (optional)
    if (form.password !== form.password_confirmation) {
      alert('Password dan konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, form);
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        onRegister();
      } else {
        alert('Registrasi berhasil tapi token tidak ditemukan.');
      }
    } catch (err) {
      // Jika Laravel mengirim validasi error
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Registrasi gagal: ${err.response.data.message}`);
      } else {
        alert('Registrasi gagal. Cek input atau email sudah terdaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      <input type="text" name="name" placeholder="Nama" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="password" name="password_confirmation" placeholder="Konfirmasi Password" onChange={handleChange} required />
      <button type="submit" disabled={loading}>
        {loading ? 'Memproses...' : 'Register'}
      </button>
    </form>
  );
}

export default Register;
