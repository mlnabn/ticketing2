// JobList.js

import React from 'react';

// Terima props `jobs` dan `updateJobStatus` dari App.js
function JobList({ jobs, updateJobStatus }) {
  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'status-selesai';
    if (status === 'Sedang Dikerjakan') return 'status-sedang';
    return 'status-belum';
  };

  return (
    <div>
      <h2>Daftar Pekerjaan</h2>
      <table className="job-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Pekerja</th>
            <th>Nama Pekerjaan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {/* Pastikan `jobs` tidak kosong sebelum di-map */}
          {jobs && jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              {/* Akses nama pekerja dari relasi yang dikirim Laravel */}
              <td>{job.worker ? job.worker.name : 'N/A'}</td>
              <td>{job.title}</td>
              <td>
                <span className={`status ${getStatusClass(job.status)}`}>
                  {job.status}
                </span>
              </td>
              <td>
                {/* Tombol akan memanggil fungsi `updateJobStatus` dengan parameter yang sesuai */}
                {job.status === 'Sedang Dikerjakan' && (
                  <button onClick={() => updateJobStatus(job.id, 'Selesai')} className="btn-finish">
                    Selesaikan
                  </button>
                )}
                
                {job.status === 'Belum Dikerjakan' && (
                  <button onClick={() => updateJobStatus(job.id, 'Sedang Dikerjakan')} className="btn-start">
                    Mulai Kerjakan
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;