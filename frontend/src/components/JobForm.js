import React, { useState } from 'react';
import Select from 'react-select';

// DIUBAH: Terima prop 'addTicket', bukan 'addJob'
function JobForm({ workers, addTicket }) { 
  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [status, setStatus] = useState('Belum Dikerjakan');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && workerId && status) {
      // DIUBAH: Panggil fungsi 'addTicket'
      addTicket({ title, worker_id: workerId, status }); 
      setTitle('');
      setWorkerId('');
      setStatus('Belum Dikerjakan');
    }
  };

  // DITAMBAH: Pengaman jika 'workers' belum berupa array
  const workerOptions = Array.isArray(workers) ? workers.map(worker => ({
    value: worker.id,
    label: worker.name
  })) : [];

  const selectedWorker = workerOptions.find(option => option.value === workerId);

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
        options={workerOptions}
        onChange={(selected) => setWorkerId(selected ? selected.value : '')}
        value={selectedWorker}
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