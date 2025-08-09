import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import '../App.css'; // Import file CSS yang baru dibuat

const API_URL = 'http://127.0.0.1:8000/api';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '', // Disesuaikan untuk validasi Laravel
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    try {
      await axios.post(`${API_URL}/users`, formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      setSuccess('User berhasil ditambahkan!');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });

    } catch (err) {
      if (err.response && err.response.status === 422) {
        setError(err.response.data.errors);
      } else {
        setError({ general: ['Terjadi kesalahan pada server. Silakan coba lagi.'] });
      }
      console.error(err);
    }
  };

  return (
    <div className="add-user-container">
      <h2 className="add-user-title">Tambah Pengguna Baru</h2>
      
      {success && <div className="feedback-message success-message">{success}</div>}
      {error?.general && <div className="feedback-message error-message">{error.general[0]}</div>}

      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nama:</label>
          <input
            type="text" id="name" name="name"
            value={formData.name} onChange={handleChange}
            className="form-input"
            required
          />
          {error?.name && <p className="error-list">{error.name[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email" id="email" name="email"
            value={formData.email} onChange={handleChange}
            className="form-input"
            required
          />
          {error?.email && <p className="error-list">{error.email[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password" id="password" name="password"
            value={formData.password} onChange={handleChange}
            className="form-input"
            required
          />
          {error?.password && <p className="error-list">{error.password[0]}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirmation" className="form-label">Konfirmasi Password:</label>
          <input
            type="password" id="password_confirmation" name="password_confirmation"
            value={formData.password_confirmation} onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Tambah User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;