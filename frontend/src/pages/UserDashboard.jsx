import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Import semua komponen yang dibutuhkan
import JobFormUser from '../components/JobFormUser';
import UserHeader from '../components/UserHeader';
import ConfirmationModalUser from '../components/ConfirmationModalUser';
import RejectionInfoModal from '../components/RejectionInfoModal';
import ViewProofModal from '../components/ViewProofModal';
import PaginationUser from '../components/PaginationUser';
import ProfileModal from '../components/ProfileModal';
import TicketDetailModalUser from '../components/TicketDetailModalUser';

// Import aset gambar
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


export default function UserDashboard() {
  // -----------------------------------------------------------------
  // #1. STATE MANAGEMENT
  // -----------------------------------------------------------------
  const { user, logout, setUser } = useAuth();
  const [userViewTab, setUserViewTab] = useState('request');
  const [createdTicketsData, setCreatedTicketsData] = useState(null);
  const [createdTicketsPage, setCreatedTicketsPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToShowReason, setTicketToShowReason] = useState(null);
  const [showRejectionInfoModal, setShowRejectionInfoModal] = useState(false);
  const [ticketToShowProof, setTicketToShowProof] = useState(null);
  const [showViewProofModal, setShowViewProofModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
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
  const fetchCreatedTickets = useCallback(async (page = 1) => {
    try {
      const response = await api.get('/tickets/created-by-me', { params: { page } });
      setCreatedTicketsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil tiket yang dibuat:", error);
      if (error.response?.status === 401) handleLogout();
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
      fetchCreatedTickets(createdTicketsPage);
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
  const handleOpenProfileModal = () => setShowProfileModal(true);
  const handleProfileSaved = (updatedUser) => {
    setUser(updatedUser);
    console.log("Profil diperbarui dan context telah diupdate.");
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
      fetchCreatedTickets(createdTicketsPage);
    }
  }, [userViewTab, createdTicketsPage, fetchCreatedTickets]);

  // -----------------------------------------------------------------
  // #4. RENDER LOGIC
  // -----------------------------------------------------------------
  return (
    <motion.div
      className="dashboard-container no-sidebar"
      style={{ backgroundImage: `url(${bgImage})` }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <main className="main-content">
        <motion.header
          className="main-header-user"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <div className="user-view-tabs">
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
          <div className="main-header-controls-user">
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
        </motion.header>

        <div className="content-area">
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
                    <motion.div
                      className="job-list"
                      style={{ marginTop: '20px' }}
                      variants={itemVariants}
                    >
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
                                    <motion.button variants={buttonHoverTap} whileHover="hover" whileTap="tap" onClick={(e) => { e.stopPropagation(); setTicketToShowProof(ticket); setShowViewProofModal(true); }} className="btn-action btn-start">Lihat Bukti</motion.button>
                                  ) : ticket.status === 'Ditolak' ? (
                                    <motion.button variants={buttonHoverTap} whileHover="hover" whileTap="tap" onClick={(e) => { e.stopPropagation(); setTicketToShowReason(ticket); setShowRejectionInfoModal(true); }} className="btn-action btn-start">Alasan</motion.button>
                                  ) : (
                                    <motion.button variants={buttonHoverTap} whileHover="hover" whileTap="tap" onClick={(e) => { e.stopPropagation(); handleDeleteClick(ticket); }} className="btn-action btn-delete-small">Hapus</motion.button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6">Anda belum membuat tiket.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <PaginationUser
                        currentPage={createdTicketsPage}
                        lastPage={createdTicketsData ? createdTicketsData.last_page : 1}
                        onPageChange={setCreatedTicketsPage}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
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