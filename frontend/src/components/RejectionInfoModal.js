import React from 'react';

function RejectionInfoModal({ ticket, onClose, onDelete }) {
  if (!ticket) return null;

  return (
    <div className="modal-backdrop-user">
      <div className="modal-content-user">
        <h3>Reasons for Ticket Rejection</h3>
        <p><strong>Description:</strong> {ticket.title}</p>
        <div className="rejection-reason-textarea-user">
          <p>{ticket.rejection_reason || 'Tidak ada alasan yang diberikan.'}</p>
        </div>
        <div className="modal-actions">
          {/* Tombol Hapus sekarang ada di sini */}
          <button onClick={onClose} className="btn-canceluser">Close</button>
          <button onClick={() => onDelete(ticket)} className="btn-confirmuser">Delete Ticket</button>
          
        </div>
      </div>
    </div>
  );
}

export default RejectionInfoModal;
