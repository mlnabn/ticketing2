// =================================================================
//  IMPOR LIBRARY & KOMPONEN
// =================================================================
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
import loginBackground from './Image/my-login-background.png';

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
  const [stats, setStats] = useState(null);
  const [createdTicketsData, setCreatedTicketsData] = useState(null);

  // --- State untuk Autentikasi & Info Pengguna ---
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // --- State untuk Navigasi & Paginasi ---
  const [currentPage, setCurrentPage] = useState('Tickets');
  const [dataPage, setDataPage] = useState(1);
  const [createdTicketsPage, setCreatedTicketsPage] = useState(1);

  // --- State untuk Fitur Pencarian ---
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- State untuk Interaksi UI (Tampilan) ---
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  

  // -----------------------------------------------------------------
  // #1.A. VARIABEL TURUNAN (Derived State)
  // -----------------------------------------------------------------
  // Variabel yang nilainya diturunkan dari state, dideklarasikan sebelum digunakan.
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';


  // -----------------------------------------------------------------
  // #2. SIDE EFFECTS (useEffect Hooks)
  // -----------------------------------------------------------------
  // Efek untuk mengambil data utama saat login, halaman, atau pencarian berubah
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
  }, [isLogin, dataPage, searchQuery]);

  // Efek untuk mengambil daftar tiket yang dibuat saat user di halaman "Add Ticket"
  useEffect(() => {
    if (isLogin && !isAdmin && currentPage === 'addTicket') {
      fetchCreatedTickets(createdTicketsPage);
    }
  }, [isLogin, isAdmin, currentPage, createdTicketsPage]);

  // Efek untuk mengganti tema dark/light mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

   // Efek untuk mengatur background gambar login menggunakan variabel CSS
  useEffect(() => {
    document.documentElement.style.setProperty('--auth-background-image-light', `url(${loginBackground})`);
    // Jika Anda memiliki gambar dark mode terpisah, gunakan ini:
    // if (loginBackgroundDark) {
    //   document.documentElement.style.setProperty('--auth-background-image-dark', `url(${loginBackgroundDark})`);
    // } else {
    //   // Fallback jika tidak ada gambar dark mode, bisa diatur ke 'none' atau gambar yang sama
    //   document.documentElement.style.setProperty('--auth-background-image-dark', `url(${loginBackground})`);
    // }
  }, []); // Hanya dijalankan sekali saat komponen dimuat



  // -----------------------------------------------------------------
  // #3. DATA FETCHING FUNCTIONS (Fungsi Pengambilan Data)
  // -----------------------------------------------------------------
  const fetchData = async (page = 1, search = '') => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
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
      console.error("Gagal mengambil data utama:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchCreatedTickets = async (page = 1) => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}/tickets/created-by-me?page=${page}`, config);
      setCreatedTicketsData(response.data);
    } catch (error) {
      console.error("Gagal mengambil tiket yang dibuat:", error);
    }
  };


  // -----------------------------------------------------------------
  // #4. HANDLER FUNCTIONS (Fungsi untuk Menangani Aksi Pengguna)
  // -----------------------------------------------------------------
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      
      if (isAdmin) {
        // Jika admin, reset pencarian dan kembali ke halaman 1 daftar utama
        setSearchInput('');
        setSearchQuery('');
        setDataPage(1);
      } else {
        // Jika user, refresh daftar tiket yang dia buat ke halaman 1
        setCreatedTicketsPage(1);
        fetchCreatedTickets(1);
        // Refresh juga statistik karena ada penambahan tiket baru
        fetchData(dataPage, searchQuery);
      }
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${getToken()}` } });
      // Refresh data di halaman saat ini
      fetchData(dataPage, searchQuery);
      // Jika user, refresh juga daftar tiket yang dia buat (jika ada perubahan status di sana)
      if(!isAdmin) {
        fetchCreatedTickets(createdTicketsPage);
      }
    } catch (error) { console.error("Gagal update status:", error); }
  };

  const handleDeleteClick = (ticket) => {
    // Fungsi ini sekarang menerima seluruh objek tiket
    if (ticket) {
      setTicketToDelete(ticket);
      setShowConfirmModal(true);
    }
  };

  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        // Setelah berhasil hapus, refresh kedua daftar data
        fetchData(dataPage, searchQuery); 
        fetchCreatedTickets(createdTicketsPage); // <-- PERUBAHAN: Refresh juga daftar ini
      } catch (error) { 
        console.error("Gagal hapus tiket:", error);
        // Tambahan: Beri tahu user jika tidak diizinkan
        if(error.response && error.response.status === 403) {
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

  const handlePageChange = (page) => {
    setDataPage(page);
  };
  
  const handleCreatedTicketsPageChange = (page) => {
    setCreatedTicketsPage(page);
  };
  
  const handleLogout = () => {
    logout();
    setIsLogin(false);
    // Reset semua state ke nilai awal
    setCurrentPage('Tickets');
    setDataPage(1);
    setTicketData(null);
    setStats(null);
    setCreatedTicketsData(null);
    setSearchQuery('');
    setSearchInput('');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  // -----------------------------------------------------------------
  // #5. RENDER LOGIC (Logika untuk Menampilkan Komponen)
  // -----------------------------------------------------------------
  if (!isLogin) {
    return (
      <div className="auth-page-container">
        {showRegister ? <Register onRegister={() => setIsLogin(true)} onShowLogin={() => setShowRegister(false)} /> : <Login onLogin={() => setIsLogin(true)} onShowRegister={() => setShowRegister(true)} />}
      </div>
    );
  }

  // Variabel helper untuk mempermudah render dan mencegah error
  const ticketsOnPage = ticketData ? ticketData.data : [];
  const createdTicketsOnPage = createdTicketsData ? createdTicketsData.data : [];

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
          {/* Tampilan Halaman Utama (Tickets/Home) */}
          {currentPage === 'Tickets' && (
            <>
              <div className="info-cards-grid">
                  <div className="info-card red-card"><h3>{stats ? stats.pending_tickets : '...'}</h3><p>Tiket Belum Selesai</p></div>
                  <div className="info-card green-card"><h3>{stats ? stats.completed_tickets : '...'}</h3><p>Tiket Selesai</p></div>
                  <div className="info-card yellow-card"><h3>{stats ? stats.total_tickets : '...'}</h3><p>Total Tiket</p></div>
                  {isAdmin && (<div className="info-card blue-card"><h3>{stats ? stats.total_users : '...'}</h3><p>Total Pengguna</p></div>)}
              </div>
              {isAdmin && (<JobForm users={users} addTicket={addTicket} />)}
              {isAdmin && (
                  <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder="Cari berdasarkan nama pekerja..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ flexGrow: 1, padding: '8px' }} />
                      <button type="submit" style={{ padding: '8px 16px' }}>Cari</button>
                  </form>
              )}
              <JobList tickets={ticketsOnPage} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} loggedInUserId={loggedInUserId} userRole={userRole}/>
              <Pagination currentPage={dataPage} lastPage={ticketData ? ticketData.last_page : 1} onPageChange={handlePageChange}/>
            </>
          )}

          {/* Tampilan Halaman "Add User" (Hanya Admin) */}
          {currentPage === 'addUser' && isAdmin && <AddUser />}

          {/* Tampilan Halaman "Add Ticket" (Hanya User) */}
          {!isAdmin && currentPage === 'addTicket' && (
            <>
              <h2>Tambah Tiket Baru</h2>
              <p>Silakan isi detail pekerjaan di bawah ini.</p>
              <br />
              <JobForm users={users} addTicket={addTicket} />

              <div className="divider" style={{ margin: '40px 0', borderTop: '1px solid #444' }}></div>

              <h3>Tiket yang Telah Anda Buat</h3>
              <div className="job-list" style={{ marginTop: '20px' }}>
                <table className='job-table'>
                  <thead>
                    <tr>
                      <th>Pengirim</th>
                      <th>Ditugaskan Kepada</th>
                      <th>Deskripsi</th>
                      <th>Workshop</th>
                      <th>Status</th>
                      <th>Aksi</th> {/* Pastikan header Aksi ada */}
                    </tr>
                  </thead>
                  <tbody>
                    {createdTicketsOnPage.length > 0 ? (
                      createdTicketsOnPage.map(ticket => (
                        <tr key={ticket.id}>
                          <td>{ticket.creator ? ticket.creator.name : 'N/A'}</td>
                          <td>{ticket.user.name}</td>
                          <td>{ticket.title}</td>
                          <td>{ticket.workshop}</td>
                          <td><span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></td>
                          {/* PERUBAHAN: Tambahkan kolom Aksi dengan tombol Delete */}
                          <td>
                            <button 
                              onClick={() => handleDeleteClick(ticket)} 
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6">Anda belum membuat tiket untuk pengguna lain.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <Pagination currentPage={createdTicketsPage} lastPage={createdTicketsData ? createdTicketsData.last_page : 1} onPageChange={handleCreatedTicketsPageChange}/>
            </>
          )}
        </div>
      </main>

      {/* --------------- MODAL KONFIRMASI --------------- */}
      {showConfirmModal && ticketToDelete && (
        <ConfirmationModal message={`Hapus pekerjaan "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}

export default App;