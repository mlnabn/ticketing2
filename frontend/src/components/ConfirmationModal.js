import React from 'react';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <p className="mb-4 text-lg text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-3">
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
      </div>
    </div>
  );
};

export default ConfirmationModal;
