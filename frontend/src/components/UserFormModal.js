import React, { useState, useEffect } from 'react';
import '../App.css';

const UserFormModal = ({ userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',
  });
  
  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        password_confirmation: '',
        role: userToEdit.role,
      });
    } else {
      setFormData({ name: '', email: '', password: '', password_confirmation: '', role: 'user' });
    }
  }, [userToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Nama:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="role">Peran:</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required className="form-input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : ''} />
            </div>
            <div>
              <label htmlFor="password_confirmation">Konfirmasi Password:</label>
              <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-delete">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserFormModal;