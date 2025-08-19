// src/components/NotificationBell.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = 'http://127.0.0.1:8000/api';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Gagal mengambil notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Cek notif setiap 1 menit
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
         const lastCleared = localStorage.getItem('notifications_last_cleared');
         if (lastCleared) {
             const newNotifications = notifications.filter(n => new Date(n.created_at) > new Date(lastCleared));
             setUnreadCount(newNotifications.length);
         } else {
             setUnreadCount(notifications.length);
         }
    }, [notifications]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) { // Saat membuka panel
            setUnreadCount(0);
            localStorage.setItem('notifications_last_cleared', new Date().toISOString());
            axios.post(`${API_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
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

    // FUNGSI UNTUK MENGHAPUS NOTIFIKASI
    const handleDelete = async (notificationId) => {
        const notifToDelete = notifications.find(n => n.id === notificationId);
        // Hentikan jika notifikasi tidak ditemukan atau merupakan notifikasi global (user_id null)
        if (!notifToDelete || notifToDelete.user_id === null) return;
        
        try {
            await axios.delete(`${API_URL}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            // Update state agar notifikasi langsung hilang dari tampilan
            setNotifications(currentNotifications =>
                currentNotifications.filter(notif => notif.id !== notificationId)
            );
        } catch (error) {
            console.error("Gagal menghapus notifikasi:", error);
            alert("Gagal menghapus notifikasi.");
        }
    };

    return (
        <div className="notification-bell-container" ref={notificationRef}>
            <button onClick={handleToggle} className="notification-button">
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                // PERUBAHAN DI SINI: Struktur item notifikasi diubah
                                <div key={notif.id} className="notification-item">
                                    <div className="notification-content">
                                        <strong>{notif.title}</strong>
                                        <p>{notif.message}</p>
                                        <small>
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                        </small>
                                    </div>
                                    {/* TAMBAHAN: Tombol hapus hanya muncul jika notif punya user_id */}
                                    {notif.user_id && (
                                        <button onClick={() => handleDelete(notif.id)} className="notification-delete-btn" title="Hapus Notifikasi">
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