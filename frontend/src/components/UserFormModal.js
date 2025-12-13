import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import '../App.css';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];


const UserFormModal = ({ show, userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'user',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);

  // Handle browser back button
  const handleClose = useModalBackHandler(show, onClose, 'user-form');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, shouldRender]);

  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    if (show) {
      if (isEditMode) {
        setFormData({
          name: userToEdit.name,
          email: userToEdit.email,
          phone: userToEdit.phone || '',
          password: '',
          password_confirmation: '',
          role: userToEdit.role,
        });
      } else {
        setFormData({ name: '', email: '', phone: '', password: '', password_confirmation: '', role: 'user' });
      }
    }
  }, [userToEdit, isEditMode, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!shouldRender) return null;

  const animationClass = isClosing ? 'closing' : '';

  return (
    <>
      <div
        className={`modal-overlay ${animationClass}`}
        onClick={handleClose}
      >
        <div
          className={`modal-content-detail ${animationClass}`}
          onClick={e => e.stopPropagation()}
        >
          <h1 style={{ fontSize: '2rem' }}>{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Nama:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : 'Bagas Pambudi'}
                required
                style={{ borderRadius: '10px' }} />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : 'user@example.com'}
                required
                style={{ borderRadius: '10px' }} />
            </div>
            <div>
              <label htmlFor="phone">Nomor Telepon:</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : '628xxxxxxxxxx'}
                style={{ borderRadius: '10px' }}
              />
            </div>

            <div>
              <label htmlFor="role">Peran:</label>
              <Select
                classNamePrefix="custom-select-role"
                options={roleOptions}
                value={roleOptions.find(option => option.value === formData.role)}
                onChange={(selectedOption) => {
                  setFormData(prev => ({ ...prev, role: selectedOption.value }));
                }}
                isSearchable={false}
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : '******'}
                  style={{ borderRadius: '10px' }}
                />
                <button type="button" onClick={togglePasswordVisibility} className="password-toggle-btn">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="password_confirmation">Konfirmasi Password:</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : '******'}
                  style={{ borderRadius: '10px' }}
                />
                <button type="button" onClick={togglePasswordVisibility} className="password-toggle-btn">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleClose} className="btn-cancel">Batal</button>
              <button type="submit" className="btn-confirm">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserFormModal;