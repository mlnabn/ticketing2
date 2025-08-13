import React, { useState, useEffect } from 'react';


// CSS sederhana untuk modal, bisa ditambahkan di App.css
const modalStyles = `
  .modal-overlay {
    position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .modal-content {
    background: white; padding: 2rem; border-radius: 8px;
    width: 90%; max-width: 500px;
  }
  .dark .modal-content { background: #1f2937; color: white; }
  .modal-content h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
  .modal-content form div { margin-bottom: 1rem; }
  .modal-content label { display: block; margin-bottom: 0.5rem; }
  .modal-content input { width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; }
  .dark .modal-content input { background: #374151; border-color: #4b5563; }
  .modal-content .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
`;

const UserFormModal = ({ userToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        password_confirmation: '',
      });
    } else {
      setFormData({ name: '', email: '', password: '', password_confirmation: '' });
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
      <style>{modalStyles}</style>
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
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'Kosongkan jika tidak ingin diubah' : ''} />
            </div>
            <div>
              <label htmlFor="password_confirmation">Konfirmasi Password:</label>
              <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserFormModal;