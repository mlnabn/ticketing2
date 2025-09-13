// src/components/Toast.js
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import './Toast.css';

const icons = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  info: <FaInfoCircle />,
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Otomatis hilang setelah 3 detik

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <motion.div
      className={`toast ${type}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      layout
    >
      <div className="toast-icon">{icons[type] || <FaInfoCircle />}</div>
      <p>{message}</p>
    </motion.div>
  );
};

export default Toast;