import React from 'react';

function ViewProofModal({ ticket, onClose, onDelete }) {
  if (!ticket) return null;

  return (
    <div className="modal-backdrop-user">
      <div className="modal-content-user">
        <h2>Proof of Work</h2>
        <p><strong>Workshop:</strong> {ticket.workshop}</p>
        <p><strong>Job description:</strong> {ticket.title}</p>
        <hr style={{ margin: '15px 0' }} />

        <h4>Description of the Work:</h4>
        <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {ticket.proof_description || 'Tidak ada deskripsi.'}
        </p>

        {ticket.proof_image_url && (
          <div className="proof-image-container" style={{ marginTop: '15px' }}>
            <h4>Proof Photo:</h4>
            <a href={ticket.proof_image_url} target="_blank" rel="noopener noreferrer">
              <img
                src={ticket.proof_image_url}
                alt="Bukti Pengerjaan"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </a>
          </div>
        )}

        <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
                Close
            </button>
            <button type="button" onClick={() => onDelete(ticket)} className="btn-confirm">
                Delete Ticket
            </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProofModal;