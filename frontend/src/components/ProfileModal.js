// src/components/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AvatarUploader from './AvatarUploader';
import { getToken } from '../auth'; // helper untuk ambil token dari localStorage

const API_URL = 'http://127.0.0.1:8000/api';

const ProfileModal = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [initialAvatar, setInitialAvatar] = useState(user?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setInitialAvatar(user?.avatar_url || user?.avatar || null);
  }, [user]);

  const handleFileSelect = (file) => {
    setAvatarFile(file);
  };

  const handleSave = async () => {
    if (password && password !== passwordConfirmation) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    if (password) {
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
    }
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    // Laravel butuh spoof method
    formData.append('_method', 'PUT');

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/user?_method=PUT`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });


      const updatedUser = res.data;
      onSaved(updatedUser);
      onClose();
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay4">
      <div className="modal-content4" style={{ maxWidth: 700 }}>
        <h2>Edit Profil</h2>

        <AvatarUploader initialAvatar={initialAvatar} onFileSelect={handleFileSelect} />

        <div className="form-group4">
          <label>Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group4">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group4">
          <label>Nomor Telepon</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

        </div>
        <div className="form-group4">
          <label>
            Password <small>(Kosongkan jika tidak diubah)</small>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group4">
          <label>Konfirmasi Password</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button onClick={onClose} disabled={loading} className="btn btn-cancel">
            Batal
          </button>
          <button onClick={handleSave} disabled={loading} className="btn btn-confirm">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
