import React from 'react';

// Terima prop `tickets`, `updateTicketStatus`, dan `deleteTicket`
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
            <th>Workshop</th> {/* Kolom Workshop dipindahkan */}
            <th>Deskripsi</th> {/* Kolom Deskripsi dipindahkan */}
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {/* Pastikan tickets adalah array dan map di atasnya */}
          {Array.isArray(tickets) && tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td data-label="ID">{ticket.id}</td>
              {/* Pastikan ticket.user ada sebelum mengakses propertinya */}
              <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : 'N/A'}</td>
              {/* Menampilkan data workshop dari ticket */}
              <td data-label="Workshop">{ticket.workshop || 'N/A'}</td>
              <td data-label="Deskripsi">{ticket.title}</td> {/* Data Deskripsi */}
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

                {/* Tombol "Mulai Kerjakan" untuk "Belum Dikerjakan" dihapus */}
                {/* {ticket.status === 'Belum Dikerjakan' && (
                  <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
                    Mulai Kerjakan
                  </button>
                )} */}

                {ticket.status === 'Selesai' && (
                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    className="btn-delete"
                  >
                    Delete
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
