import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function JobList({ tickets, updateTicketStatus, deleteTicket, loggedInUserId, userRole, onSelectionChange }) {
  // State untuk melacak tiket yang dipilih
  const [selectedTickets, setSelectedTickets] = useState([]);

  // Efek untuk mereset pilihan setiap kali daftar tiket utama berubah
  useEffect(() => {
    setSelectedTickets([]);
  }, [tickets]);

  // Efek untuk mengirim perubahan state ke parent (App.js)
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
            {userRole === 'admin' && (
              <th>
                {/* Nama header untuk checkbox */}
                select
                <br />
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                />
              </th>
            )}
            <th>Pengirim</th>
            <th>Nama Pekerja</th>
            <th>Deskripsi</th>
            <th>Tanggal Dibuat</th>
            <th>Waktu Pengerjaan</th>
            <th>Status</th>
            {userRole !== 'admin' && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tickets) && tickets.map((ticket) => (
            <tr key={ticket.id} className={selectedTickets.includes(ticket.id) ? 'selected-row' : ''}>
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
              <td data-label="Tanggal Dibuat">
                {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: id })}
              </td>
              <td data-label="Waktu Pengerjaan">
                {ticket.started_at ? `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}` : '-'}
                {ticket.completed_at && <><br />{`Selesai: ${format(new Date(ticket.completed_at), 'HH:mm')}`}</>}
              </td>
              <td data-label="Status">
                <span className={`status ${getStatusClass(ticket.status)}`}> 
                  {ticket.status}
                </span>
              </td>
              
              {userRole !== 'admin' && (
                <td data-label="Aksi">
                  <div className="action-buttons-group">
                    {loggedInUserId === ticket.user_id && (
                      <>
                        {(ticket.status === 'Belum Dikerjakan' || ticket.status === 'Ditunda') && (
                          <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">Mulai Kerjakan</button>
                        )}
                        {ticket.status === 'Sedang Dikerjakan' && (
                          <>
                            <button onClick={() => updateTicketStatus(ticket.id, 'Ditunda')} className="btn-pause">Tunda</button>
                            <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-finish">Selesaikan</button>
                          </>
                        )}
                        {ticket.status === 'Selesai' && (
                          <button onClick={() => deleteTicket(ticket)} className="btn-delete">Delete</button>
                        )}
                      </>
                    )}
                  </div>
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