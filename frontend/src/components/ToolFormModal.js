// src/components/ToolFormModal.jsx

import React, { useState, useEffect } from 'react';
const initialFormState = {
  name: '',
  stock: 0
};

function ToolFormModal({ isOpen, onClose, onSave, toolToEdit, showToast }) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (toolToEdit) {
      setFormData({
        name: toolToEdit.name || '',
        stock: toolToEdit.stock || 0
      });
    } else {
      setFormData(initialFormState);
    }
  }, [toolToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "stock") {
      const normalized = value.replace(/^0+(?=\d)/, '');
      setFormData(prev => ({ ...prev, stock: normalized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Nama alat tidak boleh kosong.', 'error');
      return;
    }

    const payload = {
      ...formData,
      stock: parseInt(formData.stock, 10) || 0, // pastikan integer
    };
    onSave(payload);
  };

  if (!isOpen) {
    return null;
  }

  const isEditMode = Boolean(toolToEdit);

  return (
    <div className="modal-backdrop">
      <div className="modal-content user-form-modal">
        <h3>{isEditMode ? 'Edit Alat' : 'Tambah Alat Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group half1">
              <label htmlFor="name">Nama Alat</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="stock">Stok Alat</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="confirmation-modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
            <button type="submit" className="btn-confirm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ToolFormModal;
