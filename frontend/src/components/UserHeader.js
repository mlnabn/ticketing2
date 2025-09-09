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
  handleDeleteNotification
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // fungsi cek apakah avatar valid
  const isValidAvatar = userAvatar && userAvatar.startsWith("data:image") || userAvatar?.startsWith("http");

  return (
    <div className="user-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
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
    {/* Overlay blur background */}
    <div
      className="dropdown-overlay"
      onClick={() => setDropdownOpen(false)} // klik di luar nutup dropdown
    ></div>

    {/* Dropdown menu */}
    <div className="user-dropdown">
      <button onClick={handleLogout} className="logout-buttonuser">
        <i className="fas fa-sign-out-alt" style={{ marginRight: "8px" }}></i>
        Logout
      </button>
    </div>
  </>
)}

    </div>
  );
};

export default UserHeader;
