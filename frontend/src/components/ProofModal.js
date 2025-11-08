import React, { useState, useEffect } from 'react';

function ProofModal({ show, ticket, onSave, onClose }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const [currentTicket, setCurrentTicket] = useState(ticket);

  useEffect(() => {
      if (show) {
          setCurrentTicket(ticket);
          setShouldRender(true);
          setIsClosing(false); 
      } else if (shouldRender && !isClosing) {
          setIsClosing(true); 
          const timer = setTimeout(() => {
              setIsClosing(false);
              setShouldRender(false);
              setDescription('');
              setImage(null);
              setPreview(null);
          }, 300); 
          return () => clearTimeout(timer);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, ticket, shouldRender]);

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

    onSave(currentTicket.id, formData);
  };

  const handleCloseClick = () => {
      if (onClose) {
          onClose();
      }
  };

  if (!shouldRender) return null;
  if (!currentTicket) return null;

  const animationClass = isClosing ? 'closing' : '';

  return (
    <div 
      className={`modal-backdrop ${animationClass}`}
      onClick={handleCloseClick}
    >
      <div 
        className={`modal-content-detail ${animationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{fontSize:'2rem'}}>Bukti Pengerjaan: {currentTicket.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="proof-modal__group">
            <label htmlFor="proof_description">Deskripsi Pengerjaan</label>
            <textarea
              id="proof_description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="proof-modal__group">
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
            <button type="button" onClick={handleCloseClick} className="btn-cancel">Batal</button>
            <button type="submit" className="btn-confirm">Simpan Bukti</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProofModal;