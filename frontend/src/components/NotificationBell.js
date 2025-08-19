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
            // Untuk sementara, anggap semua yang baru adalah unread
            // Implementasi `is_read` yang proper butuh backend lebih kompleks
        } catch (error) {
            console.error("Gagal mengambil notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Cek notif setiap 1 menit
        return () => clearInterval(interval);
    }, []);

    // Cek unread count berdasarkan notifikasi yang lebih baru dari login terakhir (simplifikasi)
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
            // Idealnya panggil API untuk mark as read
            axios.post(`${API_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
        }
    };

    // Menutup panel jika klik di luar
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
                                <div key={notif.id} className="notification-item">
                                    <strong>{notif.title}</strong>
                                    <p>{notif.message}</p>
                                    <small>
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                    </small>
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