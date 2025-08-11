import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser.js';
import ConfirmationModal from './components/ConfirmationModal';
import Pagination from './components/Pagination';
import { getToken, isLoggedIn, logout, getUser } from './auth';
import './App.css';
import yourLogo from './Image/Logo.png';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  // --- STATE MANAGEMENT ---
  const [ticketData, setTicketData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState('Tickets');
  const [dataPage, setDataPage] = useState(1);
  // FITUR PENCARIAN: State untuk menampung input dan query pencarian
  const [searchInput, setSearchInput] = useState(''); // Untuk teks di dalam kotak input
  const [searchQuery, setSearchQuery] = useState(''); // Untuk query yang dikirim ke API

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
      fetchData(dataPage, searchQuery);
    }
  // FITUR PENCARIAN: Tambahkan `searchQuery` sebagai dependensi
  }, [isLogin, dataPage, searchQuery]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // FITUR PENCARIAN: `fetchData` sekarang menerima parameter `search`
  const fetchData = async (page = 1, search = '') => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };

      // Bangun URL dengan parameter dinamis
      let ticketsUrl = `${API_URL}/tickets?page=${page}`;
      if (search) {
        ticketsUrl += `&search=${search}`;
      }
      
      const [ticketsRes, usersRes, statsRes] = await Promise.all([
        axios.get(ticketsUrl, config),
        axios.get(`${API_URL}/users`, config),
        axios.get(`${API_URL}/tickets/stats`, config)
      ]);
      
      setTicketData(ticketsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  // --- HANDLER FUNCTIONS ---
  // FITUR PENCARIAN: Fungsi untuk menangani submit form pencarian
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput); // Set query pencarian yang akan memicu useEffect
    setDataPage(1); // Selalu kembali ke halaman 1 setiap kali pencarian baru dilakukan
  };

  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      setDataPage(1); 
      fetchData(1, searchQuery); // Kirim juga query pencarian saat ini
      setCurrentPage('Tickets');
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData(dataPage, searchQuery);
    } catch (error) { console.error("Gagal update status:", error); }
  };

  const handleDeleteClick = (id) => {
    if (ticketData && ticketData.data) {
      const ticket = ticketData.data.find(t => t.id === id);
      if (ticket) { setTicketToDelete(ticket); setShowConfirmModal(true); }
    }
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        fetchData(dataPage, searchQuery); 
      } catch (error) { console.error("Gagal hapus tiket:", error); }
      finally { setShowConfirmModal(false); setTicketToDelete(null); }
    }
  };

  const cancelDelete = () => { setShowConfirmModal(false); setTicketToDelete(null); };

  const handleLogout = () => {
    logout();
    setIsLogin(false);
    setCurrentPage('Tickets');
    setDataPage(1);
    setTicketData(null);
    setSearchQuery(''); // Reset pencarian saat logout
    setSearchInput('');
  };

  const handlePageChange = (page) => {
    setDataPage(page);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- RENDER LOGIC ---
  if (!isLogin) {
    return (
      <div className="auth-page-container">
        {showRegister ? <Register onRegister={() => setIsLogin(true)} onShowLogin={() => setShowRegister(false)} /> : <Login onLogin={() => setIsLogin(true)} onShowRegister={() => setShowRegister(true)} />}
      </div>
    );
  }

  const isAdmin = userRole && userRole.toLowerCase() === 'admin';
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
                      {/* PERBAIKAN 2: Gunakan data dari state `stats` untuk mengisi kartu */}
                      <div className="info-cards-grid">
                          <div className="info-card red-card">
                              {/* Tampilkan '...' saat data sedang loading */}
                              <h3>{stats ? stats.pending_tickets : '...'}</h3>
                              <p>Tiket Belum Selesai</p>
                          </div>
                          <div className="info-card green-card">
                              <h3>{stats ? stats.completed_tickets : '...'}</h3>
                              <p>Tiket Selesai</p>
                          </div>
                          <div className="info-card yellow-card">
                              <h3>{stats ? stats.total_tickets : '...'}</h3>
                              <p>Total Tiket</p>
                          </div>
                          {isAdmin && (
                              <div className="info-card blue-card">
                                  <h3>{stats ? stats.total_users : '...'}</h3>
                                  <p>Total Pengguna</p>
                              </div>
                          )}
                      </div>

                      {isAdmin && (<JobForm users={users} addTicket={addTicket} />)}
                      {isAdmin && (
                          <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                              <input type="text" placeholder="Cari berdasarkan nama pekerja..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ flexGrow: 1, padding: '8px' }} />
                              <button type="submit" style={{ padding: '8px 16px' }}>Cari</button>
                          </form>
                      )}
                      
                      <JobList
                          tickets={ticketsOnPage}
                          updateTicketStatus={updateTicketStatus}
                          deleteTicket={handleDeleteClick}
                          loggedInUserId={loggedInUserId}
                          userRole={userRole}
                      />
                      
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