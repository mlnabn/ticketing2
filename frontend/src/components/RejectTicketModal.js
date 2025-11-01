import React, { useState, useEffect } from 'react';

function RejectTicketModal({ show, ticket, onReject, onClose, showToast }) {
  const [reason, setReason] = useState('');

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
              setReason('');
          }, 300); 
          return () => clearTimeout(timer);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, ticket, shouldRender]);

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(currentTicket.id, reason);
    } else {
      showToast('Mohon isi alasan penolakan.', 'info');
    }
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
        className={`modal-content ${animationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <h3>Tolak Pekerjaan "{currentTicket.title}"</h3>
        <p>Silakan masukkan alasan penolakan tiket ini:</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Deskripsi pekerjaan kurang jelas..."
          className="rejection-reason-textarea"
        />
        <div className="modal-actions">
          <button onClick={handleCloseClick} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm">Tolak Tiket</button>
        </div>
      </div>
    </div>
  );
}

export default RejectTicketModal;
