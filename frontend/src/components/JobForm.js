import React, { useState } from 'react';
import Select from 'react-select';

// Terima prop 'addTicket'
function JobForm({ users, addTicket }) {
  const [title, setTitle] = useState(''); // Untuk Deskripsi
  const [userId, setUserId] = useState(''); // Untuk Nama Pekerja
  const [workshop, setWorkshop] = useState(''); // Untuk Workshop
  const [status, setStatus] = useState('Belum Dikerjakan'); // Default status

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pastikan semua field terisi sebelum submit
    if (title && userId && workshop && status) {
      // Panggil fungsi 'addTicket' dengan data yang sesuai
      addTicket({ title, user_id: userId, status, workshop });
      // Reset form setelah submit
      setTitle('');
      setUserId('');
      setWorkshop('');
      setStatus('Belum Dikerjakan');
    } else {
      console.log("Mohon lengkapi semua field.");
    }
  };

  // Opsi untuk dropdown Nama Pekerja dari data users
  const userOptions = Array.isArray(users) ? users.map(user => ({
    value: user.id,
    label: user.name
  })) : [];

  // Opsi untuk dropdown Workshop
  const workshopOptions = [
    { value: 'Nobo', label: 'Nobo' },
    { value: 'Canden', label: 'Canden' },
    { value: 'Bener', label: 'Bener' },
    { value: 'Nusa Persada', label: 'Nusa Persada' },
    { value: 'Pelita', label: 'Pelita' },
    { value: 'Muhasa', label: 'Muhasa' },
  ];

  // Temukan user yang dipilih untuk ditampilkan di Select
  const selectedUser = userOptions.find(option => option.value === userId);
  const selectedWorkshop = workshopOptions.find(option => option.value === workshop);

  // Styling untuk komponen React-Select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "var(--input-bg-light)", // Menggunakan variabel CSS
      borderRadius: "10px",
      borderColor: "var(--border-color-light)", // Menggunakan variabel CSS
      minHeight: "45px",
      fontWeight: 500,
      boxShadow: "var(--form-input-shadow-light)" // Menggunakan variabel CSS
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--placeholder-color-light)", // Menggunakan variabel CSS
      fontWeight: 500
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--text-color-light)", // Menggunakan variabel CSS
      fontWeight: 500
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--input-bg-light)", // Latar belakang menu
      borderColor: "var(--border-color-light)", // Border menu
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    }),
    option: (provided, state) => ({
      ...provided,
      color: "var(--text-color-light)", // Warna teks opsi
      backgroundColor: state.isFocused ? "rgba(0, 123, 255, 0.1)" : "transparent", // Warna hover
      "&:active": {
        backgroundColor: "#007bff", // Warna saat diklik
        color: "white"
      }
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      {/* Input untuk Workshop */}
      <Select
        options={workshopOptions}
        onChange={(selected) => setWorkshop(selected ? selected.value : '')}
        value={selectedWorkshop}
        placeholder="Workshop"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-select"
        required
      />

      {/* Select untuk Nama Pekerja */}
      <Select
        options={userOptions}
        onChange={(selected) => setUserId(selected ? selected.value : '')}
        value={selectedUser}
        placeholder="Nama Pekerja"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-select"
        required
      />

      {/* Input untuk Deskripsi */}
      <input
        type="text"
        placeholder="Deskripsi"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-like-select"
      />

      {/* Select untuk Status */}
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

      {/* Tombol Tambah */}
      <button type="submit" className="btn-submit">Tambah</button>
    </form>
  );
}

export default JobForm;