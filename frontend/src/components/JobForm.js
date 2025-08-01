import React, { useState } from 'react';

function JobForm({ addJob }) {
  const [namaPekerja, setNamaPekerja] = useState('');
  const [namaPekerjaan, setNamaPekerjaan] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (namaPekerja && namaPekerjaan) {
      addJob(namaPekerja.trim(), namaPekerjaan.trim());
      setNamaPekerja('');
      setNamaPekerjaan('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Nama Pekerja"
        value={namaPekerja}
        onChange={(e) => setNamaPekerja(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Nama Pekerjaan"
        value={namaPekerjaan}
        onChange={(e) => setNamaPekerjaan(e.target.value)}
        required
        style={{ marginLeft: '0.5rem' }}
      />
      <button type="submit" style={{ marginLeft: '0.5rem' }}>Tambah</button>
    </form>
  );
}

export default JobForm;
