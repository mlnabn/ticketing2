import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import bgImage from '../Image/homeBg.jpg';
import yourLogok from '../Image/DTECH-Logo.png';

export default function PublicTicketPage() {
  const { ticketCode } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketByCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tickets/by-code/${ticketCode}`);
        setTicket(response.data);
      } catch (err) {
        setError("Tiket tidak ditemukan atau terjadi kesalahan.");
        console.error("Gagal mengambil tiket publik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketByCode();
  }, [ticketCode]);

  const renderTicketRow = (t) => (
    <tr key={t.id}>
      <td data-label="Deskripsi">{t.title}</td>
      <td data-label="Workshop">{t.workshop ? t.workshop.name : 'N/A'}</td>
      <td data-label="Tanggal Dibuat">{format(new Date(t.created_at), 'dd MMM yyyy')}</td>
      <td data-label="Waktu Pengerjaan">
        {t.started_at
          ? t.completed_at
            ? `${format(new Date(t.started_at), 'HH:mm')} - ${format(new Date(t.completed_at), 'HH:mm')}`
            : `Mulai: ${format(new Date(t.started_at), 'HH:mm')}`
          : 'Waktu Fleksibel'}
      </td>
      <td data-label="Status">
        <span className={`status-badge status-${t.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {t.status}
        </span>
      </td>
    </tr>
  );

  return (
    <div
      className="dashboard-container no-sidebar"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <main className="main-content">
        <header className="main-header-user">
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <div className="main-header-controls-user">
            <span className="breadcrump">Status Tiket</span>
          </div>
        </header>

        <div className="content-area">
          <div className="user-view-container">
            <div className="user-view-content">
              <div className="history-tab">
                <h2>Status untuk Tiket: {ticketCode}</h2>
                <div className="job-list" style={{ marginTop: '20px' }}>
                  <table className="job-table-user user-history-table">
                    <thead>
                      <tr>
                        <th>Deskripsi</th>
                        <th>Workshop</th>
                        <th>Tanggal Dibuat</th>
                        <th>Waktu Pengerjaan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="5">Memuat status tiket...</td></tr>}
                      {error && <tr><td colSpan="5">{error}</td></tr>}
                      {ticket && renderTicketRow(ticket)}
                    </tbody>
                  </table>
                </div>
                <div className="btn-link-back">
                    <Link to="/">
                        Kembali ke Halaman Utama
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}