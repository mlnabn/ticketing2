import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import './App.css';

// URL base API Laravel Anda
const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  // Fitur dari kode teman Anda: State untuk Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Mengambil data dari backend saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // Fitur dari kode teman Anda: Efek untuk mengubah tema
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Fungsi untuk mengambil semua data dari backend
  const fetchData = async () => {
    try {
      const [jobsResponse, workersResponse] = await Promise.all([
        axios.get(`${API_URL}/jobs`),
        axios.get(`${API_URL}/workers`)
      ]);
      setJobs(jobsResponse.data);
      setWorkers(workersResponse.data);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
    }
  };

  // Fungsi untuk MENAMBAH pekerjaan baru
  const addJob = async (formData) => {
    try {
      await axios.post(`${API_URL}/jobs`, formData);
      fetchData();
    } catch (error) {
      console.error("Gagal menambah pekerjaan:", error);
    }
  };

  // Fungsi untuk MENGUBAH status pekerjaan
  const updateJobStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/jobs/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error("Gagal mengubah status pekerjaan:", error);
    }
  };
  
  // Fitur dari kode teman Anda: Fungsi HAPUS pekerjaan (diadaptasi untuk API)
  const deleteJob = async (id) => {
    const jobToDelete = jobs.find(j => j.id === id);
    if (!jobToDelete) return;

    const confirmHapus = window.confirm(
      `Yakin ingin menghapus pekerjaan "${jobToDelete.title}"?`
    );

    if (confirmHapus) {
        try {
            await axios.delete(`${API_URL}/jobs/${id}`);
            fetchData(); // Ambil ulang data terbaru setelah berhasil menghapus
        } catch (error) {
            console.error("Gagal menghapus pekerjaan:", error);
        }
    }
  };

  return (
    <div className="app-container">
      {/* Fitur dari kode teman Anda: Tombol Dark Mode */}
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1>Ticketing Tracker</h1>
      
      <JobForm workers={workers} addJob={addJob} />
      
      {/* Kirim fungsi deleteJob sebagai prop baru ke JobList */}
      <JobList 
        jobs={jobs} 
        updateJobStatus={updateJobStatus} 
        deleteJob={deleteJob} 
      />
    </div>
  );
}

export default App;