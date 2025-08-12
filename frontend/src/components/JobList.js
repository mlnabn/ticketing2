import React, { useState, useEffect } from 'react';

function JobList({ tickets, updateTicketStatus, deleteTicket, loggedInUserId, userRole, onSelectionChange }) {
  // State lokal di dalam JobList untuk melacak ID tiket yang dipilih
  const [selectedTickets, setSelectedTickets] = useState([]);

  // Efek untuk mereset pilihan setiap kali daftar tiket berubah (misal: pindah halaman)
  useEffect(() => {
    setSelectedTickets([]);
  }, [tickets]);

  // Efek untuk mengirim daftar ID yang dipilih ke komponen induk (App.js)
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedTickets);
    }
  }, [selectedTickets, onSelectionChange]);

  // Handler untuk checkbox "Pilih Semua"
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allTicketIds = tickets.map(t => t.id);
      setSelectedTickets(allTicketIds);
    } else {
      setSelectedTickets([]);
    }
  };

  // Handler untuk checkbox per baris
  const handleSelectSingle = (e, ticketId) => {
    if (e.target.checked) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  // Helper function untuk styling status
  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'status-selesai';
    if (status === 'Sedang Dikerjakan') return 'status-sedang';
    if (status === 'Ditunda') return 'status-ditunda'; 
    return 'status-belum';
  };

  return (
    <div className="job-list">
      <h2>Daftar Pekerjaan</h2>
      <table className="job-table">
        <thead>
          <tr>
            {/* Kolom checkbox hanya muncul untuk admin */}
            {userRole === 'admin' && (
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  // Centang "Pilih Semua" jika semua tiket di halaman ini sudah dipilih
                  checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                />
              </th>
            )}
            <th>Pengirim</th>
            <th>Nama Pekerja</th>
            <th>Deskripsi</th>
            <th>Workshop</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tickets) && tickets.map((ticket) => (
            // Beri class 'selected-row' jika baris ini dipilih
            <tr key={ticket.id} className={selectedTickets.includes(ticket.id) ? 'selected-row' : ''}>
              {/* Kolom checkbox per baris hanya untuk admin */}
              {userRole === 'admin' && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={(e) => handleSelectSingle(e, ticket.id)}
                  />
                </td>
              )}
              <td data-label="Pengirim">{ticket.creator ? ticket.creator.name : 'N/A'}</td>
              <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : 'N/A'}</td>
              <td data-label="Deskripsi">{ticket.title}</td>
              <td data-label="Workshop">{ticket.workshop || 'N/A'}</td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(ticket.status)}`}> 
                  {ticket.status}
                </span>
              </td>
              <td data-label="Aksi">
                <div className="action-buttons-group">
                  {/* Logika Aksi untuk Admin */}
                  {userRole === 'admin' && (
                    <button onClick={() => deleteTicket(ticket)} className="btn-delete">
                      Delete
                    </button>
                  )}
                  
                  {/* Logika Aksi untuk User Biasa */}
                  {userRole !== 'admin' && loggedInUserId === ticket.user_id && (
                    <>
                      {(ticket.status === 'Belum Dikerjakan' || ticket.status === 'Ditunda') && (
                        <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
                          Mulai Kerjakan
                        </button>
                      )}
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
                      {ticket.status === 'Selesai' && (
                        <button onClick={() => deleteTicket(ticket)} className="btn-delete">
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;