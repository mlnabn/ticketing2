import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '../AuthContext';
import api from '../services/api';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineBell,
    HiHome,
    HiBell,
} from "react-icons/hi2";
import { FaUser, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import UserHeader from '../components/UserHeader';
import ProfileModal from '../components/ProfileModal';
import bgImage from '../Image/homeBg.jpg';
import yourLogok from '../Image/DTECH-Logo.png';

const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 20 }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const headerVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }
    }
};

const MobileMenuItem = ({ icon, text, onClick, active }) => (
    <button
        className={`sidebar-button ${active ? 'active' : ''}`}
        onClick={onClick}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', border: 'none', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
    >
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span className="nav-text" style={{ fontSize: '1rem', fontWeight: 500 }}>{text}</span>
    </button>
);

export default function UserDashboard() {
    const { user, logout, setUser } = useAuth();
    const dragControls = useDragControls();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeMobileMenu, setActiveMobileMenu] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            const lastCleared = localStorage.getItem('notifications_last_cleared');
            const newNotifications = lastCleared
                ? response.data.filter(n => new Date(n.created_at) > new Date(lastCleared))
                : response.data;
            setUnreadCount(newNotifications.length);
        } catch (error) {
            console.error("Gagal mengambil notifikasi:", error);
        }
    }, []);

    const handleNotificationToggle = () => {
        setUnreadCount(0);
        localStorage.setItem('notifications_last_cleared', new Date().toISOString());
        api.post('/notifications/mark-all-read');
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error("Gagal menghapus notifikasi:", error);
        }
    };

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
        setActiveMobileMenu(null);
    }

    const handleProfileSaved = (updatedUser) => {
        setUser(updatedUser);
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const isRequestActive = location.pathname.includes('/request');
    const isHistoryActive = location.pathname.includes('/history');

    return (
        <motion.div
            className="dashboard-container no-sidebar"
            style={{
                backgroundImage: `url(${bgImage})`,
                height: '100vh',
                
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <main className="main-content" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <motion.header
                    className="main-header-user"
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ flexShrink: 0, zIndex: 100, position: 'relative' }}
                >
                    <div className="header-left-group">
                        <img src={yourLogok} alt="Logo" className="header-logo" />
                    </div>
                    <div className="desktop-header-controls" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>

                        <div className="user-view-tabs desktop-only">
                            <NavLink to="request" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
                                Request
                                {isRequestActive && (
                                    <motion.div className="active-tab-indicator" layoutId="activeTabIndicator" />
                                )}
                            </NavLink>
                            <NavLink to="history" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
                                History
                                {isHistoryActive && (
                                    <motion.div className="active-tab-indicator" layoutId="activeTabIndicator" />
                                )}
                            </NavLink>
                        </div>

                        <div className="main-header-controls-user desktop-only">
                            <span className="breadcrump">
                                {isRequestActive ? 'Request' : isHistoryActive ? 'History' : 'Dashboard'}
                            </span>
                            <UserHeader
                                userName={user?.name}
                                userAvatar={user?.avatar_url}
                                handleLogout={handleLogout}
                                notifications={notifications}
                                unreadCount={unreadCount}
                                handleNotificationToggle={handleNotificationToggle}
                                handleDeleteNotification={handleDeleteNotification}
                                onEditProfile={handleOpenProfileModal}
                            />
                        </div>
                    </div>
                </motion.header>

                <div className="content-area" style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                    <div className="user-view-container">
                        <div className="user-view-content">
                            <AnimatePresence mode="wait">
                                <Outlet />
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Navigation Menu */}

            {activeMobileMenu && (
                <div
                    className="mobile-nav-overlay-user"
                    onClick={() => setActiveMobileMenu(null)}
                ></div>
            )}

            <AnimatePresence>
                {activeMobileMenu && (
                    <motion.div
                        key={activeMobileMenu}
                        className="mobile-nav-card-user"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="y"
                        dragListener={false}
                        dragControls={dragControls}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (offset.y > 100 || velocity.y > 500) {
                                setActiveMobileMenu(null);
                            }
                        }}

                        style={{
                            position: 'fixed',
                            bottom: '70px',
                            left: 0,
                            right: 0,
                            background: '#1a2236',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            zIndex: 999,
                            padding: '0',
                            maxHeight: '75vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div className="mobile-nav-card-drag-handle-user"
                            onPointerDown={(e) => dragControls.start(e)}
                            style={{
                                width: '100%',
                                padding: '15px 20px 5px 20px',
                                cursor: 'grab',
                                touchAction: 'none',
                                flexShrink: 0
                            }}
                        >
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '15px',
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '4px',
                                    backgroundColor: '#4a5568',
                                    borderRadius: '2px'
                                }}></div>
                            </div>

                            <div className="mobile-nav-card-header-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#fff' }}>
                                    {activeMobileMenu === 'Home' ? 'Menu' : activeMobileMenu}
                                </h3>
                            </div>
                        </div>
                        <nav className="mobile-nav-card-links-user" style={{
                            padding: '0 20px 20px 20px',
                            overflowY: 'auto',
                            touchAction: 'pan-y'
                        }}>
                            {activeMobileMenu === 'Home' && (
                                <>
                                    <MobileMenuItem
                                        icon={<HiOutlineHome />}
                                        text="Buat Request Baru"
                                        active={isRequestActive}
                                        onClick={() => { navigate('request'); setActiveMobileMenu(null); }}
                                    />
                                    <MobileMenuItem
                                        icon={<FaHistory />}
                                        text="Riwayat Tiket"
                                        active={isHistoryActive}
                                        onClick={() => { navigate('history'); setActiveMobileMenu(null); }}
                                    />
                                </>
                            )}
                            {activeMobileMenu === 'Notification' && (
                                <div className="mobile-notifications-user">
                                    {notifications && notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="notification-item-user"
                                                style={{ background: '#2a3449', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                                                <div className="notification-content-user">
                                                    <strong style={{ display: 'block', color: '#fff' }}>{notif.title}</strong>
                                                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#ccc' }}>{notif.message}</p>
                                                    <small style={{ color: '#888' }}>
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                                    </small>
                                                </div>
                                                {notif.user_id === user.id && (
                                                    <button
                                                        onClick={() => handleDeleteNotification(notif.id)}
                                                        className="notification-delete-btn"
                                                        style={{ marginTop: '5px', background: 'transparent', border: 'none', color: '#ff6b6b' }}
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#ccc', textAlign: 'center' }}>Tidak ada notifikasi.</p>
                                    )}
                                </div>
                            )}
                            {activeMobileMenu === 'Profil' && (
                                <>
                                    <div style={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '6px',
                                        backgroundColor: '#232d42',
                                        borderRadius: '12px',
                                        border: '1px solid #334155',
                                        color: 'inherit',
                                        transition: 'background-color 0.2s',
                                        textDecoration: 'none',
                                    }}>
                                        <button
                                            onClick={handleOpenProfileModal}
                                            style={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px',
                                                textAlign: 'left',
                                                color: 'inherit',
                                            }}
                                        >
                                            <div className="user-avatar" style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                backgroundColor: '#4a5568',
                                                flexShrink: 0
                                            }}>
                                                {user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FaUser size={20} color="#cbd5e0" />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                                                    {user?.name || "Pengguna"}
                                                </span>
                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                    Lihat & Edit Profil
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '15px',
                                                borderRadius: '12px',
                                                color: 'rgba(255, 107, 107, 0.8)',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <FaSignOutAlt size={20} />
                                        </button>
                                    </div>

                                    <div className="mobile-modal-divider" style={{ height: '1px', background: '#333', margin: '10px 0' }}></div>

                                </>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mobile-footer-nav-user">
                <button
                    onClick={() => setActiveMobileMenu(activeMobileMenu === 'Home' ? null : 'Home')}
                    className={activeMobileMenu === 'Home' ? 'active' : ''}
                >
                    {activeMobileMenu === 'Home' ? <HiHome /> : <HiOutlineHome />}
                    <span>Home</span>
                </button>

                <button
                    onClick={() => {
                        if (activeMobileMenu !== 'Notification') {
                            handleNotificationToggle();
                        }
                        setActiveMobileMenu(activeMobileMenu === 'Notification' ? null : 'Notification');
                    }}
                    className={activeMobileMenu === 'Notification' ? 'active' : ''}
                    style={{ position: 'relative' }}
                >
                    {activeMobileMenu === 'Notification' ? <HiBell /> : <HiOutlineBell />}
                    <span>Notification</span>
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '5px', right: '25%',
                            background: 'red', color: 'white', borderRadius: '50%',
                            padding: '2px 5px', fontSize: '0.6rem'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveMobileMenu(activeMobileMenu === 'Profil' ? null : 'Profil')} 
                    className={activeMobileMenu === 'Profil' ? 'active' : ''} 
                >
                    <CgProfile /> 
                    <span>Profil</span> 
                </button>
            </footer>

            <AnimatePresence>
                {showProfileModal && (
                    <ProfileModal
                        key="profileModal"
                        user={user}
                        onClose={() => setShowProfileModal(false)}
                        onSaved={handleProfileSaved}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}