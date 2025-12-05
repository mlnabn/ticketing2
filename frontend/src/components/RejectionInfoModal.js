import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 150, damping: 20 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }
};

function RejectionInfoModal({ ticket, onClose, onDelete }) {
  if (!ticket) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop-user" onClick={onClose}>
      <motion.div
        className="modal-content-user"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2>Alasan Penolakan Tiket</h2>
        <p><strong>Deskripsi:</strong> {ticket.title}</p>
        <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
        <h4 className="detail-label">Detail Alasan:</h4>
        <div className="proof-description-area">
          <p style={{ whiteSpace: 'pre-wrap', borderRadius: '4px', padding: '10px' }}>
            {ticket.rejection_reason || 'Tidak ada alasan yang diberikan.'}
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-canceluser">
            Tutup
          </button>
          <button type="button" onClick={() => onDelete(ticket)} className="btn-confirmuser">
            Hapus Tiket
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default RejectionInfoModal;