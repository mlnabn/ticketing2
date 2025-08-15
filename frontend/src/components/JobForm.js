import React, { useState } from 'react';
import Select from 'react-select';

// Terima prop 'addTicket'
function JobForm({ users, addTicket, userRole }) {
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';
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

  // Deteksi status mode gelap saat ini
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Tentukan variabel CSS yang akan digunakan berdasarkan mode saat ini
  // Mengacu pada variabel yang sudah didefinisikan di App.css
  const inputBg = isDarkMode ? "var(--input-bg-light)" : "var(--input-bg-light)";
  const borderColor = isDarkMode ? "var(--border-color-light)" : "var(--border-color-light)";
  const textColor = isDarkMode ? "var(--text-color-light)" : "var(--text-color-light)";
  const placeholderColor = isDarkMode ? "var(--placeholder-color-light)" : "var(--placeholder-color-light)";
  const formInputShadow = isDarkMode ? "var(--form-input-shadow-light)" : "var(--form-input-shadow-light)";
  const menuBg = isDarkMode ? "var(--content-bg-light)" : "var(--content-bg-light)";
  const menuBorder = isDarkMode ? "var(--border-color-light)" : "var(--border-color-light)";
  const optionHoverBg = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 123, 255, 0.1)"; // Warna hover opsi
  const optionActiveBg = isDarkMode ? "#007bff" : "#007bff"; // Warna saat diklik

  // Styling untuk komponen React-Select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: inputBg,
    borderRadius: "10px",
    borderColor: borderColor,
    minHeight: "45px",
    fontWeight: 500,
    boxShadow: formInputShadow,
    color: textColor, // Warna teks saat nilai sudah dipilih di kontrol
  }),
  input: (provided) => ({
    ...provided,
    color: isDarkMode ? "white" : "black", // Warna teks saat mengetik
  }),
  placeholder: (provided) => ({
    ...provided,
    color: placeholderColor,
    fontWeight: 500,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: textColor,
    fontWeight: 500,
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: menuBg,
    borderColor: menuBorder,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  option: (provided, state) => ({
    ...provided,
    color: textColor,
    backgroundColor: state.isFocused ? optionHoverBg : "transparent",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: optionHoverBg,
      color: textColor,
    },
    "&:active": {
      backgroundColor: optionActiveBg,
      color: "white",
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: borderColor,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: placeholderColor, // Warna panah dropdown
    "&:hover": {
      color: textColor, // Warna panah dropdown saat hover
    },
  }),
};


  if (isAdmin) {
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

        {/* Tombol Tambah */}
        <button type="submit" className="btn-submit">Tambah</button>
      </form>
    );
  }

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

      {/* Tombol Tambah */}
      <button type="submit" className="btn-submit">Tambah</button>
    </form>
  );
}

export default JobForm;
