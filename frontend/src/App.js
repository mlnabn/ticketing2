import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser.js';
import ConfirmationModal from './components/ConfirmationModal';
import { getToken, isLoggedIn, logout, getUser } from './auth'; // <-- PERUBAHAN 1: Tambahkan 'getUser'
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [userRole, setUserRole] = useState(null); // <-- PERUBAHAN 2: State untuk menyimpan peran user

  // Efek untuk mengambil data dan peran user ketika status login berubah
  useEffect(() => {
    if (isLogin) {
      const currentUser = getUser(); // Ambil data user dari localStorage
      if (currentUser) {
        setUserRole(currentUser.role); // <-- PERUBAHAN 3: Set peran user dari data yang didapat
      }
      fetchData();
    }
  }, [isLogin]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode); // Menggunakan 'dark-mode' sesuai CSS
  }, [darkMode]);

  // Fungsi fetchData tidak perlu diubah, karena backend sudah menangani filter data untuk user biasa.
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

  // ... (Sisa fungsi addTicket, updateTicketStatus, dll. tidak perlu diubah) ...
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchData();
    } catch (error) { console.error("Gagal menambah tiket:", error); }
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
  const handleLogout = () => { logout(); setIsLogin(false); setCurrentPage('home'); };
  // ... (Akhir dari fungsi yang tidak diubah) ...


  if (!isLogin) {
    return (
      <div className="auth-page-container"> {/* Menggunakan auth-page-container */}
        {showRegister ? (
          <Register onRegister={() => setIsLogin(true)} onShowLogin={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={() => setIsLogin(true)} onShowRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  // Buat variabel boolean untuk kemudahan pengecekan peran
  const isAdmin = userRole === 'admin'; // <-- PERUBAHAN 4: Helper boolean untuk admin

  return (
    // Menambahkan kelas 'sidebar-closed' ke dashboard-container jika sidebar tertutup
    <div className={`dashboard-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      {/* Sidebar */}
      {/* Menambahkan kelas 'closed' ke sidebar jika isSidebarOpen false */}
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          Helpdesk Tiketing
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="sidebar-nav-item">
              <button
                onClick={() => setCurrentPage('home')}
                className={`sidebar-button ${currentPage === 'home' ? 'active' : ''
                  }`}
              >
            <li className="mb-2">
              <button onClick={() => setCurrentPage('home')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${ currentPage === 'home' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700' }`} >
                <i className="fas fa-home"></i>
                <span>Home</span>
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button
                onClick={() => setCurrentPage('addUser')}
                className={`sidebar-button ${currentPage === 'addUser' ? 'active' : ''
                  }`}
              >
                <i className="fas fa-user-plus"></i>
                <span>Add User</span>
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button className="sidebar-button">
                <i className="fas fa-ticket-alt"></i>
                <span>Ticket List</span>
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button className="sidebar-button">
                <i className="fas fa-chart-bar"></i>
                <span>Laporan</span>
              </button>
            </li>
            
            {/* <-- PERUBAHAN 5: Tampilkan tombol 'Add User' hanya jika peran adalah admin --> */}
            {isAdmin && (
              <li className="mb-2">
                <button onClick={() => setCurrentPage('addUser')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${ currentPage === 'addUser' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700' }`} >
                  <i className="fas fa-user-plus"></i>
                  <span>Add User</span>
                </button>
              </li>
            )}
            
            {/* ... sisa menu sidebar bisa ditambahkan di sini dengan logika yang sama ... */}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span>admin</span>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"> <i className="fas fa-user text-white"></i> </div>
            <span>{userRole}</span> {/* Tampilkan peran user */}
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white transition-colors" >
            <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="main-content">
        <header className="main-header">
          {/* Grup kiri untuk hamburger dan judul "Dashboard v3" */}
          <div className="header-left-group">
            <button className="hamburger-menu-button" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="dashboard-header-title">Dashboard v3</h1> 
          </div>

          {/* Grup kanan untuk breadcrumb, ikon, dan tombol Dark Mode */}
          <div className="main-header-controls">
            <span className="breadcrumb">Home / Dashboard v3</span>
            <button className="header-icon-button">
              <i className="fas fa-cog"></i>
            </button>
            <button className="header-icon-button error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </button>
            <button
              className="dark-mode-toggle-button"
              onClick={() => setDarkMode(!darkMode)}
            >
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-700 shadow-md p-4 flex justify-between items-center">
          {/* Judul dinamis berdasarkan peran */}
          <h1 className="text-2xl font-bold">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
          <div className="flex items-center space-x-4">
            {/* ... sisa header ... */}
            <button className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onClick={() => setDarkMode(!darkMode)} >
              {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {currentPage === 'home' && (
            <>
              {/* Bagian Dashboard v3 (kartu informasi) */}
              <div className="info-cards-grid">
                <div className="info-card red-card">
                  <h3 className="info-card-title">0</h3>
                  <p>Tiket Belum Selesai</p>
                  <button className="info-card-link">More info <i className="fas fa-arrow-circle-right"></i></button>
              {/* <-- PERUBAHAN 6: Tampilkan kartu statistik hanya untuk admin --> */}
              {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-red-500 text-white p-4 rounded-lg shadow-md"> <h3 className="text-xl font-semibold">0</h3> <p>Tiket Belum Selesai</p> </div>
                  <div className="bg-green-500 text-white p-4 rounded-lg shadow-md"> <h3 className="text-xl font-semibold">2</h3> <p>Tiket Selesai</p> </div>
                  <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md"> <h3 className="text-xl font-semibold">4</h3> <p>Total Assign</p> </div>
                  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md"> <h3 className="text-xl font-semibold">5</h3> <p>Users</p> </div>
                </div>
                <div className="info-card green-card">
                  <h3 className="info-card-title">2</h3>
                  <p>Tiket Selesai</p>
                  <button className="info-card-link">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
                <div className="info-card yellow-card">
                  <h3 className="info-card-title">4</h3>
                  <p>Total Assign</p>
                  <button className="info-card-link">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
                <div className="info-card blue-card">
                  <h3 className="info-card-title">5</h3>
                  <p>Users</p>
                  <button className="info-card-link">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
              </div>

              {/* Konten Ticketing Tracker Anda yang sudah ada */}
              {/* <h1 className="ticketing-tracker-title">Ticketing Tracker</h1> */}
              )}

              <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                {isAdmin ? 'Ticketing Tracker' : 'My Tickets'}
              </h1>
              {/* JobForm dan JobList ditampilkan untuk kedua peran */}
              <JobForm users={users} addTicket={addTicket} />
              <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} />
            </>
          )}

          {/* <-- PERUBAHAN 7: Tampilkan halaman AddUser hanya jika peran admin --> */}
          {currentPage === 'addUser' && isAdmin && <AddUser />}
        </div>
      </main>

      {showConfirmModal && ticketToDelete && (
        <ConfirmationModal message={`Hapus pekerjaan "${ticketToDelete.title}"?`} onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
}

export default App;