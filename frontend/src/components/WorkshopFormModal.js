import React, { useState, useEffect } from 'react';

export default function WorkshopFormModal({ show, workshopToEdit, onClose, onSave }) {
  const [name, setName] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (workshopToEdit) {
      setName(workshopToEdit.name || '');
    }
    if (!show) {
      const timer = setTimeout(() => setName(''), 300);
      return () => clearTimeout(timer);
    }
  }, [workshopToEdit, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
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
    <div className={`confirmation-modal-backdrop ${animationClass}`}>
      <div className={`confirmation-modal-content ${animationClass}`}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Workshop' : 'Tambah Workshop Baru'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Nama Workshop</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />
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