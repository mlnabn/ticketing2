import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

// Terima props dari App.js
function NotificationBell({ notifications, unreadCount, onToggle, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);

    // Fungsi fetch dan useEffect untuk fetch data telah dihapus dari sini

    const handleToggle = () => {
        setIsOpen(!isOpen);
        // Jika panel dibuka dan ada fungsi onToggle, panggil fungsi tersebut
        if (!isOpen && onToggle) {
            onToggle();
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);
    
    return (
        <div className="notification-bell-container" ref={notificationRef}>
            <button onClick={handleToggle} className="notification-button">
                <i className="fas fa-bell"></i>
                {/* Gunakan unreadCount dari props */}
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="notification-list">
                        {/* Gunakan notifications dari props */}
                        {notifications && notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notification-content">
                                        <strong>{notif.title}</strong>
                                        <p>{notif.message}</p>
                                        <small>
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                        </small>
                                    </div>
                                    {/* Tombol hapus kini memanggil fungsi onDelete dari props */}
                                    {notif.user_id && (
                                        <button onClick={() => onDelete(notif.id)} className="notification-delete-btn" title="Hapus Notifikasi">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="notification-item empty">
                                <p>There are no notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;