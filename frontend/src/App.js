// =================================================================
//  IMPOR LIBRARY & KOMPONЕН
// =================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
// import JobForm from './components/JobForm';
import JobFormUser from './components/JobFormUser';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import UserManagement from './components/UserManagement';
import NotificationForm from './components/NotificationForm';
import NotificationBell from './components/NotificationBell';
import UserFormModal from './components/UserFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import ConfirmationModalUser from './components/ConfirmationModalUser';
import AssignAdminModal from './components/AssignAdminModal';
import RejectTicketModal from './components/RejectTicketModal';
import RejectionInfoModal from './components/RejectionInfoModal';
import ProofModal from './components/ProofModal';
import ViewProofModal from './components/ViewProofModal';
import Pagination from './components/Pagination';
import PaginationUser from './components/PaginationUser';
import { getToken, isLoggedIn, logout, getUser } from './auth';
import './App.css';
import yourLogo from './Image/Logo.png';
import loginBackground from './Image/LoginBg.jpg';
import bgImage from './Image/homeBg.jpg';
import yourLogok from './Image/DTECH-Logo.png';
import WelcomeHome from './components/WelcomeHome';
import WelcomeHomeUser from './components/WelcomeHomeUser';
import AboutUsPage from './components/AboutUsPage';
import LineChartComponent from './components/LineChartComponent';
import PieChartComponent from './components/PieChartComponent';
import BarChartComponent from './components/BarChartComponent';
import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent';




// =================================================================
//  KONFIGURASI GLOBAL
// =================================================================
const API_URL = 'http://127.0.0.1:8000/api';

// =================================================================
//  KOMPONEN UTAMA: App
// =================================================================
function App() {
  // -----------------------------------------------------------------
  // #1. STATE MANAGEMENT (Manajemen Data Aplikasi)
  // -----------------------------------------------------------------
  // --- State untuk Data dari API ---
  const [ticketData, setTicketData] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [createdTicketsData, setCreatedTicketsData] = useState(null);
  const [myTicketsData, setMyTicketsData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- State Autentikasi ---
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null); // "admin" | "user"
  const [userName, setUserName] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // --- State User Management ---
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserConfirmModal, setShowUserConfirmModal] = useState(false);
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // --- State Navigasi ---
  const [appPage, setAppPage] = useState("landing"); // "landing" | "login" | "register" | "dashboard"
  const [publicPage, setPublicPage] = useState("home"); // khusus landing
  const [currentPage, setCurrentPage] = useState("Welcome"); // admin dashboard
  const [userViewTab, setUserViewTab] = useState("request"); // user dashboard

  // --- State Paginasi ---
  const [dataPage, setDataPage] = useState(1);
  const [createdTicketsPage, setCreatedTicketsPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [myTicketsPage, setMyTicketsPage] = useState(1);

  // --- State Pencarian ---
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- State UI ---
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- State Ticket Interactions ---
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [showRejectionInfoModal, setShowRejectionInfoModal] = useState(false);
  const [ticketToShowReason, setTicketToShowReason] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [ticketForProof, setTicketForProof] = useState(null);
  const [showViewProofModal, setShowViewProofModal] = useState(false);
  const [ticketToShowProof, setTicketToShowProof] = useState(null);

  // --- State Analytics ---
  const [analyticsData, setAnalyticsData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [adminPerformanceData, setAdminPerformanceData] = useState([]);

  // === State ===
  const [userAvatar, setUserAvatar] = useState(null);

  // modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // state sementara (untuk edit)
  const [tempName, setTempName] = useState("");
  const [tempAvatar, setTempAvatar] = useState(null);

  // state tambahan
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // === Functions ===
  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  const openEditProfile = () => {
    // setTempName(userName); // kalau nanti mau pakai nama
    setTempAvatar(userAvatar);
    setIsEditProfileOpen(true);
    setIsEditingAvatar(false); // selalu mulai dari preview mode
  };

  const closeEditProfile = () => {
    setTempAvatar(userAvatar); // reset kembali ke avatar asli
    setIsEditingAvatar(false); // kembali ke preview mode
    setIsEditProfileOpen(false);
  };

  const saveProfile = () => {
    setUserAvatar(tempAvatar); // update avatar asli sesuai temp

    localStorage.setItem("userName", tempName);
    localStorage.setItem("userAvatar", tempAvatar);

    setIsEditProfileOpen(false);
    setIsEditingAvatar(false); // pastikan reset ke preview mode
  };

  // -----------------------------------------------------------------
  // #1.A. VARIABEL TURUNAN (Derived State)
  // -----------------------------------------------------------------
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';
  const ticketsOnPage = useMemo(() => (ticketData ? ticketData.data : []), [ticketData]);
  const createdTicketsOnPage = useMemo(() => (createdTicketsData ? createdTicketsData.data : []), [createdTicketsData]);
  const handleSelectionChange = useCallback((selectedIds) => {
    setSelectedTicketIds(selectedIds);
  }, []);

  // -----------------------------------------------------------------
  // #3. DATA FETCHING FUNCTIONS (Fungsi Pengambilan Data)
  // -----------------------------------------------------------------

  const fetchData = useCallback(async (page = 1, search = '', status = null) => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      let ticketsUrl = `${API_URL}/tickets?page=${page}`;
      if (search) ticketsUrl += `&search=${search}`;
      if (status) ticketsUrl += `&status=${status}`;

      const [ticketsRes, statsRes] = await Promise.all([
        axios.get(ticketsUrl, config),
        axios.get(`${API_URL}/tickets/stats`, config)
      ]);

      setTicketData(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data utama:", error);
      if (error.response && error.response.status === 401) handleLogout();
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/admins`, config);
      setAdminList(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar admin:", error);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/users/all`, config);
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar semua pengguna:", error);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      let url = `${API_URL}/users?page=${page}`;
      if (search) url += `&search=${search}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      setUserData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    }
  }, []);

  const fetchCreatedTickets = useCallback(async (page = 1) => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/tickets/created-by-me?page=${page}`, config);
      setCreatedTicketsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil tiket yang dibuat:", error);
    }
  }, []);

  const fetchMyTickets = useCallback(async (page = 1) => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/tickets/my-tickets?page=${page}`, config);
      setMyTicketsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil 'My Tickets':", error);
      // Tambahkan penanganan jika token expired
      if (error.response && error.response.status === 401) handleLogout();
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Hanya fetch jika user sudah login
    if (!isLoggedIn()) return;

    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications(response.data);

      // Hitung notifikasi yang belum dibaca (sesuai logika Anda sebelumnya)
      const lastCleared = localStorage.getItem('notifications_last_cleared');
      const newNotifications = lastCleared
        ? response.data.filter(n => new Date(n.created_at) > new Date(lastCleared))
        : response.data;
      setUnreadCount(newNotifications.length);

    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/tickets/analytics`, config);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data analitik:", error);
    }
  }, []);

  const fetchLocationsData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/locations`, config);
      setLocationsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data lokasi:", error);
    }
  }, []);

  const fetchAdminPerformance = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/tickets/admin-performance`, config);
      setAdminPerformanceData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data performa admin:", error);
    }
  }, [getToken]);

  // -----------------------------------------------------------------
  // #4. HANDLER FUNCTIONS (Fungsi untuk Menangani Aksi Pengguna)
  // -----------------------------------------------------------------
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });

      if (isAdmin) {
        setSearchInput('');
        setSearchQuery('');
        setStatusFilter(null);
        setDataPage(1);
        setCurrentPage('Tickets');
      } else {
        setCreatedTicketsPage(1);
        fetchCreatedTickets(1);
        setUserViewTab('history');
      }

      fetchData(1, '', null);

    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData(dataPage, searchQuery);
      if (!isAdmin) {
        fetchCreatedTickets(createdTicketsPage);
      }
    } catch (error) { console.error("Gagal update status:", error); }
  };

  const handleNotificationToggle = () => {
    setUnreadCount(0);
    localStorage.setItem('notifications_last_cleared', new Date().toISOString());
    axios.post(`${API_URL}/notifications/mark-all-read`, {}, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Panggil API untuk menghapus notifikasi
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // Setelah berhasil, panggil ulang fetchNotifications untuk memperbarui daftar
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
      alert("Gagal menghapus notifikasi.");
    }
  };

  const handleHomeClick = () => {
    setCurrentPage('Tickets');
    setDataPage(1);
    setSearchQuery('');
    setSearchInput('');
    setStatusFilter(null);
    fetchData(1, '', null); // Panggil fetchData secara eksplisit
  };

  const handleAssignClick = (ticket) => {
    setTicketToAssign(ticket);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setTicketToAssign(null);
    setShowAssignModal(false);
  };

  const handleConfirmAssign = async (ticketId, adminId) => {
    try {
      await axios.patch(`${API_URL}/tickets/${ticketId}/assign`, { user_id: adminId }, { headers: { Authorization: `Bearer ${getToken()}` } });
      handleCloseAssignModal();
      fetchData(dataPage, searchQuery); // Refresh data tiket
    } catch (error) {
      console.error("Gagal menugaskan tiket:", error);
      alert("Gagal menugaskan tiket.");
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
      await axios.patch(`${API_URL}/tickets/${ticketId}/reject`, { reason }, { headers: { Authorization: `Bearer ${getToken()}` } });
      handleCloseRejectModal();
      fetchData(dataPage, searchQuery);
    } catch (error) {
      console.error("Gagal menolak tiket:", error);
      alert("Gagal menolak tiket.");
    }
  };

  const handleShowReasonClick = (ticket) => {
    setTicketToShowReason(ticket);
    setShowRejectionInfoModal(true);
  };

  const handleCloseReasonModal = () => {
    setTicketToShowReason(null);
    setShowRejectionInfoModal(false);
  };

  const handleDeleteFromReasonModal = (ticket) => {
    handleCloseReasonModal();
    handleDeleteClick(ticket);
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
    setDataPage(1);
  };

  const handleDeleteClick = (ticket) => {
    if (ticket && ticket.id) {
      setTicketToDelete(ticket);
      setShowConfirmModal(true);
    }
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        fetchData(dataPage, searchQuery);
        fetchCreatedTickets(createdTicketsPage);
      } catch (error) {
        console.error("Gagal hapus tiket:", error);
        if (error.response && error.response.status === 403) {
          alert(error.response.data.error);
        }
      }
      finally {
        setShowConfirmModal(false);
        setTicketToDelete(null);
      }
    }
  };

  const cancelDelete = () => { setShowConfirmModal(false); setTicketToDelete(null); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setDataPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) {
      alert("Pilih setidaknya satu tiket untuk dihapus.");
      return;
    }
    if (window.confirm(`Anda yakin ingin menghapus ${selectedTicketIds.length} tiket yang dipilih?`)) {
      try {
        await axios.post(`${API_URL}/tickets/bulk-delete`,
          { ids: selectedTicketIds },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        fetchData(1, '');
      } catch (error) {
        console.error("Gagal menghapus tiket secara massal:", error);
        alert("Terjadi kesalahan saat mencoba menghapus tiket.");
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
      await axios.post(`${API_URL}/tickets/${ticketId}/submit-proof`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data', // Penting untuk file upload
        },
      });
      alert('Bukti pengerjaan berhasil disimpan.');
      handleCloseProofModal();
      fetchData(dataPage, searchQuery); // Refresh data
    } catch (error) {
      console.error("Gagal menyimpan bukti:", error);
      const errorMessage = error.response?.data?.error || "Gagal menyimpan bukti. Pastikan deskripsi diisi.";
      alert(errorMessage);
    }
  };

  const handleViewProofClick = (ticket) => {
    setTicketToShowProof(ticket);
    setShowViewProofModal(true);
  };

  const handleCloseViewProofModal = () => {
    setTicketToShowProof(null);
    setShowViewProofModal(false);
  };

  const handleDeleteFromViewProofModal = (ticket) => {
    handleCloseViewProofModal();
    handleDeleteClick(ticket);
  };

  const handleUserDeleteClick = (user) => {
    if (user.id === loggedInUserId) {
      alert("Anda tidak bisa menghapus akun Anda sendiri.");
      return;
    }
    setUserToDelete(user);
    setShowUserConfirmModal(true);
  };

  const confirmUserDelete = async () => {
    if (userToDelete) {
      try {
        await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        alert(`User "${userToDelete.name}" berhasil dihapus.`);
        fetchUsers(1, '');
      } catch (error) {
        console.error("Gagal menghapus pengguna:", error);
        alert("Gagal menghapus pengguna.");
      } finally {
        setShowUserConfirmModal(false);
        setUserToDelete(null);
      }
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

  const handleUserEditClick = (user) => {
    setUserToEdit(user);
    setShowUserFormModal(true);
  };

  const handleCloseUserForm = () => {
    setShowUserFormModal(false);
    setUserToEdit(null);
  };

  const handleSaveUser = async (formData) => {
    const isEditMode = Boolean(userToEdit);
    const url = isEditMode ? `${API_URL}/users/${userToEdit.id}` : `${API_URL}/users`;
    const method = 'post';
    try {
      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (isEditMode) {
        alert(`User "${response.data.name}" berhasil di-edit.`);
      } else {
        alert("User baru berhasil dibuat.");
      }
      fetchUsers(1, '');
      handleCloseUserForm();
    } catch (error) {
      console.error("Gagal menyimpan pengguna:", error);
      if (error.response && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        alert(errorMessages);
      } else {
        alert("Gagal menyimpan pengguna.");
      }
    }
  };

  const handlePageChange = (page) => setDataPage(page);
  const handleUserPageChange = (page) => setUserPage(page);
  const handleUserSearch = (query) => {
    setUserPage(1);
    setUserSearchQuery(query);
  };
  const handleCreatedTicketsPageChange = (page) => setCreatedTicketsPage(page);

  const handleLogout = () => {
    logout();
    setIsLogin(false);
    setCurrentPage('Tickets');
    setDataPage(1);
    setTicketData(null);
    setStats(null);
    setCreatedTicketsData(null);
    setSearchQuery('');
    setSearchInput('');
  };
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // -----------------------------------------------------------------
  // #2. SIDE EFFECTS (useEffect Hooks)
  // -----------------------------------------------------------------

  useEffect(() => {
    if (isLogin) {
      const currentUser = getUser();
      fetchNotifications();
      if (currentUser) {
        setUserRole(currentUser.role);
        setUserName(currentUser.name);
        setLoggedInUserId(currentUser.id);
      }
      if (isAdmin) {
        fetchData(dataPage, searchQuery, statusFilter);
        fetchAdmins();
        fetchAnalyticsData();
        fetchLocationsData();
        fetchAdminPerformance();

        if (currentPage === 'Tickets') {
          const intervalId = setInterval(() => {
            console.log('Memuat ulang daftar tiket...'); // Pesan untuk debugging
            fetchData(dataPage, searchQuery, statusFilter);
          }, 60000); // 60000 milidetik = 1 menit

          // Fungsi cleanup: Hentikan interval jika komponen di-unmount 
          // atau jika user pindah halaman/mengubah filter.
          return () => {
            clearInterval(intervalId);
          };
        }
      }
    }
  }, [isLogin, dataPage, searchQuery, statusFilter, fetchData, isAdmin, fetchAdmins, fetchNotifications]);

  useEffect(() => {
    const needsUserListForForm = (isAdmin && currentPage === 'Tickets') || (!isAdmin && userViewTab === 'request');
    if (isLogin && needsUserListForForm) {
      fetchAllUsers();
    }
  }, [isLogin, isAdmin, currentPage, userViewTab, fetchAllUsers]);

  useEffect(() => {
    if (isLogin && currentPage === 'userManagement') {
      fetchUsers(userPage, userSearchQuery);
    }
  }, [isLogin, currentPage, userPage, userSearchQuery, fetchUsers]);

  useEffect(() => {
    if (isLogin && !isAdmin && userViewTab === 'history') {
      fetchCreatedTickets(createdTicketsPage);
    }
  }, [isLogin, isAdmin, userViewTab, createdTicketsPage, fetchCreatedTickets]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--auth-background-image-light', `url(${loginBackground})`);
  }, []);

  useEffect(() => {
    if (isLogin && isAdmin && currentPage === 'MyTickets') {
      fetchMyTickets(myTicketsPage);
    }
  }, [isLogin, isAdmin, currentPage, myTicketsPage, fetchMyTickets]);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedAvatar = localStorage.getItem("userAvatar");

    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);


  // -----------------------------------------------------------------
  // #5. RENDER LOGIC (Logika untuk Menampilkan Komponen)
  // -----------------------------------------------------------------
  if (!isLogin) {
    if (appPage === "landing") {
      return (
        <div
          className="dashboard-container no-sidebar landing-page"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        >
          <main className="main-content">
            {/* Header */}
            <header className="main-header-user landing-header">
              <div className="header-left-group">
                <img src={yourLogok} alt="Logo" className="header-logo" />
              </div>

              <nav className="header-nav">
                <button
                  className={publicPage === "home" ? "active" : ""}
                  onClick={() => setPublicPage("home")}
                >
                  Home
                </button>
                <button
                  className={publicPage === "aboutus" ? "active" : ""}
                  onClick={() => setPublicPage("aboutus")}
                >
                  About Us
                </button>
              </nav>

              <div className="header-right-group">
                <button onClick={() => setAppPage("login")} className="login-btn2">
                  <i className="fas fa-user-circle"></i>
                  <span>Login</span>
                </button>
              </div>

            </header>

            {/* Konten Dinamis */}
            <div className="public-content">
              {publicPage === "home" && <WelcomeHomeUser />}
              {publicPage === "aboutus" && <AboutUsPage adminList={adminList} />}
            </div>
          </main>
        </div>
      );
    }

    // ✅ Login & Register
    return (
      <div className="auth-page-container">
        {showRegister ? (
          <Register
            onRegister={() => setIsLogin(true)}
            onShowLogin={() => setShowRegister(false)}
            onBackToLanding={() => setAppPage("landing")}  // 👈 tambahin ini
          />
        ) : (
          <Login
            onLogin={() => setIsLogin(true)}
            onShowRegister={() => setShowRegister(true)}
            onBackToLanding={() => setAppPage("landing")}  // 👈 tambahin ini
          />
        )}
      </div>
    );
  }


  // Tampilan untuk ADMIN
  if (isAdmin) {
    return (
      <div className={`dashboard-container ${isSidebarOpen ? '' : ' sidebar-closed'}`}>
        <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header">
            <img src={yourLogo} alt="Logo" className="sidebar-logo" />
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li className="sidebar-nav-item">
                <button
                  onClick={() => setCurrentPage('Welcome')}
                  className={`sidebar-button ${currentPage === 'Welcome' ? 'active' : ''}`}>
                  <i className="fas fa-hand-sparkles"></i><span>Home</span>
                </button>
              </li>
              <li className="sidebar-nav-item"><button onClick={handleHomeClick} className={`sidebar-button ${currentPage === 'Tickets' ? 'active' : ''}`}><i className="fas fa-home"></i><span>Daftar Tiket</span></button></li>
              <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('MyTickets')} className={`sidebar-button ${currentPage === 'MyTickets' ? 'active' : ''}`}><i className="fas fa-user-tag"></i><span>Tiket Saya</span></button></li>
              <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('userManagement')} className={`sidebar-button ${currentPage === 'userManagement' ? 'active' : ''}`}><i className="fas fa-user-plus"></i><span>Pengguna</span></button></li>
              <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('Notifications')} className={`sidebar-button ${currentPage === 'Notifications' ? 'active' : ''}`}><i className="fas fa-bell"></i><span>Notifikasi</span></button></li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            {/* === Sidebar User Info === */}
            <div className="user-info">
              <div
                className="user-avatar cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditProfile();
                }}
              >
                {userAvatar && userAvatar.trim() !== "" ? (
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                  />
                ) : (
                  <i className="fas fa-user text-gray-500 text-xl"></i>
                )}
              </div>

              <span>{userName || "User"}</span>

              <div
                className={`theme-switch ${darkMode ? "dark" : ""}`}
                onClick={toggleDarkMode}
              >
                <div className="theme-switch-ball">
                  {darkMode ? (
                    <i className="fas fa-moon moon-icon"></i>
                  ) : (
                    <i className="fas fa-sun sun-icon"></i>
                  )}
                </div>
              </div>
            </div>


            {isEditProfileOpen && (
              <div className="modal-overlayyy" onClick={closeEditProfile}>
                <div
                  className="modal-contenttt"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Judul Dinamis */}
                  <h2>{isEditingAvatar ? "Edit Profil" : "Profil"}</h2>

                  {/* === PREVIEW CONTAINER === */}
                  {!isEditingAvatar && (
                    <div className="preview-container">
                      <div className="preview-avatar">
                        {userAvatar ? (
                          <img src={userAvatar} alt="Preview Avatar" />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>

                      <div className="modal-actionsss">
                        <button
                          className="btn-confirm"
                          onClick={() => {
                            setTempAvatar(userAvatar); // copy avatar lama
                            setIsEditingAvatar(true);  // masuk ke edit mode
                          }}
                        >
                          Edit Avatar
                        </button>

                        <button className="btn-cancel" onClick={closeEditProfile}>
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}

                  {/* === EDIT CONTAINER === */}
                  {isEditingAvatar && (
                    <div className="edit-container">
                      <div className="preview-avatar">
                        {tempAvatar ? (
                          <img src={tempAvatar} alt="Preview Avatar" />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>

                      {/* Input Upload Avatar */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setTempAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      <div className="modal-actionsss">
                        <button
                          className="btn-confirm"
                          onClick={() => {
                            setUserAvatar(tempAvatar);
                            setIsEditingAvatar(false);
                            setIsEditProfileOpen(false);
                          }}
                        >
                          Simpan
                        </button>

                        {userAvatar && (
                          <button
                            className="btn-cancel"
                            onClick={() => setTempAvatar(null)}
                          >
                            Hapus Foto
                          </button>
                        )}

                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setTempAvatar(userAvatar);
                            setIsEditingAvatar(false);
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === Modal Preview Avatar Fullscreen === */}
            {isPreviewOpen && (
              <div className="modal-overlayyy" onClick={closePreview}>
                <div
                  className="preview-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={userAvatar} alt="Preview Avatar" />
                </div>
              </div>
            )}

          </div>

        </aside>

        {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

        <main className="main-content">
          <header className="main-header">
            <div className="header-left-group">
              <button className="hamburger-menu-button" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
              <h1 className="dashboard-header-title">Admin Dashboard</h1>
            </div>
            <div className="main-header-controls">
              <span className="breadcrumb">Home / {currentPage}</span>
              <button onClick={handleLogout} className="logout-button"><i className="fas fa-sign-out-alt"></i></button>
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
                  {/* Kartu Tiket Belum Selesai */}
                  <div
                    className={`info-card red-card ${statusFilter === 'Belum Selesai' ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick(); // pindah ke Daftar Tiket
                      handleStatusFilterClick('Belum Selesai'); // filter otomatis
                    }}
                  >
                    <div className="card-header">
                      <p className="card-label">Tiket Belum Selesai</p>
                      <div className="card-icon red-icon"><i className="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.pending_tickets : '...'}</h3>
                  </div>

                  {/* Kartu Tiket Selesai */}
                  <div
                    className={`info-card green-card ${statusFilter === 'Selesai' ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick(); // pindah ke Daftar Tiket
                      handleStatusFilterClick('Selesai'); // filter otomatis
                    }}
                  >
                    <div className="card-header">
                      <p className="card-label">Tiket Selesai</p>
                      <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.completed_tickets : '...'}</h3>
                  </div>

                  {/* Kartu Total Tiket */}
                  <div
                    className={`info-card yellow-card ${!statusFilter ? 'active' : ''}`}
                    onClick={() => {
                      handleHomeClick();             // masuk ke Daftar Tiket
                      handleStatusFilterClick(null); // tampilkan semua tiket
                    }}
                  >
                    <div className="card-header">
                      <p className="card-label">Total Tiket</p>
                      <div className="card-icon yellow-icon"><i className="fas fa-tasks"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_tickets : '...'}</h3>
                  </div>

                  {/* Kartu Total Pengguna */}
                  <div
                    className="info-card blue-card"
                    onClick={() => setCurrentPage('userManagement')}
                  >
                    <div className="card-header">
                      <p className="card-label">Total Pengguna</p>
                      <div className="card-icon blue-icon"><i className="fas fa-users"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_users : '...'}</h3>
                  </div>
                </div>

                <div className="dashboard-container2">

                  {/* Baris 1: Line Chart + Pie Chart */}
                  <div className="dashboard-row">
                    <div className="dashboard-card line-chart-card">
                      <h4>Tren Tiket (30 Hari Terakhir)</h4>
                      <LineChartComponent data={analyticsData} />
                    </div>
                    <div className="dashboard-card pie-chart-card">
                      <h4>Status Tiket</h4>
                      <PieChartComponent stats={stats} />
                    </div>
                  </div>

                  {/* Baris 2: Bar Chart + Map */}
                  <div className="dashboard-row">
                    <div className="dashboard-card bar-chart-card">
                      <h4>Performa Admin</h4>
                      <BarChartComponent data={adminPerformanceData} />
                    </div>
                    <div className="dashboard-card map-chart-card">
                      <h4>Geografi Traffic</h4>
                      <MapComponent data={locationsData} />
                    </div>
                  </div>

                </div>
              </>

            )}

            {currentPage === 'Tickets' && (
              <>
                {/* <div className="info-cards-grid">
               
                  <div className={`info-card red-card ${statusFilter === 'Belum Selesai' ? 'active' : ''}`} onClick={() => handleStatusFilterClick('Belum Selesai')}>
                    <div className="card-header">
                      <p className="card-label">Tiket Belum Selesai</p>
                      <div className="card-icon red-icon"><i className="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.pending_tickets : '...'}</h3>
                    <div className="card-footer">
                      <span className="card-change up"><i className="fas fa-arrow-up"></i> 3.43%</span>
                      <span className="card-period">Since last month</span>
                    </div>
                  </div>

                  
                  <div className={`info-card green-card ${statusFilter === 'Selesai' ? 'active' : ''}`} onClick={() => handleStatusFilterClick('Selesai')}>
                    <div className="card-header">
                      <p className="card-label">Tiket Selesai</p>
                      <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.completed_tickets : '...'}</h3>
                    <div className="card-footer">
                      <span className="card-change down"><i className="fas fa-arrow-down"></i> 1.10%</span>
                      <span className="card-period">Since yesterday</span>
                    </div>
                  </div>

                  
                  <div className={`info-card yellow-card ${!statusFilter ? 'active' : ''}`} onClick={() => handleStatusFilterClick(null)}>
                    <div className="card-header">
                      <p className="card-label">Total Tiket</p>
                      <div className="card-icon yellow-icon"><i className="fas fa-tasks"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_tickets : '...'}</h3>
                    <div className="card-footer">
                      <span className="card-change up"><i className="fas fa-arrow-up"></i> 1.2%</span>
                      <span className="card-period">Since last month</span>
                    </div>
                  </div>

                  
                  <div className="info-card blue-card" onClick={() => setCurrentPage('userManagement')}>
                    <div className="card-header">
                      <p className="card-label">Total Pengguna</p>
                      <div className="card-icon blue-icon"><i className="fas fa-users"></i></div>
                    </div>
                    <h3 className="card-value">{stats ? stats.total_users : '...'}</h3>
                    <div className="card-footer">
                      <span className="card-change down"><i className="fas fa-arrow-down"></i> 3.48%</span>
                      <span className="card-period">Since last week</span>
                    </div>
                  </div>
                </div> */}
                {/* <JobForm users={users} addTicket={addTicket} /> */}
                <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Cari berdasarkan nama pekerja..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ flexGrow: 1, padding: '8px' }} />
                  <button type="submit" style={{ padding: '8px 16px' }}>Cari</button>
                </form>
                {selectedTicketIds.length > 0 && (<div className="bulk-action-bar" style={{ margin: '20px 0' }}><button onClick={handleBulkDelete} className="btn-delete">Hapus {selectedTicketIds.length} Tiket yang Dipilih</button></div>)}
                <JobList tickets={ticketsOnPage} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} userRole={userRole} onSelectionChange={handleSelectionChange} onAssignClick={handleAssignClick} onRejectClick={handleRejectClick} onProofClick={handleProofClick} />
                <Pagination currentPage={dataPage} lastPage={ticketData ? ticketData.last_page : 1} onPageChange={handlePageChange} />
              </>
            )}
            {currentPage === 'MyTickets' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>Tiket yang Saya Kerjakan</h2>

                {/* Tampilkan daftar tiket jika ada data */}
                {myTicketsData && myTicketsData.data && myTicketsData.data.length > 0 ? (
                  <>
                    <JobList
                      tickets={myTicketsData.data}
                      updateTicketStatus={updateTicketStatus}
                      deleteTicket={handleDeleteClick}
                      userRole={userRole}
                      onAssignClick={handleAssignClick}
                      onRejectClick={handleRejectClick}
                      onProofClick={handleProofClick}
                    />
                    <Pagination
                      currentPage={myTicketsPage}
                      lastPage={myTicketsData.last_page}
                      onPageChange={(page) => setMyTicketsPage(page)}
                    />
                  </>
                ) : (
                  // Tampilkan pesan jika tidak ada tiket yang dikerjakan
                  <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Anda belum bertugas untuk mengerjakan tiket apa pun.</p>
                  </div>
                )}
              </>
            )}
            {currentPage === 'userManagement' && (
              <UserManagement userData={userData} onDeleteClick={handleUserDeleteClick} onAddClick={handleAddUserClick} onEditClick={handleUserEditClick} onPageChange={handleUserPageChange} onSearch={handleUserSearch} />
            )}
            {currentPage === 'Notifications' && (
              <NotificationForm
                users={users}
                globalNotifications={notifications.filter(n => n.user_id === null)}
                refreshNotifications={fetchNotifications}
              />
            )}
          </div>
        </main>
        {showProofModal && ticketForProof && (
          <ProofModal ticket={ticketForProof} onSave={handleSaveProof} onClose={handleCloseProofModal} />
        )}
        {showAssignModal && ticketToAssign && (
          <AssignAdminModal ticket={ticketToAssign} admins={adminList} onAssign={handleConfirmAssign} onClose={handleCloseAssignModal} />
        )}
        {showRejectModal && ticketToReject && (<RejectTicketModal ticket={ticketToReject} onReject={handleConfirmReject} onClose={handleCloseRejectModal} />)}
        {showConfirmModal && ticketToDelete && (<ConfirmationModal message={`Hapus pekerjaan "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />)}
        {showUserConfirmModal && userToDelete && (<ConfirmationModal message={`Anda yakin ingin menghapus pengguna "${userToDelete.name}"?`} onConfirm={confirmUserDelete} onCancel={cancelUserDelete} />)}
        {showUserFormModal && (<UserFormModal userToEdit={userToEdit} onClose={handleCloseUserForm} onSave={handleSaveUser} />)}
      </div>
    );
  }

  // Tampilan untuk USER BIASA (tanpa sidebar)
  return (
    <div
      className="dashboard-container no-sidebar"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <main className="main-content">
        <header className="main-header-user">
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo"></img>
          </div>
          <div className="user-view-tabs">
            {/* <button className={`tab-button ${userViewTab === 'home' ? 'active' : ''}`} onClick={() => setUserViewTab('home')}>Home</button> */}
            <button className={`tab-button ${userViewTab === 'request' ? 'active' : ''}`} onClick={() => setUserViewTab('request')}>Request</button>
            <button className={`tab-button ${userViewTab === 'history' ? 'active' : ''}`} onClick={() => setUserViewTab('history')}>History</button>
            {/* <button className={`tab-button ${userViewTab === 'aboutus' ? 'active' : ''}`} onClick={() => setUserViewTab('aboutus')}>About Us</button> */}
          </div>
          <div className="main-header-controls-user">
            <span className="breadcrump">{userViewTab.charAt(0).toUpperCase() + userViewTab.slice(1)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onToggle={handleNotificationToggle}
                onDelete={handleDeleteNotification}
              />
              <button onClick={handleLogout} className="logout-buttonuser">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="user-view-container">
            <div className="user-view-content">
              {/* {userViewTab === 'home' && <WelcomeHomeUser user={userName} onExploreClick={() => setUserViewTab('request')} />} */}
              {userViewTab === 'request' && (
                <div className="request-tab">
                  <h2>Submit a Request</h2>
                  <p>Please fill in the job details below.</p>
                  <br />
                  <JobFormUser users={users} addTicket={addTicket} />
                </div>
              )}

              {userViewTab === 'history' && (
                <div className="history-tab">
                  <h2>Your Tickets</h2>
                  <div className="job-list" style={{ marginTop: '20px' }}>
                    <table className="job-table user-history-table">
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
                            <tr key={ticket.id}>
                              <td data-label="Deskripsi">{ticket.title}</td>
                              <td data-label="Workshop">{ticket.workshop}</td>
                              <td data-label="Tanggal Dibuat">
                                {format(new Date(ticket.created_at), 'dd MMM yyyy')}
                              </td>
                              <td data-label="Waktu Pengerjaan">
                                {(() => {
                                  if (ticket.started_at) {
                                    return ticket.completed_at
                                      ? `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(
                                        new Date(ticket.completed_at),
                                        'HH:mm'
                                      )}`
                                      : `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
                                  }
                                  if (ticket.requested_date && ticket.requested_time) {
                                    return `Request: ${format(new Date(ticket.requested_date), 'dd-MM-yy')} ${ticket.requested_time
                                      }`;
                                  }
                                  if (ticket.requested_date) {
                                    return `Request: ${format(new Date(ticket.requested_date), 'dd-MM-yy')}`;
                                  }
                                  if (ticket.requested_time) {
                                    return `Request: ${ticket.requested_time}`;
                                  }
                                  return 'Flexible Work Schedule';
                                })()}
                              </td>
                              <td data-label="Status">
                                <span
                                  className={`status-badge status-${ticket.status
                                    .toLowerCase()
                                    .replace(' ', '-')}`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                              <td data-label="Aksi">
                                {ticket.status === 'Selesai' && ticket.proof_description ? (
                                  <button
                                    onClick={() => handleViewProofClick(ticket)}
                                    className="btn-start"
                                  >
                                    See Evidence
                                  </button>
                                ) : ticket.status === 'Ditolak' ? (
                                  <button
                                    onClick={() => handleShowReasonClick(ticket)}
                                    className="btn-reason"
                                  >
                                    Reason
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteClick(ticket)}
                                    className="btn-cancel-aksi"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6">You haven't created a ticket yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>

                  <PaginationUser
                    currentPage={createdTicketsPage}
                    lastPage={createdTicketsData ? createdTicketsData.last_page : 1}
                    onPageChange={handleCreatedTicketsPageChange}
                  />
                </div>
              )}
              {/* {userViewTab === 'aboutus' && <AboutUsPage adminList={adminList} />} */}
            </div>
          </div>
        </div>
      </main>

      {showViewProofModal && ticketToShowProof && (
        <ViewProofModal ticket={ticketToShowProof} onClose={handleCloseViewProofModal} onDelete={handleDeleteFromViewProofModal} />
      )}
      {showRejectionInfoModal && ticketToShowReason && (
        <RejectionInfoModal ticket={ticketToShowReason} onClose={handleCloseReasonModal} onDelete={handleDeleteFromReasonModal} />
      )}
      {showConfirmModal && ticketToDelete && (<ConfirmationModalUser message={`Delete job "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />)}
    </div>
  );
}

export default App;
