// src/components/ProofModal.js

import React, { useState } from 'react';

function ProofModal({ ticket, onSave, onClose }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description) {
      alert('Deskripsi pengerjaan tidak boleh kosong.');
      return;
    }

    const formData = new FormData();
    formData.append('proof_description', description);
    if (image) {
      formData.append('proof_image', image);
    }

    onSave(ticket.id, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Bukti Pengerjaan: {ticket.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="proof_description">Deskripsi Pengerjaan</label>
            <textarea
              id="proof_description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="proof_image">Upload Foto Bukti (Opsional)</label>
            <input
              id="proof_image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {preview && (
            <div className="image-preview">
              <p>Preview:</p>
              <img src={preview} alt="Preview Bukti" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px', borderRadius: '8px' }} />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary">Simpan Bukti</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProofModal;