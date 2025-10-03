import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function JobList({ tickets, updateTicketStatus, deleteTicket, userRole, onSelectionChange, onAssignClick, onRejectClick, onProofClick, showToast, onTicketClick }) {
    const isAdmin = userRole && userRole.toLowerCase() === 'admin';
    const [selectedIds, setSelectedIds] = useState([]);
    useEffect(() => {
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

    // [BARU] Fungsi untuk memotong teks
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };

    // [BARU] Handler untuk klik pada baris, agar tidak bentrok dengan klik pada checkbox atau tombol
    const handleRowClick = (e, ticket) => {
        // Cek apakah yang diklik adalah input, button, atau bagian dari grup tombol
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) {
            return; // Jangan lakukan apa-apa jika klik pada elemen interaktif
        }
        onTicketClick(ticket); // Panggil fungsi untuk membuka modal
    };

    const handleSelectAll = (e) => {
        const newSelectedIds = e.target.checked && tickets ? tickets.map(t => t.id) : [];
        setSelectedIds(newSelectedIds);
        if (onSelectionChange) {
            onSelectionChange(newSelectedIds);
        }
    };

    const renderActionButtons = (ticket) => {
        if (!isAdmin) { return null; }
        switch (ticket.status) {
            case 'Belum Dikerjakan':
                if (!ticket.user) {
                    return (
                        <>
                            <button onClick={() => onAssignClick(ticket)} className="btn-action btn-start">Mulai Kerjakan</button>
                            <button onClick={() => onRejectClick(ticket)} className="btn-action btn-cancel-aksi">Tolak</button>
                        </>
                    );
                }
                // HANYA panggil updateTicketStatus
                return <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-action btn-start">Mulai Kerjakan</button>;
            case 'Sedang Dikerjakan':
                return (
                    <>
                        {/* HAPUS showToast dari sini */}
                        <button onClick={() => updateTicketStatus(ticket.id, 'Selesai')} className="btn-action btn-finish">Selesaikan</button>
                        {/* HAPUS showToast dari sini */}
                        <button onClick={() => updateTicketStatus(ticket.id, 'Ditunda')} className="btn-action btn-pause">Tunda</button>
                    </>
                );
            case 'Ditunda':
                // HAPUS showToast dari sini
                return <button onClick={() => updateTicketStatus(ticket.id, 'Sedang Dikerjakan')} className="btn-action btn-start">Lanjutkan</button>;
            case 'Selesai':
                return (
                    <>
                        {!ticket.proof_description && (
                            <button onClick={() => onProofClick(ticket)} className="btn-action btn-start">Bukti</button>
                        )}
                        <button onClick={() => deleteTicket(ticket)} className="btn-action btn-delete-small">Hapus</button>
                    </>
                );
            case 'Ditolak':
                return <button onClick={() => deleteTicket(ticket)} className="btn-action btn-delete-small">Hapus</button>;
            default:
                return null;
        }
    };

    // Fungsi untuk memformat waktu pengerjaan, agar bisa dipakai di kedua tampilan
    const formatWorkTime = (ticket) => {
        if (ticket.started_at && ticket.completed_at) {
            return `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`;
        }
        if (ticket.started_at) {
            return `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
        }
        if (ticket.requested_date && ticket.requested_time) {
            return `Diminta: ${format(new Date(ticket.requested_date), 'dd MMM')}, ${ticket.requested_time}`;
        }
        if (ticket.requested_date) {
            return `Tgl Diminta: ${format(new Date(ticket.requested_date), 'dd MMM yyyy')}`;
        }
        if (ticket.requested_time) {
            return `Waktu Diminta: ${ticket.requested_time}`;
        }
        return 'Jadwal Fleksibel';
    };


    return (
        <div className="job-list-container">

            {/* ======================================================= */}
            {/* ===    TAMPILAN TABEL UNTUK DESKTOP (TETAP SAMA)    === */}
            {/* ======================================================= */}
            <table className="job-table">
                <thead>
                    <tr>
                        {isAdmin && (<th><input type="checkbox" onChange={handleSelectAll} checked={tickets && tickets.length > 0 && selectedIds.length === tickets.length} /></th>)}
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
                            <tr
                                key={ticket.id}
                                className={`${selectedIds.includes(ticket.id) ? 'selected-row' : ''} clickable-row`}
                                onClick={(e) => handleRowClick(e, ticket)}
                            >
                                {isAdmin && (<td><input type="checkbox" checked={selectedIds.includes(ticket.id)} onChange={() => handleSelect(ticket.id)} /></td>)}
                                <td>{ticket.creator ? ticket.creator.name : 'N/A'}</td>
                                <td>{ticket.user ? ticket.user.name : '-'}</td>
                                <td>{ticket.workshop ? ticket.workshop.name : 'N/A'}</td>
                                <td>
                                    <span className="description-cell">{ticket.title}</span>
                                </td>
                                <td>{format(new Date(ticket.created_at), 'dd MMM yyyy')}</td>
                                <td>{formatWorkTime(ticket)}</td>
                                <td><span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span></td>
                                <td><div className="action-buttons-group">{renderActionButtons(ticket)}</div></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={isAdmin ? 9 : 8}>Tidak ada pekerjaan yang ditemukan.</td></tr>
                    )}
                </tbody>
            </table>

            {/* ======================================================= */}
            {/* ===      TAMPILAN KARTU BARU UNTUK MOBILE           === */}
            {/* ======================================================= */}
            <div className="job-list-mobile">
                {tickets && tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="ticket-card-mobile clickable-row"
                            onClick={(e) => handleRowClick(e, ticket)} // Gunakan handler baru juga di sini
                        >

                            <div className="card-row">
                                <div className="data-group">
                                    <span className="label">Pengirim</span>
                                    <span className="value">{ticket.creator ? ticket.creator.name : 'N/A'}</span>
                                </div>
                                <div className="data-group">
                                    <span className="label">Dikerjakan Oleh</span>
                                    <span className="value">{ticket.user ? ticket.user.name : '-'}</span>
                                </div>
                            </div>

                            <div className="card-row">
                                <div className="data-group single">
                                    <span className="label">Workshop</span>
                                    <span className="value">{ticket.workshop ? ticket.workshop.name : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="card-row">
                                <div className="data-group single">
                                    <span className="label">Deskripsi</span>
                                    <span className="value description">
                                        <span className="description-cell">{ticket.title}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="card-row">
                                <div className="data-group">
                                    <span className="label">Tanggal Dibuat</span>
                                    <span className="value">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</span>
                                </div>
                                <div className="data-group">
                                    <span className="label">Waktu Pengerjaan</span>
                                    <span className="value">{formatWorkTime(ticket)}</span>
                                </div>
                            </div>

                            <div className="card-row status-row">
                                <span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                            </div>

                            <div className="card-row action-row">
                                <div className="action-buttons-group">
                                    {renderActionButtons(ticket)}
                                </div>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <p>Tidak ada pekerjaan yang ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobList;