import React, { useState } from 'react';
import Select from 'react-select';

// Terima prop 'addTicket'
function JobFormUser({ users, addTicket, userRole }) {
  const [title, setTitle] = useState(''); // Untuk Deskripsi
  // const [userId, setUserId] = useState(''); // Untuk Nama Pekerja
  const [workshop, setWorkshop] = useState(''); // Untuk Workshop
  // const [status, setStatus] = useState('Belum Dikerjakan'); // Default status

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pastikan semua field terisi sebelum submit
    if (title && workshop) {
      // Panggil fungsi 'addTicket' dengan data yang sesuai
      addTicket({ title, workshop });
      // Reset form setelah submit
      setTitle('');
      //setUserId('');
      setWorkshop('');
      // setStatus('Belum Dikerjakan');
    } else {
      console.log("Mohon lengkapi semua field.");
    }
  };

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
  // const selectedUser = userOptions.find(option => option.value === userId);
  const selectedWorkshop = workshopOptions.find(option => option.value === workshop);


  // Styling untuk komponen React-Select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#565659", // biru gelap sesuai tema utama
    borderRadius: "10px",
    borderColor: "#949494ff",
    minHeight: "45px",
    fontWeight: 500,
    boxShadow: "none",
    color: "white", // warna teks saat nilai sudah dipilih
    "&:hover": {
      borderColor: "#f2f7f7ff" 
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#c6c7c8ff", // biru muda untuk placeholder
    fontWeight: 500
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#c6c7c8ff",
    fontWeight: 500
  }),
  input: (provided) => ({
    ...provided,
    color: "#c6c7c8ff" // warna teks saat mengetik
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#696b6cff",
    border: "1px solid #cadaf0ff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
  }),
  option: (provided, state) => ({
    ...provided,
    color: "white",
    backgroundColor: state.isFocused ? "#626f81ff" : "transparent",
    "&:active": {
      backgroundColor: "#7592c3ff",
      color: "white"
    }
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: "#adadaeff"
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#aeafb0ff",
    '&:hover': {
      color: "white"
    }
  }),
};

  return (
    <form onSubmit={handleSubmit} className="job-form-user">
      {/* Input untuk Workshop */}
      <Select
        options={workshopOptions}
        onChange={(selected) => setWorkshop(selected ? selected.value : '')}
        value={selectedWorkshop}
        placeholder="Workshop"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-selectuser"
        required
      />

      {/* Select untuk Nama Pekerja */}
      {/* <Select
        options={userOptions}
        onChange={(selected) => setUserId(selected ? selected.value : '')}
        value={selectedUser}
        placeholder="Nama Pekerja"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-selectuser"
        required
      /> */}

      {/* Input untuk Deskripsi */}
      <input
        type="text"
        placeholder="Deskripsi"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-like-selectuser"
      />

      {/* Tombol Tambah */}
      <button type="submit" className="btn-submituser">Tambah</button>
    </form>
  );

}

export default JobFormUser;
