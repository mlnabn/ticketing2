import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../services/api';

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    // Menggunakan locale 'id' untuk format tanggal Indonesia
    return format(new Date(dateTimeString), 'dd MMM yyyy, HH:mm', { locale: id });
};

const formatWorkTime = (ticket) => {
    if (ticket.started_at && ticket.completed_at) return `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`;
    // if (ticket.started_at) return `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
    if (ticket.requested_date && ticket.requested_time) return `Diminta: ${format(new Date(ticket.requested_date), 'dd MMM')}, ${ticket.requested_time}`;
    if (ticket.requested_date) return `Tgl Diminta: ${format(new Date(ticket.requested_date), 'dd MMM yyyy')}`;
    if (ticket.requested_time) return `Waktu Diminta: ${ticket.requested_time}`;
    return 'Jadwal Fleksibel';
};

function TicketDetailModal({ show, ticket, onClose }) {
    const [borrowedItems, setBorrowedItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(true);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentTicket, setCurrentTicket] = useState(ticket); 

    useEffect(() => {
        if (show) {
            setCurrentTicket(ticket);
            setShouldRender(true);
            setIsClosing(false); 
        } else if (shouldRender && !isClosing) {
            setIsClosing(true); 
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
            }, 300); 
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, ticket, shouldRender]);

    useEffect(() => {
        if (show && ticket?.id) {
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
    }, [show, ticket]);

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    if (!shouldRender) return null;
    if (!currentTicket) return null;

    const handleWhatsAppChat = () => {
        const phone = currentTicket.creator?.phone;
        if (!phone) return;

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }

        const url = `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`modal-backdrop-detail ${animationClass}`}
            onClick={handleCloseClick}
        >
            <div 
                className={`modal-content-detail ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-detail">   
                    <h3><strong>Detail Tiket: </strong>{currentTicket.kode_tiket || 'N/A'}</h3>
                    <p className="modal-creation-date">
                        {formatDateTime(currentTicket.created_at)}
                    </p>
                </div>

                <div className="modal-body-detail">
                    

                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Pengirim</span>
                            <span className="value">{currentTicket.creator ? currentTicket.creator.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Dikerjakan Oleh</span>
                            <span className="value">{currentTicket.user ? currentTicket.user.name : '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Workshop</span>
                            <span className="value">{currentTicket.workshop ? currentTicket.workshop.name : 'N/A'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Waktu Pengerjaan</span>
                            <span className="value">{formatWorkTime(currentTicket)}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Mulai Dikerjakan</span>
                            <span className="value">{formatDateTime(currentTicket.started_at)}</span>
                        </div>
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Selesai Dikerjakan</span>
                            <span className="value">{formatDateTime(currentTicket.completed_at)}</span>
                        </div>
                    </div>

                    <div className="detail-item-full" data-span="2">
                        <span className="label">Deskripsi Pekerjaan</span>
                        <span className="value">{currentTicket.title}</span>
                    </div>                    

                    <div className="detail-item-full" data-span="2">
                        <span className="label">Status</span>
                        <span className={`value status-badge status-${currentTicket.status.toLowerCase().replace(/\s+/g, '-')}`}>{currentTicket.status}</span>
                    </div>

                    {currentTicket.status === 'Selesai' && currentTicket.proof_description && (
                        <div className="detail-item-full" data-span="2">
                            <span className="label" style={{ color: '#0d6efd', fontStyle: 'italic', fontWeight: 'bold' }}>Bukti Pekerjaan</span>
                            <p className="value">{currentTicket.proof_description}</p>
                            {currentTicket.proof_image_url && (
                                <div className="proof-image-container">
                                    <a href={currentTicket.proof_image_url} target="_blank" rel="noopener noreferrer">
                                        <img src={currentTicket.proof_image_url} alt="Bukti Pengerjaan" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTicket.status === 'Ditolak' && currentTicket.rejection_reason && (
                        <div className="detail-item-full" data-span="2">
                            <span className="label" style={{ color: '#dc3545', fontStyle: 'italic', fontWeight: 'bold' }}>Alasan Penolakan</span>
                            <p className="value">
                                {currentTicket.rejection_reason}
                            </p>
                        </div>
                    )}

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
                    <button onClick={handleCloseClick} className="btn-cancel">Tutup</button>
                    {currentTicket.creator && currentTicket.creator.phone && (
                        <button onClick={handleWhatsAppChat} className="btn-history">
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