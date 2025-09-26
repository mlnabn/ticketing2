// file: src/components/TicketReportDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Pagination from './Pagination';

export default function TicketReportDetail({ admin, onBack }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // Filter dimulai dari 'all'
  const [currentPage, setCurrentPage] = useState(1);

  // DIUBAH: fetchAdminReport sekarang menerima filter sebagai argumen
  const fetchAdminReport = useCallback(async (page, statusFilter) => {
    if (!admin || !admin.id) return;

    try {
      setLoading(true);

      const params = { page }; // Selalu kirim halaman
      if (statusFilter !== 'all') {
        params.status = statusFilter; // Kirim status jika bukan 'all'
      }

      const res = await api.get(`/tickets/admin-report/${admin.id}`, { params });

      setReportData(res.data);
      // DIHAPUS: baris setFilter('all') yang menyebabkan reset
    } catch (err) {
      console.error('Gagal mengambil laporan tiket:', err);
    } finally {
      setLoading(false);
    }
  }, [admin]); // Dependensi hanya admin

  // DIUBAH: useEffect sekarang juga bergantung pada `filter`
  useEffect(() => {
    // Panggil fetchAdminReport dengan halaman dan filter saat ini
    fetchAdminReport(currentPage, filter);
  }, [fetchAdminReport, currentPage, filter]);

  // DIUBAH: handler untuk mengganti filter dan reset ke halaman 1
  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Kembali ke halaman pertama setiap kali filter diubah
  };

  // DIUBAH: handleDownload sekarang lebih aman
  const handleDownload = (type) => {
    const baseURL = api.defaults.baseURL;
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('admin_id', admin.id);

    if (filter !== 'all') {
      params.append('status', filter);
    }

    const downloadUrl = `${baseURL}/tickets/export?${params.toString()}`;

    // GANTI 'auth_token' DENGAN KEY YANG BENAR JIKA NAMA KEY-NYA BEDA
    const token = localStorage.getItem('auth.accessToken');

    if (token) {
      window.open(`${downloadUrl}&token=${token}`, '_blank');
    } else {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  };

  const calculateDuration = (startedAt, completedAt) => {
    if (!startedAt || !completedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffInMs = end - start;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}j ${minutes}m`;
  };

  if (!reportData) {
    return <p>Memuat data...</p>;
  }

  const { total, completed, rejected, in_progress } = reportData;
  const ticketsData = reportData.tickets;
  // DIHAPUS: Logika `filteredTickets` tidak lagi diperlukan di sini
  const ticketsOnPage = ticketsData ? ticketsData.data : [];

  return (
    <div className="report-container">
      {/* Tombol kembali dan download tidak berubah */}
      <button className="back-btn" onClick={onBack}>Kembali</button>
      <h2>Laporan Penyelesaian - {admin.name}</h2>

      {loading ? <p>Memuat data...</p> : (
        <>
          <div className="summary-cards">
            {/* DIUBAH: onClick sekarang memanggil handleFilterClick */}
            <div className={`card ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterClick('all')}><h3>Total Tiket</h3><p>{total}</p></div>
            <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterClick('completed')}><h3>Tiket Selesai</h3><p>{completed}</p></div>
            <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterClick('in_progress')}><h3>Tiket Belum Selesai</h3><p>{in_progress}</p></div>
            <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterClick('rejected')}><h3>Tiket Ditolak</h3><p>{rejected}</p></div>
          </div>
          <h3>Daftar Tiket {filter !== 'all' ? `(${filter.replace('_', ' ')})` : ''}</h3>
          <div className="download-buttons">
            <button className="btn-download pdf" onClick={() => handleDownload('pdf')}>
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
            <button className="btn-download excel" onClick={() => handleDownload('excel')}>
              <i className="fas fa-file-excel"></i> Download Excel
            </button>
          </div>
          {/* DIUBAH: Sekarang kita map langsung dari `ticketsOnPage` */}
          {ticketsOnPage.length === 0 ? (<p>Tidak ada tiket yang sesuai dengan filter ini.</p>) : (
            <>
              <table className="report-table">
                <thead><tr><th>Kode Tiket</th><th>Judul</th><th>Status</th><th>Workshop</th><th>Pembuat</th><th>Tgl Dibuat</th><th>Tgl Mulai</th><th>Tgl Selesai</th><th>Durasi</th></tr></thead>
                <tbody>
                  {ticketsOnPage.map(t => (
                    <tr key={t.id}>
                      <td>{t.kode_tiket || '-'}</td>
                      <td>{t.title}</td>
                      <td>{t.status}</td>
                      <td>{t.workshop || '-'}</td>
                      <td>{t.creator?.name ?? '-'}</td>
                      <td>{new Date(t.created_at).toLocaleDateString()}</td>
                      <td>{t.started_at ? new Date(t.started_at).toLocaleDateString() : '-'}</td>
                      <td>{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : '-'}</td>
                      <td>{calculateDuration(t.started_at, t.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ticketsData && (
                <Pagination
                  currentPage={ticketsData.current_page}
                  lastPage={ticketsData.last_page}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}