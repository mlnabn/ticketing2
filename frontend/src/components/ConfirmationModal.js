import React, { useState, useEffect, useRef } from 'react';

const ConfirmationModal = ({ show, message, onConfirm, onCancel }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const historyPushedRef = useRef(false);

  // Handle browser back button
  useEffect(() => {
    if (show && !historyPushedRef.current) {
      // Push state when modal opens
      window.history.pushState({ modal: 'confirm' }, '');
      historyPushedRef.current = true;
    }

    const handlePopState = (event) => {
      if (historyPushedRef.current && show) {
        historyPushedRef.current = false;
        if (onCancel) onCancel();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Cleanup history state when closing normally
  useEffect(() => {
    if (!show && historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, shouldRender]);

  const handleCloseClick = () => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
    if (onCancel) {
      onCancel();
    }
  };


  if (!shouldRender) return null;
  const animationClass = isClosing ? 'closing' : '';

  return (
    <div
      className={`confirmation-modal-backdrop ${animationClass}`}
      onClick={handleCloseClick}
    >
      <div
        className={`confirmation-modal-content ${animationClass}`}
        onClick={e => e.stopPropagation()}
      >
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
