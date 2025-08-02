// JobForm.js

import React, { useState } from 'react';

// Terima props `workers` dan `addJob` dari App.js
function JobForm({ workers, addJob }) {
  // State lokal hanya untuk mengelola input form
  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [status, setStatus] = useState('Belum Dikerjakan');
  
  // Set workerId default saat data workers pertama kali diterima
  if (workers.length > 0 && workerId === '') {
      setWorkerId(workers[0].id);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && workerId && status) {
      // Kirim data dalam bentuk object ke fungsi addJob
      addJob({ title, worker_id: workerId, status });
      setTitle(''); // Reset input title
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      {/* Dropdown untuk memilih pekerja */}
      <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
        <option value="" disabled>Pilih Pekerja</option>
        
        {/* Tambahkan pengecekan `Array.isArray(workers)` sebelum melakukan map */}
        {Array.isArray(workers) && workers.map((worker) => (
          <option key={worker.id} value={worker.id}>
            {worker.name}
          </option>
        ))}
      </select>

      {/* Input untuk nama pekerjaan */}
      <input
        type="text"
        placeholder="Nama Pekerjaan"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Dropdown untuk status */}
      <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="Belum Dikerjakan">Belum Dikerjakan</option>
          <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
      </select>
      
      <button type="submit" className="btn-submit">Tambah</button>
    </form>
  );
}

export default JobForm;