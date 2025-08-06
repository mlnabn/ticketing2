import React, { useState } from 'react';
import Select from 'react-select';

// DIUBAH: Terima prop 'addTicket', bukan 'addJob'
function JobForm({ users, addTicket }) { 
  const [title, setTitle] = useState('');
  const [userId, setuserId] = useState('');
  const [status, setStatus] = useState('Belum Dikerjakan');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && userId && status) {
      // DIUBAH: Panggil fungsi 'addTicket'
      addTicket({ title, user_id: userId, status }); 
      setTitle('');
      setuserId('');
      setStatus('Belum Dikerjakan');
    }
  };

  // DITAMBAH: Pengaman jika 'users' belum berupa array
  const userOptions = Array.isArray(users) ? users.map(user => ({
    value: user.id,
    label: user.name
  })) : [];

  const selecteduser = userOptions.find(option => option.value === userId);

  // Styling (tidak ada perubahan)
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "var(--input-bg)",
      borderRadius: "10px",
      borderColor: "var(--border-color)",
      minHeight: "45px",
      fontWeight: 500
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--placeholder-color)",
      fontWeight: 500
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--text-color)",
      fontWeight: 500
    })
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      
      <Select
        options={userOptions}
        onChange={(selected) => setuserId(selected ? selected.value : '')}
        value={selecteduser}
        placeholder="Pilih Pekerja"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-select"
        required
      />

      <input
        type="text"
        placeholder="Nama Pekerjaan"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-like-select"
      />

      <Select
        options={[
          { value: 'Belum Dikerjakan', label: 'Belum Dikerjakan' },
          { value: 'Sedang Dikerjakan', label: 'Sedang Dikerjakan' }
        ]}
        onChange={(selected) => setStatus(selected.value)}
        value={{ value: status, label: status }}
        placeholder="Status"
        styles={selectStyles}
        classNamePrefix="react-select"
        required
      />

      <button type="submit" className="btn-submit">Tambah</button>
    </form>
  );
}

export default JobForm;