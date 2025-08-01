// JobForm.js

import React, { useState } from 'react';

// Terima props 'pekerjaList' dan 'statusList'
function JobForm({ addJob, pekerjaList, statusList }) {
  // Set state awal untuk dropdown
  const [namaPekerja, setNamaPekerja] = useState(pekerjaList[0] || '');
  const [namaPekerjaan, setNamaPekerjaan] = useState('');
  const [status, setStatus] = useState(statusList[0] || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (namaPekerja && namaPekerjaan && status) {
      addJob(namaPekerja, namaPekerjaan, status);
      // Reset form
      setNamaPekerjaan('');
      setNamaPekerja(pekerjaList[0] || '');
      setStatus(statusList[0] || '');
    }
  };

  return (
    // Ganti form dengan className
    <form onSubmit={handleSubmit} className="job-form">
      <select value={namaPekerja} onChange={(e) => setNamaPekerja(e.target.value)} required>
        {pekerjaList.map((pekerja) => (
          <option key={pekerja} value={pekerja}>
            {pekerja}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Nama Pekerjaan"
        value={namaPekerjaan}
        onChange={(e) => setNamaPekerjaan(e.target.value)}
        required
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          {statusList.map((s) => (
              <option key={s} value={s}>
                  {s}
              </option>
          ))}
      </select>
      
      {/* Tambahkan className untuk tombol */}
      <button type="submit" className="btn-submit">Tambah</button>
    </form>
  );
}

export default JobForm;