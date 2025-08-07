import React from 'react';

// 1. Terima prop `deleteJob` yang sudah kita buat di App.js
function JobList({ tickets, updateTicketStatus, deleteTicket }) {
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
          {tickets && tickets.map((tickets) => (
            <tr key={tickets.id}>
              <td data-label="ID">{tickets.id}</td>
              <td data-label="Nama Pekerja">{tickets.user ? tickets.user.name : 'N/A'}</td>
              <td data-label="Nama Pekerjaan">{tickets.title}</td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(tickets.status)}`}>
                  {tickets.status}
                </span>
              </td>
              <td data-label="Aksi">
                {tickets.status === 'Sedang Dikerjakan' && (
                  <button onClick={() => updateTicketStatus(tickets.id, 'Selesai')} className="btn-finish">
                    Selesaikan
                  </button>
                )}
                
                {tickets.status === 'Belum Dikerjakan' && (
                  <button onClick={() => updateTicketStatus(tickets.id, 'Sedang Dikerjakan')} className="btn-start">
                    Mulai Kerjakan
                  </button>
                )}

                {/* 2. Tambahkan tombol Hapus dari kode teman Anda */}
                {tickets.status === 'Selesai' && (
                  <button
                    onClick={() => deleteTicket(tickets.id)}
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