// =================================================================
//  IMPOR LIBRARY & KOMPONEN
// =================================================================
import React, { useState, useEffect, useMemo, useCallback} from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import UserManagement from './components/UserManagement';
import ConfirmationModal from './components/ConfirmationModal';
import Pagination from './components/Pagination';
import { getToken, isLoggedIn, logout, getUser } from './auth';
import './App.css';
import yourLogo from './Image/Logo.png';
import loginBackground from './Image/my-login-background.png';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  

  // -----------------------------------------------------------------
  // #1.A. VARIABEL TURUNAN (Derived State)
  // -----------------------------------------------------------------
  // Variabel yang nilainya diturunkan dari state, dideklarasikan sebelum digunakan.
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';
  const ticketsOnPage = useMemo(() => (ticketData ? ticketData.data : []), [ticketData]);
  const createdTicketsOnPage = useMemo(() => (createdTicketsData ? createdTicketsData.data : []), [createdTicketsData]);

  const handleSelectionChange = useCallback((selectedIds) => {
    setSelectedTicketIds(selectedIds);
  }, []); // Dependency array kosong berarti fungsi ini hanya dibuat sekali

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
      fetchData(dataPage, searchQuery, statusFilter);
    }
  }, [isLogin, dataPage, searchQuery, statusFilter]);

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
  // 1. Tambahkan parameter 'status' dengan nilai default null
  const fetchData = async (page = 1, search = '', status = null) => {
    try {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      let ticketsUrl = `${API_URL}/tickets?page=${page}`;

      // Logika untuk search tidak berubah
      if (search) {
        ticketsUrl += `&search=${search}`;
      }
      
      // 2. Tambahkan filter status ke URL jika ada
      if (status) {
        ticketsUrl += `&status=${status}`;
      }
      
      // Sisa fungsi tidak berubah, ia akan menggunakan ticketsUrl yang sudah dimodifikasi
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
  // Di dalam file App.js

  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      
      // Setelah tiket berhasil ditambahkan, kita perlu data yang paling baru.
      // Cara paling sederhana dan pasti adalah memuat ulang semua data ke halaman pertama.
      
      // Reset semua filter dan paginasi
      setSearchInput('');
      setSearchQuery('');
      setStatusFilter(null); // Reset juga filter status jika ada
      setDataPage(1);
      
      // Jika user biasa, reset juga paginasi daftar tiket yang dibuat
      if (!isAdmin) {
        setCreatedTicketsPage(1);
        // Panggil fetchCreatedTickets secara eksplisit untuk memastikan daftarnya ter-update
        // bahkan sebelum navigasi (jika user tetap di halaman Add Ticket)
        fetchCreatedTickets(1);
      }
      
      // Panggil ulang fetchData untuk memuat ulang daftar tiket utama dan statistik
      // Ini akan secara otomatis membawa admin ke halaman utama yang sudah di-refresh
      fetchData(1, '', null);

      // Untuk admin, otomatis pindah ke halaman utama setelah menambah tiket
      if (isAdmin) {
        setCurrentPage('Tickets');
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

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status); // Set filter status yang baru
    setDataPage(1); // Selalu kembali ke halaman 1 saat filter baru diterapkan
  };

  const handleDeleteClick = (ticket) => {
    // Fungsi ini sekarang menerima seluruh objek tiket
    if (ticket && ticket.id) {
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


  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) {
      alert("Pilih setidaknya satu tiket untuk dihapus.");
      return;
    }

    // Tampilkan modal konfirmasi
    if (window.confirm(`Anda yakin ingin menghapus ${selectedTicketIds.length} tiket yang dipilih?`)) {
      try {
        await axios.post(`${API_URL}/tickets/bulk-delete`, 
          { ids: selectedTicketIds }, // Kirim array ID di dalam body request
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        // Refresh data setelah berhasil
        fetchData(1, ''); // Kembali ke halaman 1
      } catch (error) {
        console.error("Gagal menghapus tiket secara massal:", error);
        alert("Terjadi kesalahan saat mencoba menghapus tiket.");
      }
    }
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
                <li className="sidebar-nav-item"><button onClick={() => setCurrentPage('userManagement')} className={`sidebar-button ${currentPage === 'userManagement' ? 'active' : ''}`}><i className="fas fa-user-plus"></i><span>User</span></button></li>
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
                {/* Kartu "Belum Selesai" */}
                <div 
                  className={`info-card red-card ${statusFilter === 'Belum Selesai' ? 'active' : ''}`}
                  onClick={() => handleStatusFilterClick('Belum Selesai')}
                >
                  <h3>{stats ? stats.pending_tickets : '...'}</h3>
                  <p>Tiket Belum Selesai</p>
                </div>

                {/* Kartu "Selesai" */}
                <div 
                  className={`info-card green-card ${statusFilter === 'Selesai' ? 'active' : ''}`}
                  onClick={() => handleStatusFilterClick('Selesai')}
                >
                  <h3>{stats ? stats.completed_tickets : '...'}</h3>
                  <p>Tiket Selesai</p>
                </div>

                {/* Kartu "Total Tiket" - klik ini untuk mereset filter */}
                <div 
                  className={`info-card yellow-card ${!statusFilter ? 'active' : ''}`}
                  onClick={() => handleStatusFilterClick(null)}
                >
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
              {/* Tombol Hapus Massal hanya untuk admin dan jika ada tiket yang dipilih */}
              {isAdmin && selectedTicketIds.length > 0 && (
                <div className="bulk-action-bar" style={{ margin: '20px 0' }}>
                  <button onClick={handleBulkDelete} className="btn-delete">
                    Hapus {selectedTicketIds.length} Tiket yang Dipilih
                  </button>
                </div>
              )}
              <JobList tickets={ticketsOnPage} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} loggedInUserId={loggedInUserId} userRole={userRole} onSelectionChange={handleSelectionChange}/>
              <Pagination currentPage={dataPage} lastPage={ticketData ? ticketData.last_page : 1} onPageChange={handlePageChange}/>
            </>
          )}

          {/* Tampilan Halaman "Add User" (Hanya Admin) */}
          {currentPage === 'userManagement' && isAdmin && <UserManagement />}

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
                      <th>Tanggal Dibuat</th>
                      <th>Waktu Pengerjaan</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdTicketsOnPage.length > 0 ? (
                      createdTicketsOnPage.map(ticket => (
                        <tr key={ticket.id}>
                          <td data-label="Pengirim">{ticket.creator ? ticket.creator.name : 'N/A'}</td>
                          <td data-label="Ditugaskan Kepada">{ticket.user.name}</td>
                          <td data-label="Deskripsi">{ticket.title}</td>
                          <td data-label="Tanggal Dibuat">
                            {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: id })}
                          </td>
                          <td data-label="Waktu Pengerjaan">
                            {ticket.started_at ? `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}` : '-'}
                            {ticket.completed_at && <><br />{`Selesai: ${format(new Date(ticket.completed_at), 'HH:mm')}`}</>}
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
                          </td>
                          <td data-label="Aksi">
                            <button onClick={() => handleDeleteClick(ticket)} className="btn-delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Update colSpan menjadi 7
                      <tr><td colSpan="7">Anda belum membuat tiket untuk pengguna lain.</td></tr>
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