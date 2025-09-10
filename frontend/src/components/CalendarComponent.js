import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

function CalendarComponent({ tickets = [] }) {
  const [date, setDate] = useState(new Date());
  const [ticketsForDate, setTicketsForDate] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Asumsikan isDarkMode akan diatur dari parent component,
  // tetapi kita biarkan untuk contoh styling
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efek untuk memuat data pertama kali dan mengatur tanggal awal
  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setTicketsForDate([]);
      return;
    }

    // Mengurutkan tiket berdasarkan tanggal terbaru
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Mengatur tanggal awal ke tanggal tiket terbaru jika ada
    if (sortedTickets.length > 0) {
      setDate(new Date(sortedTickets[0].created_at));
    }

    // Memfilter tiket untuk tanggal awal yang sudah ditentukan
    const formatted = format(date, 'yyyy-MM-dd');
    const filtered = tickets.filter(t =>
      format(new Date(t.created_at), 'yyyy-MM-dd') === formatted
    );
    setTicketsForDate(filtered);
    setCurrentIndex(0);
  }, [tickets]);

  // Efek untuk menangani perubahan tanggal yang dipilih oleh pengguna
  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setTicketsForDate([]);
      return;
    }
    const formatted = format(date, 'yyyy-MM-dd');
    const filtered = tickets.filter(t =>
      format(new Date(t.created_at), 'yyyy-MM-dd') === formatted
    );
    setTicketsForDate(filtered);
    setCurrentIndex(0);
  }, [date, tickets]);

  const handleNext = () => {
    if (currentIndex < ticketsForDate.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Fungsi untuk menentukan konten ubin (tanggal)
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const hasTickets = tickets.some(t => format(new Date(t.created_at), 'yyyy-MM-dd') === formattedDate);
      return hasTickets ? <div className="ticket-indicator"></div> : null;
    }
    return null;
  };

  // Fungsi untuk menetapkan nama kelas ubin (tanggal)
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayTickets = tickets.filter(t => format(new Date(t.created_at), 'yyyy-MM-dd') === formattedDate);

      if (dayTickets.length > 0) {
        // Cek jika ada tiket yang "Sedang Dikerjakan"
        const hasInProgress = dayTickets.some(t => t.status === 'Sedang Dikerjakan');
        if (hasInProgress) {
          return 'tile-in-progress';
        }

        // Cek jika semua tiket "Selesai"
        const allCompleted = dayTickets.every(t => t.status === 'Selesai');
        if (allCompleted) {
          return 'tile-completed';
        }
      }
    }
    return null;
  };

  const wrapperClasses = `calendar-wrapper ${isDarkMode ? 'darkmode' : ''}`;

  return (
    <div className={wrapperClasses}>
      <Calendar
        onChange={setDate}
        value={date}
        className={isDarkMode ? 'react-calendar--dark' : ''}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />
      <p className="calendar-info">
        Tanggal dipilih: <b>{format(date, 'dd MMM yyyy')}</b>
      </p>

      {(!tickets || tickets.length === 0) ? (
        <p className="info-text"><i>Memuat data tiket...</i></p>
      ) : ticketsForDate.length === 0 ? (
        <p className="info-text"><i>Tidak ada tiket pada tanggal ini</i></p>
      ) : (
        <div className="ticket-slider">
          <div className="ticket-card">
            <p><b>Pengirim:</b> {ticketsForDate[currentIndex].creator?.name}</p>
            <p><b>Workshop:</b> {ticketsForDate[currentIndex].workshop}</p>
            <p><b>Deskripsi:</b> {ticketsForDate[currentIndex].title}</p>
            <p><b>Status:</b> {ticketsForDate[currentIndex].status}</p>
          </div>

          {ticketsForDate.length > 1 && (
            <div className="slider-controls">
              <button
                className="slider-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                «
              </button>
              <span className="slider-page">
                {`${currentIndex + 1} / ${ticketsForDate.length}`}
              </span>
              <button
                className="slider-btn"
                onClick={handleNext}
                disabled={currentIndex === ticketsForDate.length - 1}
              >
                »
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarComponent;