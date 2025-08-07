import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import AddUser from './components/AddUser'; // Komponen AddUser tetap digunakan
import ConfirmationModal from './components/ConfirmationModal'; // Komponen modal konfirmasi tetap digunakan
import { getToken, isLoggedIn, logout } from './auth';
import './App.css'; // Pastikan App.css a   da di folder yang sama

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]); // Perbaikan penamaan state dari 'setusers' menjadi 'setUsers'
  const [darkMode, setDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // State untuk melacak halaman yang sedang aktif
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Efek untuk mengambil data ketika status login berubah
  useEffect(() => {
    if (isLogin) fetchData();
  }, [isLogin]);

  // Efek untuk mengaktifkan/menonaktifkan mode gelap pada body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
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
      setUsers(usersRes.data); // Perbaikan penamaan state
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      // Handle error, e.g., redirect to login if token is invalid
      if (error.response && error.response.status === 401) {
        handleLogout(); // Logout jika token tidak valid
      }
    }
  };

  // Fungsi untuk menambah tiket baru
  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchData(); // Ambil data terbaru setelah menambah
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
      fetchData(); // Ambil data terbaru setelah update
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
        fetchData(); // Ambil data terbaru setelah hapus
      } catch (error) {
        console.error("Gagal hapus tiket:", error);
      } finally {
        setShowConfirmModal(false); // Sembunyikan modal
        setTicketToDelete(null); // Reset tiket yang akan dihapus
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
    setCurrentPage('home'); // Kembali ke home setelah logout
  };

  // Tampilkan halaman Login/Register jika belum login
  // Perhatikan bahwa blok ini akan di-return sepenuhnya, mencegah rendering dashboard
  if (!isLogin) {
    return (
      <div className="auth-container">
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

  // Tampilkan Dashboard jika sudah login
  // Blok ini hanya akan dirender jika isLogin adalah true
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col rounded-r-lg shadow-lg">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Helpdesk Tiketing
        </div>
        <nav className="flex-1 p-4">
          <ul>
            <li className="mb-2">
              <button
                onClick={() => setCurrentPage('home')}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  currentPage === 'home' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-home"></i>
                <span>Home</span>
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => setCurrentPage('addUser')}
                className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  currentPage === 'addUser' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'
                }`}
              >
                <i className="fas fa-user-plus"></i>
                <span>Add User</span>
              </button>
            </li>
            {/* Anda bisa menambahkan item sidebar lainnya di sini */}
            <li className="mb-2">
              <button
                // Contoh menu lain yang belum diimplementasikan
                className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-700"
              >
                <i className="fas fa-ticket-alt"></i>
                <span>Ticket List</span>
              </button>
            </li>
            <li className="mb-2">
              <button
                // Contoh menu lain yang belum diimplementasikan
                className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-700"
              >
                <i className="fas fa-chart-bar"></i>
                <span>Laporan</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          {/* Bagian bawah sidebar, misalnya info user atau logout */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white"></i>
            </div>
            <span>admin</span> {/* Ganti dengan nama user yang sebenarnya */}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-700 shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard v3</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-300">Home / Dashboard v3</span>
            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              <i className="fas fa-cog"></i>
            </button>
            <button className="text-red-500 hover:text-red-700 transition-colors">
              <i className="fas fa-exclamation-circle"></i>
            </button>
            <button
              className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6"> {/* Tambahkan padding ke konten utama */}
          {currentPage === 'home' && (
            <>
              {/* Bagian Dashboard v3 (kartu informasi) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold">0</h3>
                  <p>Tiket Belum Selesai</p>
                  <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold">2</h3>
                  <p>Tiket Selesai</p>
                  <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
                <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold">4</h3>
                  <p>Total Assign</p>
                  <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold">5</h3>
                  <p>Users</p>
                  <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
                </div>
              </div>

              {/* Konten Ticketing Tracker Anda yang sudah ada */}
              <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Ticketing Tracker</h1>
              <JobForm users={users} addTicket={addTicket} />
              <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={handleDeleteClick} />
            </>
          )}
          {currentPage === 'addUser' && <AddUser />}
        </div>
      </main>

      {/* Modal Konfirmasi */}
      {showConfirmModal && ticketToDelete && (
        <ConfirmationModal
          message={`Hapus pekerjaan "${ticketToDelete.title}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default App;
