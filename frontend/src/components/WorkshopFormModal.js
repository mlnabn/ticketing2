import React, { useState, useEffect } from 'react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

export default function WorkshopFormModal({ show, workshopToEdit, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);

  // Handle browser back button
  const handleClose = useModalBackHandler(show, onClose, 'workshop-form');

  useEffect(() => {
    if (workshopToEdit) {
      setName(workshopToEdit.name || '');
      setDescription(workshopToEdit.description || '');
      setUrl(workshopToEdit.url || '');
    }
    if (!show) {
      const timer = setTimeout(() => {
        setName('');
        setDescription('');
        setUrl('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [workshopToEdit, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizeValue = (value) => {
      return value === '' ? null : value;
    };

    onSave({
      name: normalizeValue(name),
      lat: null,
      lng: null,
      description: normalizeValue(description),
      url: normalizeValue(url),
    });
  };

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

  const isEditMode = Boolean(workshopToEdit);
  if (!shouldRender) return null;
  const animationClass = isClosing ? 'closing' : '';

  return (
    <div className={`confirmation-modal-backdrop ${animationClass}`} onClick={handleClose}>
      <div className={`modal-content-large ${animationClass}`} onClick={e => e.stopPropagation()}>
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
              <label htmlFor="description">Deskripsi Singkat</label>
              <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Lokasi utama..." />
            </div>
            <div className="form-group">
              <label htmlFor="url">URL Google Maps</label>
              <input type="url" id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="http://googleusercontent.com/maps..." />
            </div>
          </div>
          <div className="confirmation-modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn-confirm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}