import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const UserHeader = ({
  userName,
  userAvatar,
  handleLogout,
  notifications,
  unreadCount,
  handleNotificationToggle,
  handleDeleteNotification,
  onEditProfile, // ✅ tambah prop baru
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // cek apakah avatar valid (harus berupa URL atau base64 data:image)
  const isValidAvatar =
    typeof userAvatar === 'string' &&
    (userAvatar.startsWith('http') || userAvatar.startsWith('data:image'));

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
      <div
        className="user-avatar2-container"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-avatar2">
          {isValidAvatar ? (
            <img src={userAvatar} alt="Avatar" />
          ) : (
            <FaUser size={15} color="#fff" />
          )}
        </div>
        <span className="user-name">{userName || 'User'}</span>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          {/* Overlay agar klik di luar bisa menutup */}
          <div
            className="dropdown-overlay"
            onClick={() => setDropdownOpen(false)}
          ></div>

          <div className="user-dropdown">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onEditProfile && onEditProfile(); // ✅ panggil modal edit profil
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
          </div>
        </>
      )}
    </div>
  );
};

export default UserHeader;
