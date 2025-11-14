import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

function NotificationBell({ notifications, unreadCount, onToggle, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
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

    const panelVariants = {
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
        <div className="notification-bell-container" ref={notificationRef}>
            <motion.button 
                onClick={handleToggle} 
                className="notification-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="notification-overlay"
                            onClick={handleToggle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        ></motion.div>
                        <motion.div 
                            className="notification-panel"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="notification-panel-header">
                                <h4>Notifications</h4>
                            </div>
                            <div className="notification-list">
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
                                            {notif.user_id && (
                                                <button
                                                    onClick={() => onDelete(notif.id)}
                                                    className="notification-delete-btn"
                                                    title="Hapus Notifikasi"
                                                >
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
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}

export default NotificationBell;