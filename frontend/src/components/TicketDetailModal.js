import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../services/api';

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    // Menggunakan locale 'id' untuk format tanggal Indonesia
    return format(new Date(dateTimeString), 'dd MMM yyyy, HH:mm', { locale: id });
};

function TicketDetailModal({ ticket, onClose }) {
    const [borrowedItems, setBorrowedItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);

    useEffect(() => {
        if (ticket?.id) {
            setIsLoadingItems(true);
            api.get(`/tickets/${ticket.id}/borrowed-items`)
                .then(response => {
                    setBorrowedItems(response.data);
                })
                .catch(error => {
                    console.error("Gagal mengambil data barang pinjaman:", error);
                    setBorrowedItems([]); // Kosongkan jika gagal
                })
                .finally(() => {
                    setIsLoadingItems(false);
                });
        }
    }, [ticket]);

    if (!ticket) return null;

    const formatWorkTime = (t) => {
        if (t.started_at && t.completed_at) {
            return `${format(new Date(t.started_at), 'HH:mm')} - ${format(new Date(t.completed_at), 'HH:mm')}`;
        }
        if (t.started_at) {
            return `Mulai: ${format(new Date(t.started_at), 'HH:mm')}`;
        }
        if (t.requested_date && t.requested_time) {
            return `Diminta: ${format(new Date(t.requested_date), 'dd MMM')}, ${t.requested_time}`;
        }
        return 'Jadwal Fleksibel';
    };

    const handleWhatsAppChat = () => {
        const phone = ticket.creator?.phone;
        if (!phone) return;

        // Format nomor: hilangkan karakter non-digit, ganti '0' di depan dengan '62'
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }

        const url = `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3>Detail Tiket: {ticket.kode_tiket || 'N/A'}</h3>
                </div>

                <div className="modal-body-detail">
                    {/* Deskripsi (full-width) */}
                    <div className="detail-item-full" data-span="2">
                        <span className="label">Deskripsi Pekerjaan</span>
                        <span className="value">{ticket.title}</span>
                    </div>

                    {/* Grid untuk item lainnya */}
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Pengirim</span>
                            <span className="value">{ticket.creator ? ticket.creator.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Dikerjakan Oleh</span>
                            <span className="value">{ticket.user ? ticket.user.name : '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Workshop</span>
                            <span className="value">{ticket.workshop ? ticket.workshop.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Tanggal Dibuat</span>
                            <span className="value">{formatDateTime(ticket.created_at)}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Waktu Pengerjaan</span>
                            <span className="value">{formatWorkTime(ticket)}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Mulai Dikerjakan</span>
                            <span className="value">{formatDateTime(ticket.started_at)}</span>
                        </div>
                    </div>

                    {/* Item full-width lainnya di luar grid */}
                    <div className="detail-item-full" data-span="2">
                        <span className="label">Selesai Dikerjakan</span>
                        <span className="value">{formatDateTime(ticket.completed_at)}</span>
                    </div>

                    {ticket.status === 'Selesai' && ticket.proof_description && (
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Bukti Pekerjaan</span>
                            <p className="value">{ticket.proof_description}</p>
                            {ticket.proof_image_url && (
                                <div className="proof-image-container">
                                    <a href={ticket.proof_image_url} target="_blank" rel="noopener noreferrer">
                                        <img src={ticket.proof_image_url} alt="Bukti Pengerjaan" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="detail-item-full" data-span="2">
                        <span className="label">Status</span>
                        <span className={`value status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                    </div>

                    <div className="detail-item-full" data-span="2">
                        <span className="label">Barang yang Dipinjam</span>
                        {isLoadingItems ? (
                            <p className="value">Memuat data barang...</p>
                        ) : borrowedItems.length > 0 ? (
                            <ul className="borrowed-items-list">
                                {borrowedItems.map(item => (
                                    <li key={item.id}>
                                        {/* Menampilkan detail per unit barang */}
                                        <span className="tool-name">{item.master_barang.nama_barang}</span>
                                        <span className="tool-quantity">({item.kode_unik})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="value">Tidak ada barang yang dipinjam untuk tiket ini.</p>
                        )}
                    </div>

                </div>
                <div className="modal-footer-user" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onClose} className="btn-tutup-user">Tutup</button>
                    {ticket.creator && ticket.creator.phone && (
                        <button onClick={handleWhatsAppChat} className="btn-whatsapp">
                            <i className="fab fa-whatsapp" style={{ marginRight: '8px' }}></i>
                            Chat Pengirim
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicketDetailModal;