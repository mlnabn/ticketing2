import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../services/api';

// Terima prop 'addTicket'
function JobFormUser({ addTicket }) {
  const [title, setTitle] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [requestedTime, setRequestedTime] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await api.get('/workshops');
        
        // --- PERBAIKAN DI SINI ---
        const dataArray = response.data.data || response.data;
        if (Array.isArray(dataArray)) {
          const options = dataArray.map(ws => ({
            value: ws.id,
            label: ws.name,
          }));
          setWorkshopOptions(options);
        } else {
          console.error("Data workshop yang diterima bukan array:", dataArray);
          setWorkshopOptions([]);
        }

      } catch (error) {
        console.error("Gagal mengambil daftar workshop:", error);
      } finally {
        setIsLoadingWorkshops(false);
      }
    };
    fetchWorkshops();
  }, []);

  const handleFlexibleChange = (e) => {
    const checked = e.target.checked;
    setIsFlexible(checked);
    if (checked) {
      setRequestedDate('');
      setRequestedTime('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi: title dan workshop selalu wajib
    if (!title || !workshopId) {
      alert("Mohon lengkapi Workshop dan Deskripsi.");
      return;
    }
    // Validasi: jika tidak fleksibel, tanggal & waktu wajib diisi
    if (!isFlexible && (!requestedDate || !requestedTime)) {
      alert("Mohon lengkapi Tanggal dan Waktu, atau centang 'Jadwal Fleksibel'.");
      return;
    }

    addTicket({
      title,
      workshop_id : workshopId,
      requested_time: isFlexible ? null : requestedTime,
      requested_date: isFlexible ? null : requestedDate
    });

    // Reset form
    setTitle('');
    setWorkshopId('');
    setRequestedTime('');
    setRequestedDate('');
    setIsFlexible(false);
  };

  const selectedWorkshop = workshopOptions.find(option => option.value === workshopId);

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#565659", 
      borderRadius: "10px",
      borderColor: "#949494ff",
      minHeight: "45px",
      fontWeight: 500,
      boxShadow: "none",

      color: "white",

      "&:hover": {
        borderColor: "#f2f7f7ff"
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#c6c7c8ff", // biru muda untuk placeholder
      textAlign: 'center',
      fontWeight: 500

    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#c6c7c8ff",
      textAlign: 'center',
      fontWeight: 500
    }),
    input: (provided) => ({
      ...provided,
      textAlign: 'center',
      color: "#c6c7c8ff" // warna teks saat mengetik

    }),
    valueContainer: (provided) => ({
      ...provided,
      justifyContent: 'center', // supaya teks tetap di tengah
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

      <div className="row-input">
        <Select
          options={workshopOptions}
          onChange={(selected) => setWorkshopId(selected ? selected.value : '')}
          value={selectedWorkshop}
          placeholder="Workshop"
          isSearchable
          isLoading={isLoadingWorkshops}
          styles={selectStyles}
          classNamePrefix="react-selectuser"
          required
        />
        <div className="time-wrapper">
          <label htmlFor="flexible-schedule">Fleksible</label>
          <input
            type="checkbox"
            id="flexible-schedule"
            checked={isFlexible}
            onChange={handleFlexibleChange}
          />
          <input
            type="time"
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            required={!isFlexible}
            disabled={isFlexible}
            className="input-selectuser"
          />
          <input
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            required={!isFlexible}
            disabled={isFlexible}
            className="input-dateuser"
          />

        </div>

      </div>

      <input
        type="text"
        placeholder="Description"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-like-selectuser"
      />

      {/* Tombol Tambah */}
      <button type="submit" className="btn-submituser">Submit</button>
    </form >
  );

}

export default JobFormUser;
