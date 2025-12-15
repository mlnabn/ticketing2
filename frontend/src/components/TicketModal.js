import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

function TicketModal({
    show,
    tickets = [],
    date,
    isDarkMode,
    onClose,
    onTicketClick
}) {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const handleClose = useModalBackHandler(show, onClose, 'ticket');

    useEffect(() => {
        if (show) {
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
    }, [show, shouldRender]);

    if (!shouldRender || tickets.length === 0) return null;


    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-overlay2 ${isDarkMode ? 'dark-mode' : ''} ${animationClass}`}
            onClick={handleClose}
        >
            <div
                className={`modal-content2 ${isDarkMode ? 'dark-mode' : ''} ${animationClass}`}
                onClick={(e) => e.stopPropagation()}
            >
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
                                if (onClose) onClose();
                            }}
                        >
                            <p>
                                <b>Pengirim:</b>{' '}
                                <span className={`status-highlight status-color-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
                                    {ticket.creator?.name}
                                </span>
                            </p>
                            <p>
                                <b>Workshop:</b>{' '}
                                <span className={`status-highlight status-color-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
                                    {ticket.workshop?.name}
                                </span>
                            </p>
                            <p className="description-cell">
                                <b>Deskripsi:</b>{' '}
                                <span className={`status-highlight status-color-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
                                    {ticket.title}
                                </span>
                            </p>
                            <p>
                                <b>Status:</b>{' '}
                                <span className={`ticket-status-text status-color-${ticket.status.toLowerCase().replace(/\s/g, '-')}`}>
                                    {ticket.status}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>

                <div className={`modal-footer ${isDarkMode ? 'dark-mode' : ''}`}>
                    <button
                        className={`btn-canceluser ${isDarkMode ? 'dark-mode' : ''}`}
                        onClick={handleClose}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TicketModal;
