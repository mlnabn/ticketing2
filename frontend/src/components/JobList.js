import React from 'react';

function JobList({ jobs, selesaikanPekerjaan }) {
  return (
    <div>
      <h2>Daftar Pekerjaan</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              <td>{job.status}</td>
              <td>
                {job.status === 'Sedang Dikerjakan' && (
                  <button onClick={() => selesaikanPekerjaan(job.id)}>
                    Selesaikan
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
