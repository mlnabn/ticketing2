import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './Toast.css';


const icons = {
  success: <FaCheckCircle />,
  error: <FaTimesCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

const Toast = ({ message, type, onClose }) => {
  const location = useLocation();
  const initialPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== initialPath.current) {
      onClose();
    }
  }, [location, onClose]);
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

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