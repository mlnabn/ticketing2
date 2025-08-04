import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  // Pastikan nama state adalah 'tickets' dan 'setTickets'
  const [tickets, setTickets] = useState([]); 
  const [workers, setWorkers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchData = async () => {
    try {
      const [ticketsResponse, workersResponse] = await Promise.all([
        axios.get(`${API_URL}/tickets`),
        axios.get(`${API_URL}/workers`)
      ]);
      // Pastikan data dari ticketsResponse disimpan menggunakan setTickets
      setTickets(ticketsResponse.data); 
      setWorkers(workersResponse.data);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
    }
  };  

  const addTicket = async (formData) => {
    try {
      await axios.post(`${API_URL}/tickets`, formData);
      fetchData();
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tickets/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error("Gagal mengubah status tiket:", error);
    }
  };
  
  const deleteTicket = async (id) => {
    // Pastikan fungsi ini mencari dari state 'tickets'
    const ticketToDelete = tickets.find(t => t.id === id); 
    if (!ticketToDelete) return;

    const confirmHapus = window.confirm(
      `Yakin ingin menghapus pekerjaan "${ticketToDelete.title}"?`
    );

    if (confirmHapus) {
        try {
            await axios.delete(`${API_URL}/tickets/${id}`);
            fetchData();
        } catch (error) {
            console.error("Gagal menghapus tiket:", error);
        }
    }
  };

  return (
    <div className="app-container">
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1>Ticketing Tracker</h1>
      
      <JobForm workers={workers} addTicket={addTicket} /> 
      
      {/* Pastikan prop yang dikirim ke JobList adalah 'tickets' */}
      <JobList 
        tickets={tickets} 
        updateTicketStatus={updateTicketStatus} 
        deleteTicket={deleteTicket} 
      />
    </div>
  );
}

export default App;