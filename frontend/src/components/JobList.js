import React from 'react';

// Terima prop 'loggedInUserId'
function JobList({ tickets, updateTicketStatus, deleteTicket, loggedInUserId, userRole }) {
  
  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'status-selesai';
    if (status === 'Sedang Dikerjakan') return 'status-sedang';
    // PERUBAHAN: Tambahkan class untuk status 'Ditunda'
    if (status === 'Ditunda') return 'status-ditunda'; 
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
            <th>Deskripsi</th>
            <th>Workshop</th>
            <th>Status</th>
            {/* Kolom Aksi hanya muncul untuk user, sesuai logika Anda */}
            {userRole !== 'admin' && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tickets) && tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td data-label="ID">{ticket.id}</td>
              <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : 'N/A'}</td>
              <td data-label="Deskripsi">{ticket.title}</td>
              <td data-label="Workshop">{ticket.workshop || 'N/A'}</td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(ticket.status)}`}> 
                  {ticket.status}
                </span>
              </td>
              
              {/* PERUBAHAN UTAMA ADA DI DALAM BAGIAN INI */}
              {userRole !== 'admin' && (
                <td data-label="Aksi">
                  {/* Tombol hanya muncul jika user yang login adalah yang ditugaskan */}
                  {loggedInUserId === ticket.user_id && (
                    <div className="action-buttons-group">
                      {/* Tombol 'Mulai Kerjakan' untuk status 'Belum Dikerjakan' ATAU 'Ditunda' */}
                      {(ticket.status === 'Belum Dikerjakan' || ticket.status === 'Ditunda') && (
                        <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
                          Mulai Kerjakan
                        </button>
                      )}
                      
                      {/* Tampilkan DUA tombol untuk status 'Sedang Dikerjakan' */}
                      {ticket.status === 'Sedang Dikerjakan' && (
                        <>
                          <button onClick={() => updateTicketStatus(ticket.id, 'Ditunda')} className="btn-pause">
                            Tunda
                          </button>
                          <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-finish">
                            Selesaikan
                          </button>
                        </>
                      )}
                      
                      {/* Tombol 'Delete' untuk status 'Selesai' */}
                      {ticket.status === 'Selesai' && (
                        <button onClick={() => deleteTicket(ticket.id)} className="btn-delete">
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;