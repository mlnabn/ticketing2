import React from 'react';
import ReactDOM from 'react-dom'; 
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';

const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: { duration: 0.2 }
    }
};

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

    return ReactDOM.createPortal(
        <motion.div
            className="modal-backdrop-detail-user"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{ zIndex: 99999 }}
        >
            <motion.div
                className="modal-content-detail-user"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header-detail-user">
                    <h3>Detail Tiket: {ticket.kode_tiket || 'N/A'}</h3>
                </div>

                <div className="modal-body-detail-user">
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
                    <div className="detail-item-full-user">
                        <span className="label">Status</span>
                        <span className={`value status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                    </div>

                </div>
                <div className="modal-footer-user">
                    <button onClick={onClose} className="btn-tutup-user">Tutup</button>
                </div>
            </motion.div>
        </motion.div>,
        document.body 
    );
}

export default TicketDetailModalUser;