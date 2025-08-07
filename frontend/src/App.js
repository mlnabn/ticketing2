import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser.js';
import ConfirmationModal from './components/ConfirmationModal';
import { getToken, isLoggedIn, logout, getUser } from './auth';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  // --- STATE MANAGEMENT ---
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  const [currentPage, setCurrentPage] = useState('home');
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
      }
      fetchData();
    }
  }, [isLogin]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/tickets`, config),
        axios.get(`${API_URL}/users`, config)
      ]);
      setTickets(ticketsRes.data);
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
      fetchData();
      // Otomatis pindah ke halaman home setelah berhasil menambah tiket
      setCurrentPage('home');
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
      // Anda bisa menambahkan feedback error di sini
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData();
    } catch (error) { console.error("Gagal update status:", error); }
  };

  const handleDeleteClick = (id) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) { setTicketToDelete(ticket); setShowConfirmModal(true); }
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        fetchData();
      } catch (error) { console.error("Gagal hapus tiket:", error); }
      finally { setShowConfirmModal(false); setTicketToDelete(null); }
    }
  };

  const cancelDelete = () => { setShowConfirmModal(false); setTicketToDelete(null); };

  const handleLogout = () => {
    logout();
    setIsLogin(false);
    setCurrentPage('home');
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

  return (
    <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">Helpdesk Tiketing</div>
        <nav className="sidebar-nav">
          <ul>
            {/* Tampilan Menu untuk Admin */}
            {isAdmin && (
              <>
                <li className="sidebar-nav-item">
                  <button onClick={() => setCurrentPage('home')} className={`sidebar-button ${currentPage === 'home' ? 'active' : ''}`}>
                    <i className="fas fa-home"></i><span>Home</span>
                  </button>
                </li>
                <li className="sidebar-nav-item">
                  <button onClick={() => setCurrentPage('addUser')} className={`sidebar-button ${currentPage === 'addUser' ? 'active' : ''}`}>
                    <i className="fas fa-user-plus"></i><span>Add User</span>
                  </button>
                </li>
              </>
            )}

            {/* Tampilan Menu untuk User Biasa */}
            {!isAdmin && (
              <>
                <li className="sidebar-nav-item">
                  <button onClick={() => setCurrentPage('home')} className={`sidebar-button ${currentPage === 'home' ? 'active' : ''}`}>
                    <i className="fas fa-ticket-alt"></i><span>My Ticket</span>
                  </button>
                </li>
                <li className="sidebar-nav-item">
                  <button onClick={() => setCurrentPage('addTicket')} className={`sidebar-button ${currentPage === 'addTicket' ? 'active' : ''}`}>
                    <i className="fas fa-plus-circle"></i><span>Add Ticket</span>
                  </button>
                </li>
              </>
            )}

            {/* Menu Laporan (untuk semua role) */}
            <li className="sidebar-nav-item">
              <button className="sidebar-button">
                <i className="fas fa-chart-bar"></i><span>Laporan</span>
              </button>
            </li>
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
          {/* <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i><span>Logout</span>
          </button> */}
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left-group">
            <button className="hamburger-menu-button" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="dashboard-header-title">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
          </div>
          <div className="main-header-controls">
            <span className="breadcrumb">Home / {currentPage.replace('add', 'Add ')}</span>
            <button className="header-icon-button"><i className="fas fa-cog"></i></button>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i><span>Logout</span>
            </button>

          </div>
        </header>

        <div className="content-area">
          {/* Tampilan Halaman HOME */}
          {currentPage === 'home' && (
            <>
              {isAdmin && (
                <>
                  <div className="info-cards-grid">
                    <div className="info-card red-card"><h3>{tickets.filter(t => t.status !== 'selesai').length}</h3><p>Tiket Belum Selesai</p></div>
                    <div className="info-card green-card"><h3>{tickets.filter(t => t.status === 'selesai').length}</h3><p>Tiket Selesai</p></div>
                    <div className="info-card yellow-card"><h3>{tickets.length}</h3><p>Total Tiket</p></div>
                    <div className="info-card blue-card"><h3>{users.length}</h3><p>Total Pengguna</p></div>
                  </div>
                  {/* Admin tetap melihat form di halaman utama */}
                  <JobForm users={users} addTicket={addTicket} />
                </>
              )}
              {/* Semua role melihat daftar pekerjaan di halaman utama */}
              <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} />
            </>
          )}

          {/* Tampilan Halaman ADD USER (hanya admin) */}
          {currentPage === 'addUser' && isAdmin && <AddUser />}

          {/* Tampilan Halaman ADD TICKET (hanya user biasa) */}
          {!isAdmin && currentPage === 'addTicket' && (
            <>
              <h2>Tambah Tiket Baru</h2>
              <p>Silakan isi detail pekerjaan di bawah ini.</p>
              <br />
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
