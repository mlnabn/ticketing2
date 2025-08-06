import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import { getToken, isLoggedIn, logout } from './auth';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setusers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState(isLoggedIn());
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isLogin) fetchData();
  }, [isLogin]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
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

      console.log("Struktur Data Users dari API:", usersRes.data);

      setTickets(ticketsRes.data);
      setusers(usersRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

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

  const deleteTicket = async (id) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    const confirmHapus = window.confirm(`Hapus pekerjaan "${ticket.title}"?`);
    if (confirmHapus) {
      try {
        await axios.delete(`${API_URL}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        fetchData();
      } catch (error) {
        console.error("Gagal hapus tiket:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsLogin(false);
  };

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

  return (
    <div className="app-container">
      <Navbar onLogout={handleLogout} />
        {/* Tombol Logout di kiri bawah */}
      <div className='top-controls'>
        <button className="top-button" onClick={handleLogout}>
          🚪 Logout
        </button>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <h1>Ticketing Tracker</h1>
      <JobForm users={users} addTicket={addTicket} />
      <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={deleteTicket} />
    </div>
  );
}

export default App;
