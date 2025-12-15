import React, { useState, useEffect } from 'react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

export default function NotificationTemplateFormModal({ show, templateToEdit, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);

  // Handle browser back button
  const handleClose = useModalBackHandler(show, onClose, 'notification-template');

  useEffect(() => {
    if (templateToEdit) {
      setTitle(templateToEdit.title || '');
      setMessage(templateToEdit.message || '');
    }
    if (!show) {
      const timer = setTimeout(() => {
        setTitle('');
        setMessage('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [templateToEdit, show]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, message });
  };

  const isEditMode = Boolean(templateToEdit);
  if (!shouldRender) return null;
  const animationClass = isClosing ? 'closing' : '';

  return (
    <div className={`confirmation-modal-backdrop ${animationClass}`}>
      <div className={`confirmation-modal-content ${animationClass}`}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Template' : 'Tambah Template Baru'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Judul Template</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder='ex: Pengumuman' />
            </div>
            <div className="form-group">
              <label htmlFor="message">Isi Pesan</label>
              <textarea id="message" rows="5" value={message} onChange={e => setMessage(e.target.value)} placeholder='Isi pesan notifikasi ...'></textarea>
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