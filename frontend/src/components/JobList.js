import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function JobList({ tickets, updateTicketStatus, deleteTicket, userRole, onSelectionChange }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';

  useEffect(() => {
    // Setiap kali tiket berubah, reset pilihan
    setSelectedIds([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [tickets, onSelectionChange]);

  const handleSelect = (id) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(ticketId => ticketId !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };

  const handleSelectAll = (e) => {
    const newSelectedIds = e.target.checked && tickets ? tickets.map(t => t.id) : [];
    setSelectedIds(newSelectedIds);
    if (onSelectionChange) {
      onSelectionChange(newSelectedIds);
    }
  };

  const renderActionButtons = (ticket) => {
    // Fungsi ini sekarang menangani semua tombol aksi untuk Admin
    if (!isAdmin) {
      return null;
    }

    switch (ticket.status) {
      case 'Belum Dikerjakan':
        return (
          <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
            Mulai Kerjakan
          </button>
        );
      case 'Sedang Dikerjakan':
        return (
          <>
            <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-finish">
              Selesaikan
            </button>
            <button onClick={() => updateTicketStatus(ticket.id, 'Ditunda')} className="btn-pause">
              Tunda
            </button>
          </>
        );
      case 'Ditunda':
        return (
          <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-start">
            Lanjutkan
          </button>
        );
      default:
        return null; // Tidak ada tombol untuk status lain
    }
  };

  return (
    <div className="job-list-container">
      <table className="job-table">
        <thead>
          <tr>
            {isAdmin && (
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={tickets && tickets.length > 0 && selectedIds.length === tickets.length}
                />
              </th>
            )}
            <th>Pengirim</th>
            <th>Nama Pekerja</th>
            <th>Deskripsi</th>
            <th>Tanggal Dibuat</th>
            <th>Waktu Pengerjaan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tickets && tickets.length > 0 ? (
            tickets.map(ticket => (
              <tr key={ticket.id} className={selectedIds.includes(ticket.id) ? 'selected-row' : ''}>
                {isAdmin && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ticket.id)}
                      onChange={() => handleSelect(ticket.id)}
                    />
                  </td>
                )}
                <td data-label="Pengirim">{ticket.creator ? ticket.creator.name : 'N/A'}</td>
                <td data-label="Nama Pekerja">{ticket.user.name}</td>
                <td data-label="Deskripsi">{ticket.title}</td>
                <td data-label="Tanggal Dibuat">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</td>
                <td data-label="Waktu Pengerjaan">
                  {ticket.started_at && ticket.completed_at
                    ? `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`
                    : ticket.started_at ? `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}` : '-'}
                </td>
                <td data-label="Status">
                  <span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td data-label="Aksi">
                  <div className="action-buttons-group">
                    {/* Memanggil fungsi render yang sudah diperbaiki */}
                    {renderActionButtons(ticket)}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 8 : 7}>Tidak ada pekerjaan yang ditemukan.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;
