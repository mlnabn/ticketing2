import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser.js'; // Komponen AddUser tetap digunakan
import ConfirmationModal from './components/ConfirmationModal'; // Komponen modal konfirmasi tetap digunakan
import { getToken, isLoggedIn, logout } from './auth';
import './App.css'; // Pastikan App.css ada di folder yang sama

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
  // State baru untuk mengontrol visibilitas sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Efek untuk mengambil data ketika status login berubah
  useEffect(() => {
    if (isLogin) fetchData();
  }, [isLogin]);

  // Efek untuk mengaktifkan/menonaktifkan mode gelap pada body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode); // Menggunakan 'dark-mode' sesuai CSS
  }, [darkMode]);

  // Fungsi untuk mengambil data tiket dan user dari API
  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/tickets`, config),
        axios.get(`${API_URL}/users`, config)
      ]);

      console.log("Struktur Data Users dari API:", usersRes.data);

      setTickets(ticketsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  // Fungsi untuk menambah tiket baru
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchData();
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  // Fungsi untuk memperbarui status tiket
  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchData();
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  // Fungsi untuk menangani klik hapus tiket (memunculkan modal konfirmasi)
  const handleDeleteClick = (id) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      setTicketToDelete(ticket);
      setShowConfirmModal(true);
    }
  };

  // Fungsi untuk mengkonfirmasi penghapusan tiket
  const confirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await axios.delete(`${API_URL}/tickets/${ticketToDelete.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        fetchData();
      } catch (error) {
        console.error("Gagal hapus tiket:", error);
      } finally {
        setShowConfirmModal(false);
        setTicketToDelete(null);
      }
    }
  };

  // Fungsi untuk membatalkan penghapusan tiket
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTicketToDelete(null);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    logout();
    setIsLogin(false);
    setCurrentPage('home');
  };

  // Fungsi untuk mengubah visibilitas sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isLogin) {
    return (
      <div className="auth-page-container"> {/* Menggunakan auth-page-container */}
        {showRegister ? (
          <>
            <Register
              onRegister={() => setIsLogin(true)}
              onShowLogin={() => setShowRegister(false)}
            />
          </>
        ) : (
          <>
            <Login
              onLogin={() => setIsLogin(true)}
              onShowRegister={() => setShowRegister(true)}
            />
          </>
        )}
      </div>
    );
  }

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
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span>admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
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
              {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>


        <div className="content-area">
          {currentPage === 'home' && (
            <>
              {/* Bagian Dashboard v3 (kartu informasi) */}
              <div className="info-cards-grid">
                <div className="info-card red-card">
                  <h3 className="info-card-title">0</h3>
                  <p>Tiket Belum Selesai</p>
                  <button className="info-card-link">More info <i className="fas fa-arrow-circle-right"></i></button>
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
              <JobForm users={users} addTicket={addTicket} />
              <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} />
            </>
          )}
          {currentPage === 'addUser' && <AddUser />}
        </div>
      </main>

      {/* Modal Konfirmasi */}
      {
        showConfirmModal && ticketToDelete && (
          <ConfirmationModal
            message={`Hapus pekerjaan "${ticketToDelete.title}"?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )
      }
    </div >
  );
}

export default App;
