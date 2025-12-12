import React from 'react';
import ReactDOM from 'react-dom'; // Wajib import ini
import { motion } from 'framer-motion'; // Gunakan motion agar animasi smooth seperti detail modal
import { useModalBackHandlerOnMount } from '../hooks/useModalBackHandler';

// Gunakan varian yang sama agar konsisten
const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
};

function ViewProofModal({ ticket, onClose, onDelete }) {
  // Handle browser back button
  const handleClose = useModalBackHandlerOnMount(onClose, 'view-proof');

  if (!ticket) return null;

  // Gunakan Portal ke document.body
  return ReactDOM.createPortal(
    <motion.div
      className="modal-backdrop-user"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={handleClose}
      style={{ zIndex: 1050 }} // Pastikan z-index tinggi, tapi di bawah confirmation modal (biasanya 1100+)
    >
      <motion.div
        className="modal-content-user"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Bukti Pekerjaan</h2>
        <p><strong>Workshop:</strong> {ticket.workshop ? ticket.workshop.name : 'N/A'}</p>
        <p><strong>Dekripsi Pekerjaan:</strong> {ticket.title}</p>
        <hr style={{ margin: '15px 0' }} />

        <h4>Detail Penyelesaian:</h4>
        <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {ticket.proof_description || 'Tidak ada deskripsi.'}
        </p>

        {ticket.proof_image_url && (
          <div className="proof-image-container" style={{ marginTop: '15px' }}>
            <h4>Bukti Foto:</h4>
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
          <button type="button" onClick={handleClose} className="btn-cancel">
            Tutup
          </button>
          <button type="button" onClick={() => onDelete(ticket)} className="btn-confirm">
            Hapus Tiket
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default ViewProofModal;