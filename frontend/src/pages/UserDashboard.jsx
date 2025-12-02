import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '../AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Import Icons untuk Mobile Footer
import {
  HiOutlineHome,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiHome,
  HiBell,
  HiCog6Tooth
} from "react-icons/hi2";
import { FaUser, FaHistory, FaEdit, FaSignOutAlt } from 'react-icons/fa';

// Import semua komponen yang dibutuhkan
import JobFormUser from '../components/JobFormUser';
import UserHeader from '../components/UserHeader';
import ConfirmationModalUser from '../components/ConfirmationModalUser';
import RejectionInfoModal from '../components/RejectionInfoModal';
import ViewProofModal from '../components/ViewProofModal';
import ProfileModal from '../components/ProfileModal';
import TicketDetailModalUser from '../components/TicketDetailModalUser';

// Import aset gambar
import bgImage from '../Image/homeBg.jpg';
import yourLogok from '../Image/DTECH-Logo.png';

// --- Variants Animation ---
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

const tabContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};
const buttonHoverTap = {
  hover: { scale: 1.05, transition: { duration: 0.1 } },
  tap: { scale: 0.95 }
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
  // -----------------------------------------------------------------
  // #1. STATE MANAGEMENT
  // -----------------------------------------------------------------
  const { user, logout, setUser } = useAuth();
  const [userViewTab, setUserViewTab] = useState('request');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const historyListRef = useRef(null);
  const [createdTicketsData, setCreatedTicketsData] = useState({ data: [], current_page: 1, last_page: 1 });
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals State
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToShowReason, setTicketToShowReason] = useState(null);
  const [showRejectionInfoModal, setShowRejectionInfoModal] = useState(false);
  const [ticketToShowProof, setTicketToShowProof] = useState(null);
  const [showViewProofModal, setShowViewProofModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

  // Mobile Menu State
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);

  const createdTicketsOnPage = useMemo(() => (createdTicketsData ? createdTicketsData.data : []), [createdTicketsData]);

  // -----------------------------------------------------------------
  // #2. DATA FETCHING & HANDLERS
  // -----------------------------------------------------------------

  const handleViewTicketDetail = (ticket) => {
    setSelectedTicketForDetail(ticket);
  };

  const handleCloseDetailModal = () => {
    setSelectedTicketForDetail(null);
  };
  const handleRowClick = (e, ticket) => {
    if (e.target.closest('button')) {
      return;
    }
    handleViewTicketDetail(ticket);
  };

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const fetchCreatedTickets = useCallback(async (page = 1, isLoadMore = false) => {
    const targetPage = isLoadMore ? page : 1;

    try {
      const response = await api.get('/tickets/created-by-me', { params: { page: targetPage } });

      if (isLoadMore) {
        setCreatedTicketsData(prev => {
          const newTickets = response.data.data.filter(
            newItem => !prev.data.some(existingItem => existingItem.id === newItem.id)
          );
          return {
            ...response.data,
            data: [...prev.data, ...newTickets]
          };
        });
      } else {
        setCreatedTicketsData(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil tiket yang dibuat:", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      isLoadMore && setIsLoadingMore(false);
    }
  }, [handleLogout]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/all');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar pengguna:", error);
    }
  }, []);

  const addTicket = useCallback(async (formData) => {
    try {
      await api.post('/tickets', formData);
      fetchCreatedTickets(1);
      setUserViewTab('history');
      alert('Tiket berhasil dibuat.');
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
      alert('Gagal menambah tiket. Mohon coba lagi.');
    }
  }, [fetchCreatedTickets]);

  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      await api.delete(`/tickets/${ticketToDelete.id}`);
      fetchCreatedTickets(1);
      alert('Tiket berhasil dihapus.');
    } catch (error) {
      console.error("Gagal hapus tiket:", error);
      alert(error.response?.data?.error || "Gagal menghapus tiket.");
    } finally {
      setShowConfirmModal(false);
      setTicketToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTicketToDelete(null);
  };

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
    console.log("Profil diperbarui dan context telah diupdate.");
  };

  const loadMoreItems = async () => {
    if (isLoadingMore || createdTicketsData.current_page >= createdTicketsData.last_page) return;
    setIsLoadingMore(true);
    const nextPage = createdTicketsData.current_page + 1;
    await fetchCreatedTickets(nextPage, true);
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

    if (nearBottom && !isLoadingMore && createdTicketsData.current_page < createdTicketsData.last_page) {
      loadMoreItems();
    }
  };

  // -----------------------------------------------------------------
  // #3. EFFECTS
  // -----------------------------------------------------------------
  useEffect(() => {
    fetchAllUsers();
    fetchNotifications();
  }, [fetchAllUsers, fetchNotifications]);

  useEffect(() => {
    if (userViewTab === 'history') {
      fetchCreatedTickets(1);
    }
  }, [userViewTab, fetchCreatedTickets]);

  // -----------------------------------------------------------------
  // #4. RENDER LOGIC
  // -----------------------------------------------------------------
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

        {/* HEADER */}
        <motion.header
          className="main-header-user"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          style={{
            flexShrink: 0,
            zIndex: 100,
            position: 'relative'
          }}
        >
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <div className="desktop-header-controls" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>
            <div className="user-view-tabs desktop-only">
              <button className={`tab-button ${userViewTab === 'request' ? 'active' : ''}`} onClick={() => setUserViewTab('request')}>
                Request
                {userViewTab === 'request' && (
                  <motion.div className="active-tab-indicator" layoutId="activeTabIndicator" />
                )}
              </button>
              <button className={`tab-button ${userViewTab === 'history' ? 'active' : ''}`} onClick={() => setUserViewTab('history')}>
                History
                {userViewTab === 'history' && (
                  <motion.div className="active-tab-indicator" layoutId="activeTabIndicator" />
                )}
              </button>
            </div>
            <div className="main-header-controls-user desktop-only">
              <span className="breadcrump">{userViewTab.charAt(0).toUpperCase() + userViewTab.slice(1)}</span>
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

        {/* CONTENT AREA */}
        <div className="content-area" style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '80px' }}> {/* Padding bottom ditambah agar tidak tertutup footer */}
          <div className="user-view-container">
            <div className="user-view-content">

              <AnimatePresence mode="wait">
                {userViewTab === 'request' && (
                  <motion.div
                    key="request-tab"
                    className="request-tab"
                    variants={tabContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.h2 variants={itemVariants}>Submit a Request</motion.h2>
                    <motion.p variants={itemVariants}>Please fill in the job details below.</motion.p>
                    <br />
                    <motion.div variants={itemVariants}>
                      <JobFormUser users={users} addTicket={addTicket} />
                    </motion.div>
                  </motion.div>
                )}

                {userViewTab === 'history' && (
                  <motion.div
                    key="history-tab"
                    className="history-tab"
                    variants={tabContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.h2 variants={itemVariants}>Your Tickets</motion.h2>
                    <table className="job-table-user user-history-table">
                      <thead>
                        <tr>
                          <th>Deskripsi</th>
                          <th>Workshop</th>
                          <th>Tanggal Dibuat</th>
                          <th>Waktu Pengerjaan</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                    </table>
                    <motion.div
                      className="job-list table-body-scroll"
                      ref={historyListRef}
                      onScroll={handleScroll}
                      style={{ marginTop: '20px', maxHeight: '60vh', overflowY: 'auto' }}
                      variants={itemVariants}
                    >
                      <table className="job-table-user user-history-table">

                        <tbody>
                          {!createdTicketsData ? (
                            <tr>
                              <td colSpan="6">Memuat riwayat tiket...</td>
                            </tr>
                          ) : createdTicketsOnPage.length > 0 ? (
                            createdTicketsOnPage.map(ticket => (
                              <tr
                                key={ticket.id}
                                className="clickable-row"
                                onClick={(e) => handleRowClick(e, ticket)}
                              >
                                <td data-label="Deskripsi">
                                  <span className="description-cell">{ticket.title}</span>
                                </td>
                                <td data-label="Workshop">{ticket.workshop ? ticket.workshop.name : 'N/A'}</td>
                                <td data-label="Tanggal Dibuat">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</td>
                                <td data-label="Waktu Pengerjaan">
                                  {(() => {
                                    if (ticket.started_at) {
                                      return ticket.completed_at
                                        ? `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`
                                        : `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
                                    }
                                    const datePart = ticket.requested_date ? format(new Date(ticket.requested_date), 'dd-MM-yy') : '';
                                    const timePart = ticket.requested_time || '';
                                    return ticket.requested_date || ticket.requested_time ? `Request: ${datePart} ${timePart}`.trim() : 'Waktu Fleksibel';
                                  })()}
                                </td>
                                <td data-label="Status">
                                  <span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                                </td>
                                <td data-label="Aksi">
                                  {ticket.status === 'Selesai' && ticket.proof_description ? (
                                    <motion.button
                                      variants={buttonHoverTap}
                                      whileHover="hover"
                                      whileTap="tap"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTicketToShowProof(ticket);
                                        setShowViewProofModal(true);
                                      }}
                                      className="btn-action btn-start">
                                      Lihat Bukti
                                    </motion.button>

                                  ) : ticket.status === 'Ditolak' ? (
                                    <motion.button
                                      variants={buttonHoverTap}
                                      whileHover="hover"
                                      whileTap="tap"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTicketToShowReason(ticket);
                                        setShowRejectionInfoModal(true);
                                      }}
                                      className="btn-action btn-start">
                                      Alasan
                                    </motion.button>

                                  ) : (
                                    <motion.button
                                      variants={buttonHoverTap}
                                      whileHover="hover"
                                      whileTap="tap"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(ticket);
                                      }}
                                      className="btn-action btn-delete-small">
                                      Hapus
                                    </motion.button>
                                  )}

                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6">Anda belum membuat tiket.</td>
                            </tr>
                          )}
                          {isLoadingMore && (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                          )}
                        </tbody>
                      </table>
                    </motion.div>

                    {createdTicketsData && createdTicketsData.total > 0 && (
                      <motion.div
                        variants={itemVariants}
                        style={{
                          marginTop: '10px',
                          padding: '15px 20px',
                          background: 'linear-gradient(90deg, rgba(46, 39, 112, 0.6) 0%, rgba(30, 67, 137, 0.6) 100%)',
                          border: '1px solid #5a6d8d',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: '#FFFFFF',
                          width: '99%'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>Total Tiket Saya</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>{createdTicketsData.total}</span>
                      </motion.div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* --- MOBILE NAVIGATION & OVERLAYS --- */}
      {/* ---------------------------------------------------- */}
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
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', bottom: '70px', left: 0, right: 0,
              background: '#1a2236', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
              zIndex: 999, padding: '20px', maxHeight: '70vh', overflowY: 'auto',
              boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
            }}
          >
            <div className="mobile-nav-card-header-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>
                {activeMobileMenu === 'Home' ? 'Menu' : activeMobileMenu}
              </h3>
              {/* <button onClick={() => setActiveMobileMenu(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem' }}>&times;</button> */}
            </div>

            <nav className="mobile-nav-card-links-user" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* === HOME MENU: REQUEST & HISTORY === */}
              {activeMobileMenu === 'Home' && (
                <>
                  <MobileMenuItem
                    icon={<HiOutlineHome />}
                    text="Buat Request Baru"
                    active={userViewTab === 'request'}
                    onClick={() => { setUserViewTab('request'); setActiveMobileMenu(null); }}
                  />
                  <MobileMenuItem
                    icon={<FaHistory />}
                    text="Riwayat Tiket"
                    active={userViewTab === 'history'}
                    onClick={() => { setUserViewTab('history'); setActiveMobileMenu(null); }}
                  />
                </>
              )}

              {/* === NOTIFICATION MENU === */}
              {activeMobileMenu === 'Notification' && (
                <div className="mobile-notifications-user">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                  </div>
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

              {/* === SETTING MENU === */}
              {activeMobileMenu === 'Setting' && (
                <>
                  <div className="mobile-modal-setting-item user-profile-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px', background: '#2a3449', borderRadius: '8px' }}>
                    <div className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#ccc' }}>
                      {user?.avatar_url ? <img src={user.avatar_url} alt="Av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUser style={{ margin: '10px', color: '#333' }} />}
                    </div>
                    <span style={{ color: '#fff' }}><strong>{user?.name || "User"}</strong></span>
                  </div>

                  <MobileMenuItem
                    icon={<FaEdit />}
                    text="Edit Profil"
                    onClick={handleOpenProfileModal}
                  />
                  <div className="mobile-modal-divider" style={{ height: '1px', background: '#333', margin: '10px 0' }}></div>
                  <button
                    onClick={handleLogout}
                    className="sidebar-button"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', border: 'none', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', textAlign: 'left', cursor: 'pointer', borderRadius: '8px' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}><FaSignOutAlt /></span>
                    <span className="nav-text" style={{ fontSize: '1rem', fontWeight: 500 }}>Logout</span>
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FOOTER NAVIGASI UTAMA (className disamakan: mobile-footer-nav) */}
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
          onClick={() => setActiveMobileMenu(activeMobileMenu === 'Setting' ? null : 'Setting')}
          className={activeMobileMenu === 'Setting' ? 'active' : ''}
        >
          {activeMobileMenu === 'Setting' ? <HiCog6Tooth /> : <HiOutlineCog6Tooth />}
          <span>Setting</span>
        </button>
      </footer>

      {/* -------------------------------------------------------- */}
      {/* MODALS (Global) */}
      {/* -------------------------------------------------------- */}
      <AnimatePresence>
        {showViewProofModal && ticketToShowProof && (
          <ViewProofModal
            key="viewProofModal"
            ticket={ticketToShowProof}
            onClose={() => setShowViewProofModal(false)}
            onDelete={handleDeleteClick}
          />
        )}
        {showProfileModal && (
          <ProfileModal
            key="profileModal"
            user={user}
            onClose={() => setShowProfileModal(false)}
            onSaved={handleProfileSaved}
          />
        )}
        {showRejectionInfoModal && ticketToShowReason && (
          <RejectionInfoModal
            key="rejectionModal"
            ticket={ticketToShowReason}
            onClose={() => setShowRejectionInfoModal(false)}
            onDelete={handleDeleteClick}
          />
        )}
        {showConfirmModal && ticketToDelete && (
          <ConfirmationModalUser
            key="confirmModal"
            message={`Yakin ingin menghapus tiket "${ticketToDelete.title}"?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
        {selectedTicketForDetail && (
          <TicketDetailModalUser
            key="detailModal"
            ticket={selectedTicketForDetail}
            onClose={handleCloseDetailModal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}