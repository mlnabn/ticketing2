import React from 'react';

// 1. Terima prop `deleteJob` yang sudah kita buat di App.js
function JobList({ tickets, updateTicketStatus, deleteTicket }) {
  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'status-selesai';
    if (status === 'Sedang Dikerjakan') return 'status-sedang';
    return 'status-belum';
  };

  return (
    <div className="mt-6"> {/* Tambahkan margin atas */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Daftar Pekerjaan</h2>
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
          {tickets && tickets.map((ticket) => ( // Perbaikan nama variabel dari 'tickets' menjadi 'ticket'
            <tr key={ticket.id}>
              <td data-label="ID">{ticket.id}</td>
              <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : 'N/A'}</td>
              <td data-label="Nama Pekerjaan">{ticket.title}</td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td data-label="Aksi">
                {ticket.status === 'Sedang Dikerjakan' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-finish">
                    Selesaikan
                  </button>
                )}
                
                {ticket.status === 'Belum Dikerjakan' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
                    Mulai Kerjakan
                  </button>
                )}

                {/* 2. Tambahkan tombol Hapus dari kode teman Anda */}
                {ticket.status === 'Selesai' && (
                  <button
                    onClick={() => deleteTicket(ticket.id)}
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
