import React from 'react';

function RejectionInfoModal({ ticket, onClose, onDelete }) {
  if (!ticket) return null;

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <h3>Alasan Penolakan Tiket</h3>
        <p><strong>Deskripsi:</strong> {ticket.title}</p>
        <div className="rejection-reason-display">
          <p>{ticket.rejection_reason || 'Tidak ada alasan yang diberikan.'}</p>
        </div>
        <div className="confirmation-modal-actions">
          {/* Tombol Hapus sekarang ada di sini */}
          <button onClick={() => onDelete(ticket)} className="btn-delete">Hapus Tiket</button>
          <button onClick={onClose} className="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default RejectionInfoModal;
