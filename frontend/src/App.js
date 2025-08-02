import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import './App.css';

// 2. Definisikan URL base API Laravel Anda
const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);

  // 3. Gunakan useEffect untuk mengambil data saat komponen dimuat pertama kali
  useEffect(() => {
    fetchData();
  }, []);

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

  // Fungsi untuk MENAMBAH pekerjaan baru, akan dikirim ke JobForm
  const addJob = async (formData) => {
    try {
      await axios.post(`${API_URL}/jobs`, formData);
      fetchData(); // Ambil ulang data terbaru setelah berhasil menambah
    } catch (error) {
      console.error("Gagal menambah pekerjaan:", error);
    }
  };

  // Fungsi untuk MENGUBAH status pekerjaan, akan dikirim ke JobList
  const updateJobStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/jobs/${id}/status`, { status: newStatus });
      fetchData(); // Ambil ulang data terbaru setelah berhasil update
    } catch (error) {
      console.error("Gagal mengubah status pekerjaan:", error);
    }
  };

  return (
    <div className="app-container">
      <h1>Ticketing Tracker</h1>
      {/* Kirim fungsi dan data yang relevan sebagai props */}
      <JobForm workers={workers} addJob={addJob} />
      <JobList jobs={jobs} updateJobStatus={updateJobStatus} />
    </div>
  );
}

export default App;