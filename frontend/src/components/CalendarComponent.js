import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import TicketModal from './TicketModal'; 

function CalendarComponent({ tickets = [], onTicketClick }) {
  const [date, setDate] = useState(new Date());
  const [ticketsForDate, setTicketsForDate] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    const updateModeFromStorage = () => {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) setIsDarkMode(JSON.parse(savedMode));
    };
    updateModeFromStorage();
    window.addEventListener('storage', updateModeFromStorage);
    return () => window.removeEventListener('storage', updateModeFromStorage);
  }, []);

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

  const handleDayClick = (clickedDate) => {
    const formatted = format(clickedDate, 'yyyy-MM-dd');
    const filtered = tickets.filter(
      (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === formatted
    );
    setSelectedTickets(filtered);
    setShowModal(filtered.length > 0);
    setDate(clickedDate);
  };

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
            {hasDelayed && <span className="ticket-dot dot-gray"></span>}
            {hasRejected && <span className="ticket-dot dot-red"></span>}
            {hasPending && <span className="ticket-dot dot-blue"></span>}
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
        onClickDay={handleDayClick}
        value={date}
        tileContent={tileContent}
      />

      {/* <div className="ticket-legend" style={{ marginTop: "10px", fontSize: "13px" }}>
        <div className="legend-item legend-green"><span className="legend-dot dot-green"></span><span>Selesai</span></div>
        <div className="legend-item legend-yellow"><span className="legend-dot dot-yellow"></span><span>Sedang Dikerjakan</span></div>
        <div className="legend-item legend-blue"><span className="legend-dot dot-blue"></span><span>Belum Dikerjakan</span></div>
        <div className="legend-item legend-gray"><span className="legend-dot dot-gray"></span><span>Ditunda</span></div>
        <div className="legend-item legend-red"><span className="legend-dot dot-red"></span><span>Ditolak</span></div>
      </div> */}

      <p className="calendar-info" style={{ fontSize: "14px" }}>
        Tanggal dipilih: <b style={{ fontSize: "15px" }}>{format(date, 'dd MMM yyyy')}</b>
      </p>

      {/* Modal terpisah */}
      <TicketModal
        show={showModal}
        tickets={selectedTickets}
        date={date}
        isDarkMode={isDarkMode}
        onClose={() => setShowModal(false)}
        onTicketClick={onTicketClick}
      />

      {/* Info jika kosong */}
      {(!tickets || tickets.length === 0) ? (
        <p className="info-text"><i>Memuat data tiket...</i></p>
      ) : ticketsForDate.length === 0 ? (
        <p className="info-text"><i>Tidak ada tiket pada tanggal ini</i></p>
      ) : null}
    </div>
  );
}

export default CalendarComponent;
