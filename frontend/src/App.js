import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser.js';
import ConfirmationModal from './components/ConfirmationModal';
import Pagination from './components/Pagination.js'; // MODIFIKASI: Impor komponen Pagination
import { getToken, isLoggedIn, logout, getUser } from './auth';
import './App.css';
import yourLogo from './Image/Logo.png';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  // --- STATE MANAGEMENT ---
  // MODIFIKASI: 'tickets' diubah jadi 'ticketData' untuk menampung objek paginasi dari Laravel
  const [ticketData, setTicketData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState('Tickets');
  // MODIFIKASI: State baru khusus untuk melacak halaman data di tabel
  const [dataPage, setDataPage] = useState(1);
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // --- DATA FETCHING & SIDE EFFECTS ---
  useEffect(() => {
    if (isLogin) {
      const currentUser = getUser();
      if (currentUser) {
        setUserRole(currentUser.role);
        setUserName(currentUser.name);
        setLoggedInUserId(currentUser.id);
      }
      // MODIFIKASI: Panggil fetchData dengan nomor halaman saat ini
      fetchData(dataPage);
    }
  // MODIFIKASI: Tambahkan `dataPage` sebagai dependensi agar data di-fetch ulang saat halaman berubah
  }, [isLogin, dataPage]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // MODIFIKASI: fetchData sekarang menerima parameter halaman
  const fetchData = async (page = 1) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };
      // MODIFIKASI: Tambahkan parameter `?page=` pada URL request tiket
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/tickets?page=${page}`, config),
        axios.get(`${API_URL}/users`, config)
      ]);
      // MODIFIKASI: Simpan seluruh objek paginasi ke `ticketData`
      setTicketData(ticketsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  // --- HANDLER FUNCTIONS ---
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      // MODIFIKASI: Setelah menambah, kembali ke halaman pertama
      setDataPage(1); 
      fetchData(1);
      setCurrentPage('Tickets');
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${getToken()}` } });
      // MODIFIKASI: Tetap di halaman saat ini setelah update
      fetchData(dataPage); 
    } catch (error) { console.error("Gagal update status:", error); }
  };

  const handleDeleteClick = (id) => {
    // MODIFIKASI: Cari tiket dari dalam 'ticketData.data' dan pastikan ticketData tidak null
    if (ticketData && ticketData.data) {
      const ticket = ticketData.data.find(t => t.id === id);
      if (ticket) { setTicketToDelete(ticket); setShowConfirmModal(true); }
    }
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        // MODIFIKASI: Tetap di halaman saat ini setelah hapus
        fetchData(dataPage); 
      } catch (error) { console.error("Gagal hapus tiket:", error); }
      finally { setShowConfirmModal(false); setTicketToDelete(null); }
    }
  };

  const cancelDelete = () => { setShowConfirmModal(false); setTicketToDelete(null); };

  const handleLogout = () => {
    logout();
    setIsLogin(false);
    setCurrentPage('Tickets');
    // MODIFIKASI: Reset state saat logout
    setDataPage(1);
    setTicketData(null);
  };

  // MODIFIKASI: Handler baru untuk mengubah halaman data
  const handlePageChange = (page) => {
    setDataPage(page);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- RENDER LOGIC ---

  if (!isLogin) {
    return (
      <div className="auth-page-container">
        {showRegister ? (
          <Register onRegister={() => setIsLogin(true)} onShowLogin={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={() => setIsLogin(true)} onShowRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  const isAdmin = userRole && userRole.toLowerCase() === 'admin';

  // MODIFIKASI: Variabel helper untuk mencegah error 'cannot read properties of undefined'
  const ticketsOnPage = ticketData ? ticketData.data : [];
  const totalTickets = ticketData ? ticketData.total : 0;

  return (
    <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      {/* Sidebar tidak berubah */}
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        {/* ... isi sidebar Anda ... */}
        {/* Kode Sidebar Anda dari sebelumnya tidak perlu diubah */}
        <div className="sidebar-header">
            <img
                src={yourLogo}
                alt="Helpdesk Tiketing Logo"
                className="sidebar-logo"
            />
        </div>
        <nav className="sidebar-nav">
          <ul>
            {isAdmin && (
              <>
                <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('Tickets')} className={`sidebar-button ${currentPage === 'Tickets' ? 'active' : ''}`}><i className="fas fa-home"></i><span>Home</span></button></li>
                <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('addUser')} className={`sidebar-button ${currentPage === 'addUser' ? 'active' : ''}`}><i className="fas fa-user-plus"></i><span>Add User</span></button></li>
              </>
            )}
            {!isAdmin && (
              <>
                <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('Tickets')} className={`sidebar-button ${currentPage === 'Tickets' ? 'active' : ''}`}><i className="fas fa-ticket-alt"></i><span>Tickets</span></button></li>
                <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('addTicket')} className={`sidebar-button ${currentPage === 'addTicket' ? 'active' : ''}`}><i className="fas fa-plus-circle"></i><span>Add Ticket</span></button></li>
              </>
            )}
            <li className="sidebar-nav-item"><button className="sidebar-button"><i className="fas fa-chart-bar"></i><span>Laporan</span></button></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><i className="fas fa-user"></i></div>
            <span>{userName || 'User'}</span>
          </div>
          <button className="dark-mode-toggle-button" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Header tidak berubah */}
        <header className="main-header">
            <div className="header-left-group">
                <button className="hamburger-menu-button" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
                <h1 className="dashboard-header-title">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
            </div>
            <div className="main-header-controls">
                <span className="breadcrumb">Home / {currentPage.replace('add', 'Add ')}</span>
                <button className="header-icon-button"><i className="fas fa-cog"></i></button>
                <button onClick={handleLogout} className="logout-button"><i className="fas fa-sign-out-alt"></i><span>Logout</span></button>
            </div>
        </header>

        <div className="content-area">
          {currentPage === 'Tickets' && (
            <>
              <div className="info-cards-grid">
                {/* MODIFIKASI: Kartu statistik disesuaikan untuk menggunakan data baru */}
                <div className="info-card red-card"><h3>{ticketsOnPage.filter(t => t.status !== 'Selesai').length}</h3><p>Tiket Belum Selesai</p></div>
                <div className="info-card green-card"><h3>{ticketsOnPage.filter(t => t.status === 'Selesai').length}</h3><p>Tiket Selesai</p></div>
                <div className="info-card yellow-card"><h3>{totalTickets}</h3><p>Total Tiket</p></div>
                {isAdmin && (
                  <div className="info-card blue-card"><h3>{users.length}</h3><p>Total Pengguna</p></div>
                )}
              </div>
              {isAdmin && (<JobForm users={users} addTicket={addTicket} />)}
              
              <JobList
                // MODIFIKASI: Kirim `ticketsOnPage` ke komponen JobList
                tickets={ticketsOnPage}
                updateTicketStatus={updateTicketStatus}
                deleteTicket={handleDeleteClick}
                loggedInUserId={loggedInUserId}
                userRole={userRole}
              />
              
              {/* MODIFIKASI: Tambahkan komponen Pagination di sini */}
              <Pagination
                currentPage={dataPage}
                lastPage={ticketData ? ticketData.last_page : 1}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* Bagian ini tidak berubah */}
          {currentPage === 'addUser' && isAdmin && <AddUser />}
          {!isAdmin && currentPage === 'addTicket' && (
            <>
              <h2>Tambah Tiket Baru</h2>
              <p>Silakan isi detail pekerjaan di bawah ini.</p><br />
              <JobForm users={users} addTicket={addTicket} />
            </>
          )}
        </div>
      </main>

      {showConfirmModal && ticketToDelete && (
        <ConfirmationModal message={`Hapus pekerjaan "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}

export default App;