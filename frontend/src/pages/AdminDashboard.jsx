// src/pages/AdminDashboard.jsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';
import { AnimatePresence } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import api from '../services/api';

// Components
import Toast from '../components/Toast';
import WelcomeHome from '../components/WelcomeHome';
import JobList from '../components/JobList';
import Pagination from '../components/Pagination';
import UserManagement from '../components/UserManagement';
import NotificationForm from '../components/NotificationForm';
import NotificationTemplateManagement from '../components/NotificationTemplateManagement';
import LineChartComponent from '../components/LineChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import BarChartComponent from '../components/BarChartComponent';
import MapComponent from '../components/MapComponent';
import CalendarComponent from '../components/CalendarComponent';
import ProofModal from '../components/ProofModal';
import AssignAdminModal from '../components/AssignAdminModal';
import RejectTicketModal from '../components/RejectTicketModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserFormModal from '../components/UserFormModal';
import TicketReportAdminList from '../components/TicketReportAdminList';
import TicketReportDetail from '../components/TicketReportDetail';
import WorkshopManagement from '../components/WorkshopManagement';
import ToolManagement from '../components/ToolManagement';
import ReturnItemsModal from '../components/ReturnItemsModal'
import TicketDetailModal from '../components/TicketDetailModal';

// Assets
import yourLogok from '../Image/DTECH-Logo.png';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // State Management
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataPage, setDataPage] = useState(1);
  const [ticketData, setTicketData] = useState(null);
  const [userRole, setUserRole] = useState(user?.role || null);
  const [userName, setUserName] = useState(user?.name || '');
  const isAdmin = (userRole || '').toLowerCase() === 'admin';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Welcome');
  const [users, setUsers] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [locationsData, setLocationsData] = useState([]); // Note: This is not part of bootstrap yet
  const [adminPerformanceData, setAdminPerformanceData] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myTicketsData, setMyTicketsData] = useState(null);
  const [myTicketsPage, setMyTicketsPage] = useState(1);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [ticketForProof, setTicketForProof] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserConfirmModal, setShowUserConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [selectedAdminWithFilters, setSelectedAdminWithFilters] = useState(null);
  const [adminIdFilter, setAdminIdFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [ticketIdFilter, setTicketIdFilter] = useState(null);
  const [toolList, setToolList] = useState([]);
  const ticketsOnPage = useMemo(() => (ticketData ? ticketData.data : []), [ticketData]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [ticketToReturn, setTicketToReturn] = useState(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

  // Utilities
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const toggleSidebar = () => setIsSidebarOpen(v => !v);
  const toggleDarkMode = () => setDarkMode(v => !v);

  const handleLogout = useCallback(() => {
    logout?.();
  }, [logout]);

  const handleSelectionChange = useCallback((ids) => setSelectedTicketIds(ids), []);

  // =================================================================
  // Fetchers (VERSI FINAL YANG LEBIH RAMPING)
  // =================================================================

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard-data', {
        params: {
          page: dataPage,
          search: searchQuery,
          status: statusFilter,
          admin_id: adminIdFilter,
          date: dateFilter,
          id: ticketIdFilter,
        },
      });

      const data = response.data;

      setTicketData(data.tickets);
      setStats(data.stats);
      setAnalyticsData(data.analyticsData);
      setAdminPerformanceData(data.adminPerformance);
      setAllTickets(data.allTicketsForCalendar);
      setAdminList(data.admins);
      setLocationsData(data.locations);

    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, [
    dataPage, searchQuery, statusFilter, adminIdFilter, dateFilter, ticketIdFilter,
    handleLogout
  ]);

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      const response = await api.get('/users', { params: { page, search } });
      setUserData(response.data);
    } catch (e) {
      console.error('Gagal mengambil data pengguna:', e);
      if (e.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchMyTickets = useCallback(async (page = 1) => {
    try {
      const response = await api.get('/tickets/my-tickets', { params: { page } });
      setMyTicketsData(response.data);
    } catch (e) {
      console.error('Gagal mengambil "My Tickets":', e);
      if (e.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (e) {
      console.error('Gagal mengambil notifikasi:', e);
      if (e.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/all');
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (e) {
      console.error('Gagal mengambil daftar semua pengguna:', e);
      if (e.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  const fetchTools = useCallback(async () => {
    try {
      const response = await api.get('/tools');
      if (Array.isArray(response.data)) setToolList(response.data);
    } catch (e) {
      console.error('Gagal mengambil daftar alat:', e);
    }
  }, []);

  // =================================================================
  // Handlers
  // =================================================================

  const handleViewTicketDetail = (ticket) => {
    setSelectedTicketForDetail(ticket);
  };
  const handleCloseDetailModal = () => {
    setSelectedTicketForDetail(null);
  };
  const handleChartFilter = useCallback((filters) => {
    setDataPage(1);
    setSearchQuery('');
    setSearchInput('');
    setAdminIdFilter(filters.adminId || null);
    setDateFilter(filters.date || null);
    setTicketIdFilter(filters.ticketId || null);
    setStatusFilter(filters.status || null);
    setCurrentPage('Tickets');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setDataPage(1);
  };

  const handlePageChange = (page) => setDataPage(page);

  const handleHomeClick = () => {
    setCurrentPage('Tickets');
    setDataPage(1);
    setSearchQuery('');
    setSearchInput('');
    setStatusFilter(null);
    setAdminIdFilter(null);
    setDateFilter(null);
    setTicketIdFilter(null);
  };

  const handleAssignClick = (ticket) => {
    setTicketToAssign(ticket);
    setShowAssignModal(true);
  };
  const handleCloseAssignModal = () => {
    setTicketToAssign(null);
    setShowAssignModal(false);
  };
  const handleConfirmAssign = async (ticketId, adminId, tools) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { user_id: adminId, tools: tools });
      handleCloseAssignModal();
      fetchDashboardData();
      fetchMyTickets(myTicketsPage);
      fetchTools();
      showToast('Tiket berhasil ditugaskan.', 'success');
    } catch (e) {
      console.error('Gagal menugaskan tiket:', e);
      const errorMsg = e.response?.data?.errors?.tools || 'Gagal menugaskan tiket.';
      showToast(errorMsg, 'error');
    }
  };

  const handleRejectClick = (ticket) => {
    setTicketToReject(ticket);
    setShowRejectModal(true);
  };
  const handleCloseRejectModal = () => {
    setTicketToReject(null);
    setShowRejectModal(false);
  };
  const handleConfirmReject = async (ticketId, reason) => {
    try {
      await api.patch(`/tickets/${ticketId}/reject`, { reason });
      handleCloseRejectModal();
      fetchDashboardData(); // DIUBAH
      fetchMyTickets(myTicketsPage);
      showToast('Tiket berhasil ditolak.', 'success');
    } catch (e) {
      console.error('Gagal menolak tiket:', e);
      showToast('Gagal menolak tiket.', 'error');
    }
  };

  const handleDeleteClick = (ticket) => {
    if (ticket && ticket.id) {
      setTicketToDelete(ticket);
      setShowConfirmModal(true);
    }
  };
  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      await api.delete(`/tickets/${ticketToDelete.id}`);
      fetchDashboardData(); // DIUBAH
      fetchMyTickets(myTicketsPage);
      showToast('Tiket berhasil dihapus.', 'success');
    } catch (e) {
      console.error('Gagal hapus tiket:', e);
      const message = e.response?.data?.error || 'Gagal menghapus tiket.';
      showToast(message, 'error');
    } finally {
      setShowConfirmModal(false);
      setTicketToDelete(null);
    }
  };
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTicketToDelete(null);
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
    setDataPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) {
      showToast('Pilih setidaknya satu tiket untuk dihapus.', 'info');
      return;
    }
    if (window.confirm(`Anda yakin ingin menghapus ${selectedTicketIds.length} tiket yang dipilih?`)) {
      try {
        await api.post('/tickets/bulk-delete', { ids: selectedTicketIds });
        showToast(`${selectedTicketIds.length} tiket berhasil dihapus.`, 'success');
        fetchDashboardData(); // DIUBAH
        setSelectedTicketIds([]);
      } catch (e) {
        console.error('Gagal menghapus tiket secara massal:', e);
        showToast('Terjadi kesalahan saat mencoba menghapus tiket.', 'error');
      }
    }
  };

  const handleProofClick = (ticket) => {
    setTicketForProof(ticket);
    setShowProofModal(true);
  };
  const handleCloseProofModal = () => {
    setTicketForProof(null);
    setShowProofModal(false);
  };
  const handleSaveProof = async (ticketId, formData) => {
    try {
      await api.post(`/tickets/${ticketId}/submit-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Bukti pengerjaan berhasil disimpan.', 'success');
      handleCloseProofModal();
      fetchDashboardData(); // DIUBAH
      fetchMyTickets(myTicketsPage);
    } catch (e) {
      console.error('Gagal menyimpan bukti:', e);
      const errorMessage = e.response?.data?.error || 'Gagal menyimpan bukti.';
      showToast(errorMessage, 'error');
    }
  };

  const updateTicketStatus = async (ticketIdentifier, newStatus) => {
    // Langkah 1: Cari tiket lengkap berdasarkan identifier (bisa berupa ID atau objek)
    const ticket = typeof ticketIdentifier === 'object'
      ? ticketIdentifier
      : ticketsOnPage.find(t => t.id === ticketIdentifier);

    // Langkah 2: Lakukan pengecekan jika tiket tidak ditemukan
    if (!ticket) {
      console.error("Tiket tidak ditemukan dengan identifier:", ticketIdentifier);
      showToast("Gagal memperbarui status: Tiket tidak ditemukan.", "error");
      return;
    }

    // Langkah 3: Sisa logika berjalan seperti semula menggunakan objek 'ticket' yang sudah ditemukan
    if (newStatus === 'Selesai' && ticket.tools && ticket.tools.length > 0) {
      setTicketToReturn(ticket);
      setShowReturnModal(true);
    } else {
      try {
        await api.patch(`/tickets/${ticket.id}/status`, { status: newStatus });
        showToast('Status tiket berhasil diupdate.', 'success');
        fetchDashboardData();
        fetchMyTickets(myTicketsPage);
      } catch (e) {
        console.error('Gagal update status:', e);
        showToast(e.response?.data?.error || 'Gagal mengupdate status tiket.', 'error');
      }
    }
  };

  const handleUserDeleteClick = (u) => {
    setUserToDelete(u);
    setShowUserConfirmModal(true);
  };
  const confirmUserDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      showToast(`User "${userToDelete.name}" berhasil dihapus.`, 'success');
      fetchUsers(1, ''); // Tetap, karena ini untuk halaman user management
    } catch (e) {
      console.error('Gagal menghapus pengguna:', e);
      showToast('Gagal menghapus pengguna.', 'error');
    } finally {
      setShowUserConfirmModal(false);
      setUserToDelete(null);
    }
  };
  const cancelUserDelete = () => {
    setShowUserConfirmModal(false);
    setUserToDelete(null);
  };
  const handleAddUserClick = () => {
    setUserToEdit(null);
    setShowUserFormModal(true);
  };
  const handleUserEditClick = (u) => {
    setUserToEdit(u);
    setShowUserFormModal(true);
  };
  const handleCloseUserForm = () => {
    setShowUserFormModal(false);
    setUserToEdit(null);
  };
  const handleSaveUser = async (formData) => {
    const isEditMode = Boolean(userToEdit);
    const url = isEditMode ? `/users/${userToEdit.id}` : '/users';
    try {
      const res = await api.post(url, formData);
      showToast(isEditMode ? `User "${res.data.name}" berhasil di-edit.` : 'User baru berhasil dibuat.', 'success');
      fetchUsers(1, ''); // Tetap
      handleCloseUserForm();
    } catch (e) {
      console.error('Gagal menyimpan pengguna:', e);
      const msgs = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join('\n') : 'Gagal menyimpan pengguna.';
      showToast(msgs, 'error');
    }
  };
  const handleUserPageChange = (page) => setUserPage(page);
  const handleUserSearch = (query) => {
    setUserPage(1);
    setUserSearchQuery(query);
  };

  const handleConfirmReturn = async (ticketId, items) => {
    try {
      await api.post(`/tickets/${ticketId}/process-return`, { items });
      showToast('Tiket selesai dan barang telah diproses.', 'success');
      setShowReturnModal(false);
      setTicketToReturn(null);
      fetchDashboardData();
      fetchMyTickets(myTicketsPage);
      fetchTools(); // PENTING: Refresh stok alat di UI
    } catch (e) {
      console.error('Gagal memproses pengembalian:', e);
      showToast(e.response?.data?.message || 'Gagal memproses pengembalian.', 'error');
    }
  };


  // =================================================================
  // Effects (Logika Utama)
  // =================================================================
  useEffect(() => {
    setUserRole(user?.role || null);
    setUserName(user?.name || '');
  }, [user]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Hanya panggil data dashboard jika di halaman yang tepat
    if (isAdmin && (currentPage === 'Welcome' || currentPage === 'Tickets')) {
      fetchDashboardData();
      fetchTools();

      // Logika auto-refresh juga pindah ke sini
      const canRefresh = !searchQuery && !statusFilter && !adminIdFilter && !dateFilter && !ticketIdFilter;
      if (canRefresh) {
        const intervalId = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(intervalId); // Cleanup interval
      }
    }
  }, [
    isAdmin,
    currentPage,
    fetchDashboardData,
    fetchTools,
    searchQuery,
    statusFilter,
    adminIdFilter,
    dateFilter,
    ticketIdFilter
  ]);

  useEffect(() => {
    if (isAdmin && currentPage === 'MyTickets') {
      fetchMyTickets(myTicketsPage);
      fetchTools();
    }
  }, [isAdmin, currentPage, myTicketsPage, fetchMyTickets]);

  useEffect(() => {
    if (currentPage === 'userManagement') {
      fetchUsers(userPage, userSearchQuery);
    }
  }, [currentPage, userPage, userSearchQuery, fetchUsers]);

  // =================================================================
  // Render Logic
  // =================================================================
  if (isAdmin) {
    return (
      <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="toast-container">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src={yourLogok} alt="Logo" className="sidebar-logo" />
          </div>
          <nav className="sidebar-nav">
            <ul>
              {/* --- Grup Utama --- */}
              <li className="sidebar-nav-item">
                <button
                  onClick={() => setCurrentPage('Welcome')}
                  className={`sidebar-button ${currentPage === 'Welcome' ? 'active' : ''}`}>
                  <i className="fas fa-home"></i><span className="nav-text">Home</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button onClick={handleHomeClick} className={`sidebar-button ${currentPage === 'Tickets' ? 'active' : ''}`}>
                  <i className="fas fa-ticket-alt"></i><span className="nav-text">Daftar Tiket</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('MyTickets')} className={`sidebar-button ${currentPage === 'MyTickets' ? 'active' : ''}`}>
                  <i className="fas fa-user-tag"></i><span className="nav-text">Tiket Saya</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('userManagement')} className={`sidebar-button ${currentPage === 'userManagement' ? 'active' : ''}`}>
                  <i className="fas fa-user-plus"></i><span className="nav-text">Pengguna</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('Notifications')} className={`sidebar-button ${currentPage === 'Notifications' ? 'active' : ''}`}>
                  <i className="fas fa-bell"></i><span className="nav-text">Notifikasi</span>
                </button>
              </li>

              {/* --- Divider Laporan --- */}
              <li className="sidebar-divider">
                <span className="nav-text">Laporan</span>
              </li>

              {/* --- Grup Laporan --- */}
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('ticketReport')} className={`sidebar-button ${currentPage === 'ticketReport' ? 'active' : ''}`}>
                  <i className="fas fa-file-alt"></i><span className="nav-text">Laporan Tiket</span>
                </button>
              </li>

              {/* --- Divider Settings --- */}
              <li className="sidebar-divider">
                <span className="nav-text">Settings</span>
              </li>

              {/* --- Grup Settings --- */}
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('notificationTemplates')} className={`sidebar-button ${currentPage === 'notificationTemplates' ? 'active' : ''}`}>
                  <i className="fas fa-paste"></i><span className="nav-text">Template Notif</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button
                  onClick={() => setCurrentPage('toolManagement')}
                  className={`sidebar-button ${currentPage === 'toolManagement' ? 'active' : ''}`}>
                  <i className="fas fa-tools"></i><span className="nav-text">Tools</span>
                </button>
              </li>
              <li className="sidebar-nav-item">
                <button onClick={() => setCurrentPage('workshopManagement')} className={`sidebar-button ${currentPage === 'workshopManagement' ? 'active' : ''}`}>
                  <i className="fas fa-cogs"></i><span className="nav-text">Workshop</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {isSidebarOpen && <div className="content-overlay" onClick={toggleSidebar}></div>}

        <main className="main-content">
          <header className="main-header">
            <div className="header-left-group">
              <button className="hamburger-menu-button" onClick={toggleSidebar}>
                <span /><span /><span />
              </button>
              <h1 className="dashboard-header-title">Admin Dashboard</h1>
            </div>
            <div className="admin-user-info-container">
              <div className="user-info">
                <button onClick={toggleDarkMode} className="theme-toggle-button" aria-label="Toggle Dark Mode">
                  {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                </button>
                <div className="user-profile-clickable" onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
                  <div className="user-avatar cursor-pointer w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <FaUser className="text-gray-500 text-xl" />
                  </div>
                  <span><strong>{userName || "User"}</strong></span>
                </div>
              </div>
              {isAdminDropdownOpen && (
                <>
                  <div className="dropdown-overlay" onClick={() => setIsAdminDropdownOpen(false)}></div>
                  <div className="admin-dropdown">
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          <div className="content-area">
            {currentPage === 'Welcome' && (
              <>
                <WelcomeHome
                  userRole={userRole}
                  userName={userName}
                  onExploreClick={() => setCurrentPage('Tickets')}
                />
                <div className="info-cards-grid">
                  <div className={`info-card red-card ${statusFilter === 'Belum Selesai' ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick();
                      handleStatusFilterClick('Belum Selesai');
                    }}>
                    <div className="card-header">
                      <p className="card-label">Tiket Belum Selesai</p>
                      <div className="card-icon red-icon"><i className="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.pending_tickets : '...'}</h3>
                  </div>
                  <div className={`info-card green-card ${statusFilter === 'Selesai' ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick();
                      handleStatusFilterClick('Selesai');
                    }}>
                    <div className="card-header">
                      <p className="card-label">Tiket Selesai</p>
                      <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.completed_tickets : '...'}</h3>
                  </div>
                  <div className={`info-card yellow-card ${!statusFilter ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick();
                      handleStatusFilterClick(null);
                    }}>
                    <div className="card-header">
                      <p className="card-label">Total Tiket</p>
                      <div className="card-icon yellow-icon"><i className="fas fa-tasks"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_tickets : '...'}</h3>
                  </div>
                  <div className="info-card blue-card" onClick={() => setCurrentPage('userManagement')}>
                    <div className="card-header">
                      <p className="card-label">Total Pengguna</p>
                      <div className="card-icon blue-icon"><i className="fas fa-users"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_users : '...'}</h3>
                  </div>
                </div>

                <div className="dashboard-container2">
                  <div className="dashboard-row">
                    <div className="dashboard-card line-chart-card">
                      <h4>Tren Tiket (30 Hari Terakhir)</h4>
                      <LineChartComponent data={analyticsData}
                        onPointClick={(status, date) => handleChartFilter({ status, date })}
                        onLegendClick={(status) => handleChartFilter({ status })} />
                    </div>
                    <div className="dashboard-card pie-chart-card">
                      <h4>Status Tiket</h4>
                      <PieChartComponent
                        stats={stats}
                        handleStatusFilterClick={(status) => handleChartFilter({ status })}
                        statusFilter={statusFilter} />
                    </div>
                  </div>
                  <div className="dashboard-row">
                    <div className="dashboard-card bar-chart-card">
                      <h4>Performa Admin</h4>
                      <BarChartComponent data={adminPerformanceData}
                        onBarClick={(admin) => handleChartFilter({ status: admin.status, adminId: admin.id })} />
                    </div>
                    <div className="dashboard-card map-chart-card">
                      <h4>Geografi Traffic</h4>
                      <MapComponent data={locationsData} />
                    </div>
                  </div>
                  <div className="dashboard-column2">
                    <div className="dashboard-card calendar-card">
                      <h4>Kalender Tiket</h4>
                      <CalendarComponent tickets={allTickets}
                        onTicketClick={(ticketId) => handleChartFilter({ ticketId })} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentPage === 'Tickets' && (
              <>
                <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Cari berdasarkan nama pekerja..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ flexGrow: 1, padding: '8px' }} />
                  <button type="submit" style={{ padding: '8px 16px' }}>Cari</button>
                </form>
                {selectedTicketIds.length > 0 && (
                  <div className="bulk-action-bar" style={{ margin: '20px 0' }}>
                    <button onClick={handleBulkDelete} className="btn-delete">Hapus {selectedTicketIds.length} Tiket yang Dipilih</button>
                  </div>
                )}
                <JobList
                  tickets={ticketsOnPage}
                  updateTicketStatus={updateTicketStatus}
                  deleteTicket={handleDeleteClick}
                  userRole={userRole}
                  onSelectionChange={handleSelectionChange}
                  onAssignClick={handleAssignClick}
                  onRejectClick={handleRejectClick}
                  onProofClick={handleProofClick}
                  showToast={showToast}
                  onTicketClick={handleViewTicketDetail}
                />
                <Pagination currentPage={dataPage} lastPage={ticketData ? ticketData.last_page : 1} onPageChange={handlePageChange} />
              </>
            )}

            {currentPage === 'MyTickets' && (
              <>
                <h2 className="page-title">Tiket yang Saya Kerjakan</h2>
                {myTicketsData && myTicketsData.data && myTicketsData.data.length > 0 ? (
                  <>
                    <JobList
                      tickets={myTicketsData.data}
                      updateTicketStatus={updateTicketStatus}
                      deleteTicket={handleDeleteClick}
                      userRole={userRole}
                      onSelectionChange={handleSelectionChange}
                      onAssignClick={handleAssignClick}
                      onRejectClick={handleRejectClick}
                      onProofClick={handleProofClick}
                      showToast={showToast}
                      onTicketClick={handleViewTicketDetail}
                    />
                    <Pagination currentPage={myTicketsPage} lastPage={myTicketsData.last_page} onPageChange={(page) => setMyTicketsPage(page)} />
                  </>
                ) : (
                  <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Anda belum bertugas untuk mengerjakan tiket apa pun.</p>
                  </div>
                )}
              </>
            )}

            {currentPage === 'userManagement' && (
              <UserManagement userData={userData} onDeleteClick={handleUserDeleteClick} onAddClick={handleAddUserClick} onEditClick={handleUserEditClick} onPageChange={handleUserPageChange} onSearch={handleUserSearch} />
            )}

            {currentPage === 'workshopManagement' && (
              <WorkshopManagement showToast={showToast} />
            )}

            {currentPage === 'toolManagement' && (
              <ToolManagement showToast={showToast} />
            )}

            {currentPage === 'ticketReport' && (
              <TicketReportAdminList
                onTicketClick={handleViewTicketDetail}
              />
            )}

            {currentPage === 'Notifications' && (
              <NotificationForm showToast={showToast} />
            )}

            {currentPage === 'notificationTemplates' && (
              <NotificationTemplateManagement showToast={showToast} />
            )}
          </div>
        </main>

        {showProofModal && ticketForProof && (
          <ProofModal ticket={ticketForProof} onSave={handleSaveProof} onClose={handleCloseProofModal} />
        )}
        {showAssignModal && ticketToAssign && (
          <AssignAdminModal ticket={ticketToAssign} admins={adminList} tools={toolList} onAssign={handleConfirmAssign} onClose={handleCloseAssignModal} showToast={showToast} />
        )}
        {showRejectModal && ticketToReject && (
          <RejectTicketModal ticket={ticketToReject} onReject={handleConfirmReject} onClose={handleCloseRejectModal} showToast={showToast} />
        )}
        {showConfirmModal && ticketToDelete && (
          <ConfirmationModal message={`Hapus pekerjaan "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />
        )}
        {showUserConfirmModal && userToDelete && (
          <ConfirmationModal message={`Anda yakin ingin menghapus pengguna "${userToDelete.name}"?`} onConfirm={confirmUserDelete} onCancel={cancelUserDelete} />
        )}
        {showUserFormModal && (
          <UserFormModal userToEdit={userToEdit} onClose={handleCloseUserForm} onSave={handleSaveUser} />
        )}
        {showReturnModal && ticketToReturn && (
          <ReturnItemsModal
            ticket={ticketToReturn}
            onSave={handleConfirmReturn}
            onClose={() => setShowReturnModal(false)}
            showToast={showToast}
          />
        )}
        {selectedTicketForDetail && (
          <TicketDetailModal
            ticket={selectedTicketForDetail}
            onClose={handleCloseDetailModal}
          />
        )}
      </div>
    );
  }
  return null;
}