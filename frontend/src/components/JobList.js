// file: components/JobList.js

import React from 'react';

// Terima prop 'loggedInUserId'
function JobList({ tickets, updateTicketStatus, deleteTicket, loggedInUserId, userRole }) {
  
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
            <th>Deskripsi</th>
            <th>Workshop</th>
            <th>Status</th>
            {userRole !== 'admin' && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tickets) && tickets.map((ticket) => (
            <tr key={ticket.id}>
              {/* ... Kolom lain tidak berubah ... */}
              <td data-label="ID">{ticket.id}</td>
              <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : 'N/A'}</td>
              <td data-label="Deskripsi">{ticket.title}</td>
              <td data-label="Workshop">{ticket.workshop || 'N/A'}</td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                <span className={`status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td data-label="Aksi">
                {/* Gunakan 'loggedInUserId' untuk pengecekan */}
                {loggedInUserId === ticket.user_id && (
                  <>
                    {ticket.status === 'Sedang Dikerjakan' && (
                      <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-finish">Selesaikan</button>
                    )}
                    {ticket.status === 'Belum Dikerjakan' && (
                      <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">Mulai Kerjakan</button>
                    )}
                    {ticket.status === 'Selesai' && (
                      <button onClick={() => deleteTicket(ticket.id)} className="btn-delete">Delete</button>
                    )}
                  </>
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
