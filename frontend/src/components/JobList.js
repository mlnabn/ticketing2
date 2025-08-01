// JobList.js
import React from 'react';

function JobList({ jobs, selesaikanPekerjaan, mulaiPekerjaan }) {
  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'status-selesai';
    if (status === 'Sedang Dikerjakan') return 'status-sedang';
    return 'status-belum';
  };

  return (
    <div>
      <h2>Daftar Pekerjaan</h2>
      {/* Ganti tabel dengan className */}
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
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.namaPekerja}</td>
              <td>{job.namaPekerjaan}</td>
              <td>
                {/* Tambahkan span dengan className dinamis untuk status */}
                <span className={`status ${getStatusClass(job.status)}`}>
                  {job.status}
                </span>
              </td>
              <td>
                {job.status === 'Sedang Dikerjakan' && (
                  <button onClick={() => selesaikanPekerjaan(job.id)} className="btn-finish">
                    Selesaikan
                  </button>
                )}
                
                {job.status === 'Belum Dikerjakan' && (
                  <button onClick={() => mulaiPekerjaan(job.id)} className="btn-start">
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