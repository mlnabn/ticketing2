import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function JobList({ tickets, updateTicketStatus, deleteTicket, userRole, onSelectionChange, onAssignClick, onRejectClick, onProofClick }) {
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
    if (!isAdmin) {
      return null;
    }

    switch (ticket.status) {
      case 'Belum Dikerjakan':
        if (!ticket.user) {
          return (
            <>
              <button onClick={() => onAssignClick(ticket)} className="btn-start">
                Mulai Kerjakan
              </button>
              <button onClick={() => onRejectClick(ticket)} className="btn-cancel-aksi">
                Tolak
              </button>
            </>
          );
        }
        // Jika sudah ditugaskan, tombol ini tetap mengubah status
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
      case 'Selesai':
        return (
          <>
            {!ticket.proof_description && (
              <button onClick={() => onProofClick(ticket)} className="btn-proof">Bukti</button>
            )}
            <button onClick={() => deleteTicket(ticket)} className="btn-cancel-aksi">
              Hapus
            </button>
          </>
        );
      case 'Ditolak':
        return (
          <button onClick={() => deleteTicket(ticket)} className="btn-cancel-aksi">
            Hapus
          </button>
        );  
      default:
        return null;
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
            <th>Dikerjakan Oleh</th>
            <th>Workshop</th>
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
                <td data-label="Nama Pekerja">{ticket.user ? ticket.user.name : '-'}</td>
                <td data-label="Workshop">{ticket.workshop}</td>
                <td data-label="Deskripsi">{ticket.title}</td>
                <td data-label="Tanggal Dibuat">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</td>
                <td data-label="Waktu Pengerjaan">
                  {(() => {
                    if (ticket.started_at && ticket.completed_at) {
                      return `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`;
                    }
                    if (ticket.started_at) {
                      return `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
                    }
                    if (ticket.requested_date && ticket.requested_time) {
                      return `Diminta: ${format(new Date(ticket.requested_date), 'dd MMM yyyy')}, ${ticket.requested_time}`;
                    }
                    if (ticket.requested_date) {
                      return `Tanggal yang Diminta: ${format(new Date(ticket.requested_date), 'dd MMM yyyy')}`;
                    }
                    if (ticket.requested_time) {
                      return `Waktu yang Diminta: ${ticket.requested_time}`;
                    }
                    return 'Jadwal Pengerjaan Fleksibel';
                  })()}
                </td>
                <td data-label="Status">
                  <span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td data-label="Aksi">
                  <div className="action-buttons-group">
                    {renderActionButtons(ticket)}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 9 : 8}>Tidak ada pekerjaan yang ditemukan.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;
