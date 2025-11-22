import React from 'react';
import { motion } from 'framer-motion';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 } 
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 } 
  }
};

const ConfirmationModalUser = ({ message, onConfirm, onCancel }) => {
  return (
    // 3. 
    <motion.div 
      className="confirmation-modal-backdrop-user"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit" 
      onClick={onCancel} 
    >
      <motion.div 
        className="confirmation-modal-content-user"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <div className="confirmation-modal-actions">
          <button
            onClick={onCancel}
            className="btn-cancel"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="btn-confirm"
          >
            Hapus
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModalUser;