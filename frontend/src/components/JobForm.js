import React, { useState } from 'react';
import Select from 'react-select';

function JobForm({ workers, addJob }) {
  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [status, setStatus] = useState('Belum Dikerjakan');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && workerId && status) {
      addJob({ title, worker_id: workerId, status });
      setTitle('');
      setWorkerId('');
      setStatus('Belum Dikerjakan');
    }
  };

  const workerOptions = workers.map(worker => ({
    value: worker.id,
    label: worker.name
  }));

  const selectedWorker = workerOptions.find(option => option.value === workerId);

  // Styling react-select
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
      
      {/* Dropdown pekerja */}
      <Select
        options={workerOptions}
        onChange={(selected) => setWorkerId(selected.value)}
        value={selectedWorker}
        placeholder="Pilih Pekerja"
        isSearchable
        styles={selectStyles}
        classNamePrefix="react-select"
        required
      />

      {/* Input nama pekerjaan */}
      <input
        type="text"
        placeholder="Nama Pekerjaan"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-like-select"
      />

      {/* Dropdown status */}
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
