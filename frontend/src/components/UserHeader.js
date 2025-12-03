import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const UserHeader = ({
  userName,
  userAvatar,
  handleLogout,
  notifications,
  unreadCount,
  handleNotificationToggle,
  handleDeleteNotification,
  onEditProfile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isValidAvatar =
    typeof userAvatar === 'string' &&
    (userAvatar.startsWith('http') || userAvatar.startsWith('data:image'));
  
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  return (
    <div
      className="user-header"
      style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}
    >
      {/* Notifikasi */}
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
        onToggle={handleNotificationToggle}
        onDelete={handleDeleteNotification}
      />

      {/* Avatar + Nama */}
      <motion.div
        className="user-avatar2-container"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ cursor: 'pointer' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <div className="user-avatar2">
          {isValidAvatar ? (
            <img src={userAvatar} alt="Avatar" />
          ) : (
            <FaUser size={15} color="#fff" />
          )}
        </div>
        <span className="user-name">{userName || 'User'}</span>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <>
            <motion.div
              className="dropdown-overlay"
              onClick={() => setDropdownOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            ></motion.div>

            <motion.div 
              className="user-dropdown"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onEditProfile && onEditProfile(); 
                }}
                className="dropdown-button"
              >
                <i className="fas fa-user-edit" style={{ marginRight: '8px' }}></i>
                Edit Profil
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="logout-buttonuser"
              >
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHeader;
