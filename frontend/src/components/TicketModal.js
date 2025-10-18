import React from 'react';
import { format } from 'date-fns';

function TicketModal({
    show,
    tickets = [],
    date,
    isDarkMode,
    onClose,
    onTicketClick
}) {
    if (!show || tickets.length === 0) return null;

    return (
        <div className={`modal-overlay2 ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className={`modal-content2 ${isDarkMode ? 'dark-mode' : ''}`}>
                <div className={`modal-header ${isDarkMode ? 'dark-mode' : ''}`}>
                    <h3 className="modal-title">
                        Tiket untuk {format(date, 'dd MMM yyyy')}
                    </h3>
                </div>

                <div className={`modal-body ${isDarkMode ? 'dark-mode' : ''}`}>
                    {tickets.map((ticket, index) => (
                        <div
                            key={index}
                            className={`ticket-modal-card ${isDarkMode ? 'dark-mode' : ''} status-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}
                            onClick={() => {
                                if (onTicketClick) onTicketClick(ticket.id);
                                onClose();
                            }}
                        >
                            <p><b>Pengirim:</b> {ticket.creator?.name}</p>
                            <p><b>Workshop:</b> {ticket.workshop?.name}</p>
                            <p className="description-cell"><b>Deskripsi:</b> {ticket.title}</p>
                            <p><b>Status:</b> {ticket.status}</p>
                        </div>
                    ))}
                </div>

                <div className={`modal-footer ${isDarkMode ? 'dark-mode' : ''}`}>
                    <button
                        className={`btn-canceluser ${isDarkMode ? 'dark-mode' : ''}`}
                        onClick={onClose}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TicketModal;
