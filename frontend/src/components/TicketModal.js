import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

    const handleCloseClick = () => {
        if (onClose) {
            onClose(); 
        }
    };
    
    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`modal-overlay2 ${isDarkMode ? 'dark-mode' : ''} ${animationClass}`}
            onClick={handleCloseClick}
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
                                handleCloseClick();
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
                        onClick={handleCloseClick}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TicketModal;
