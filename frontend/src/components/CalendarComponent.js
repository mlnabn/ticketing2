import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

function CalendarComponent({ tickets = [], onTicketClick }) {
  const [date, setDate] = useState(new Date());
  const [ticketsForDate, setTicketsForDate] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);

  // Sync dark mode dari localStorage
  useEffect(() => {
    const updateModeFromStorage = () => {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        setIsDarkMode(JSON.parse(savedMode));
      }
    };
    updateModeFromStorage();
    window.addEventListener('storage', updateModeFromStorage);
    return () => {
      window.removeEventListener('storage', updateModeFromStorage);
    };
  }, []);

  // Update data tiket awal
  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setTicketsForDate([]);
      return;
    }
    const formatted = format(date, 'yyyy-MM-dd');
    const filtered = tickets.filter(
      (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === formatted
    );
    setTicketsForDate(filtered);
  }, [tickets, date]);

  // Klik tanggal
  const handleDayClick = (clickedDate) => {
    const formatted = format(clickedDate, 'yyyy-MM-dd');
    const filtered = tickets.filter(
      (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === formatted
    );
    setSelectedTickets(filtered);
    setShowModal(filtered.length > 0);
    setDate(clickedDate);
  };

  // Render titik di kalender
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayTickets = tickets.filter(
        (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === formattedDate
      );

      if (dayTickets.length > 0) {
        const hasCompleted = dayTickets.some((t) => t.status === 'Selesai');
        const hasInProgress = dayTickets.some((t) => t.status === 'Sedang Dikerjakan');
        const hasPending = dayTickets.some((t) => t.status === 'Belum Dikerjakan');
        const hasDelayed = dayTickets.some((t) => t.status === 'Ditunda');
        const hasRejected = dayTickets.some((t) => t.status === 'Ditolak');

        return (
          <div className="ticket-dot-wrapper">
            {hasCompleted && <span className="ticket-dot dot-green"></span>}
            {hasInProgress && <span className="ticket-dot dot-yellow"></span>}
            {hasDelayed && <span className="ticket-dot dot-blue"></span>}
            {hasRejected && <span className="ticket-dot dot-red"></span>}
            {hasPending && <span className="ticket-dot dot-gray"></span>}
          </div>
        );
      }
    }
    return null;
  };

  const wrapperClasses = `calendar-wrapper ${isDarkMode ? 'dark-mode' : ''}`;

  return (
    <div className={wrapperClasses}>
      <Calendar
        onClickDay={handleDayClick}   // ganti ke onClickDay biar lebih akurat
        value={date}
        className={isDarkMode ? 'react-calendar--dark' : ''}
        tileContent={tileContent}
      />

      <p className="calendar-info" style={{ fontSize: "14px" }}>
        Tanggal dipilih: <b style={{ fontSize: "15px" }}>{format(date, 'dd MMM yyyy')}</b>
      </p>

      {/* Modal Detail Tiket */}
      {showModal && selectedTickets.length > 0 && (
        <div className={`modal-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className={`modal-content ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className={`modal-header ${isDarkMode ? 'dark-mode' : ''}`}>
              <h3 className="modal-title">
                Tiket untuk {format(date, 'dd MMM yyyy')}
              </h3>
            </div>
            <div className={`modal-body ${isDarkMode ? 'dark-mode' : ''}`}>
              {selectedTickets.map((ticket, index) => (
                <div
                  key={index}
                  className={`ticket-modal-card ${isDarkMode ? 'dark-mode' : ''}`}
                  onClick={() => {
                    setShowModal(false);
                    if (onTicketClick) {
                      onTicketClick(ticket.id);
                    }
                  }}
                >
                  <p><b>Pengirim:</b> {ticket.creator?.name}</p>
                  <p><b>Workshop:</b> {ticket.workshop}</p>
                  <p><b>Deskripsi:</b> {ticket.title}</p>
                  <p><b>Status:</b> {ticket.status}</p>
                </div>
              ))}
            </div>
            <div className={`modal-footer ${isDarkMode ? 'dark-mode' : ''}`}>
              <button
                className={`btn-canceluser ${isDarkMode ? 'dark-mode' : ''}`}
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info jika kosong */}
      {(!tickets || tickets.length === 0) ? (
        <p className="info-text">
          <i>Memuat data tiket...</i>
        </p>
      ) : ticketsForDate.length === 0 ? (
        <p className="info-text">
          <i>Tidak ada tiket pada tanggal ini</i>
        </p>
      ) : null}
    </div>
  );
}

export default CalendarComponent;
