import React, { useState, useEffect } from 'react';

export default function NotificationTemplateFormModal({ templateToEdit, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (templateToEdit) {
      setTitle(templateToEdit.title || '');
      setMessage(templateToEdit.message || '');
    }
  }, [templateToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, message });
  };

  const isEditMode = Boolean(templateToEdit);

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Template' : 'Tambah Template Baru'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Judul Template</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Isi Pesan</label>
              <textarea id="message" rows="5" value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </div>
          </div>
          <div className="confirmation-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-confirm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}