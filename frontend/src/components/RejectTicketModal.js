import React, { useState } from 'react';

function RejectTicketModal({ ticket, onReject, onClose }) {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(ticket.id, reason);
    } else {
      alert('Mohon isi alasan penolakan.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Tolak Pekerjaan "{ticket.title}"</h3>
        <p>Silakan masukkan alasan penolakan tiket ini:</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Deskripsi pekerjaan kurang jelas..."
          className="rejection-reason-textarea"
        />
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm-reject">Tolak Tiket</button>
        </div>
      </div>
    </div>
  );
}

export default RejectTicketModal;
