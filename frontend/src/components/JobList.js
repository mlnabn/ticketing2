import React from 'react';

// 1. Terima prop `deleteJob` yang sudah kita buat di App.js
function JobList({ jobs, updateJobStatus, deleteJob }) {
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
          {jobs && jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              {/* 3. Tetap gunakan struktur data dari API */}
              <td>{job.worker ? job.worker.name : 'N/A'}</td>
              <td>{job.title}</td>
              <td>
                <span className={`status ${getStatusClass(job.status)}`}>
                  {job.status}
                </span>
              </td>
              <td>
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

                {/* 2. Tambahkan tombol Hapus dari kode teman Anda */}
                {job.status === 'Selesai' && (
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="btn-delete"
                  >
                    🗑️ Delete
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