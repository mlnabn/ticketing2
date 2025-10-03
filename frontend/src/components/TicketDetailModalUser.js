import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return format(new Date(dateTimeString), 'dd MMM yyyy, HH:mm', { locale: id });
};

function TicketDetailModalUser({ ticket, onClose }) {
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

    return (
        <div className="modal-backdrop-detail-user">
            <div className="modal-content-detail-user">
                <div className="modal-header-detail-user">
                    <h3>Detail Tiket: {ticket.kode_tiket || 'N/A'}</h3>
                </div>

                <div className="modal-body-detail-user">
                    {/* [DIUBAH] Menggunakan struktur standar 'detail-item-full-user' */}
                    <div className="detail-item-full-user">
                        <span className="label">Deskripsi Pekerjaan</span>
                        <span className="value">{ticket.title}</span>
                    </div>

                    <div className="detail-grid-section-user">
                        <div className="detail-item-full-user">
                            <span className="label">Pengirim</span>
                            <span className="value">{ticket.creator ? ticket.creator.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Dikerjakan Oleh</span>
                            <span className="value">{ticket.user ? ticket.user.name : '-'}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Workshop</span>
                            <span className="value">{ticket.workshop ? ticket.workshop.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Tanggal Dibuat</span>
                            <span className="value">{formatDateTime(ticket.created_at)}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Waktu Pengerjaan</span>
                            <span className="value">{formatWorkTime(ticket)}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Mulai Dikerjakan</span>
                            <span className="value">{formatDateTime(ticket.started_at)}</span>
                        </div>
                        <div className="detail-item-full-user">
                            <span className="label">Selesai Dikerjakan</span>
                            <span className="value">{formatDateTime(ticket.completed_at)}</span>
                        </div>
                    </div>

                    {/* [DIUBAH] Bagian Bukti Pekerjaan menggunakan struktur standar */}
                    {ticket.status === 'Selesai' && ticket.proof_description && (
                        <div className="detail-item-full-user">
                            <span className="label">Bukti Pengerjaan</span>
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
                    
                    {/* [DIUBAH] Status dipindahkan ke sini agar full-width dan rapi */}
                    <div className="detail-item-full-user">
                        <span className="label">Status</span>
                        <span className={`value status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                    </div>

                </div>
                <div className="modal-footer-user">
                    <button onClick={onClose} className="btn-tutup-user">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default TicketDetailModalUser;