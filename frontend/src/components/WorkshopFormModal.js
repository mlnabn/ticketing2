import React, { useState, useEffect } from 'react';

export default function WorkshopFormModal({ workshopToEdit, onClose, onSave }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (workshopToEdit) {
      setName(workshopToEdit.name || '');
      setCode(workshopToEdit.code || '');
    }
  }, [workshopToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, code });
  };

  const isEditMode = Boolean(workshopToEdit);

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Workshop' : 'Tambah Workshop Baru'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Nama Workshop</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="code">Kode Tiket (2 Huruf)</label>
              <input type="text" id="code" value={code} onChange={e => setCode(e.target.value)} required maxLength="2" />
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