import React from 'react';

function RejectionInfoModal({ ticket, onClose, onDelete }) {
  if (!ticket) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Alasan Penolakan Tiket</h3>
        <p><strong>Deskripsi:</strong> {ticket.title}</p>
        <div className="reason-display">
          <p>{ticket.rejection_reason || 'Tidak ada alasan yang diberikan.'}</p>
        </div>
        <div className="modal-actions">
          {/* Tombol Hapus sekarang ada di sini */}
          <button onClick={() => onDelete(ticket)} className="btn-delete">Hapus Tiket</button>
          <button onClick={onClose} className="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default RejectionInfoModal;
