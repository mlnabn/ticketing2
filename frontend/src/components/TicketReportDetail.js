import React, { useEffect, useState, useCallback } from 'react'; // Impor useCallback
import api from '../services/api';

export default function TicketReportDetail({ admin, onBack }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Gunakan useCallback untuk menstabilkan fungsi dan menjadikannya dependency yang sah
  const fetchAdminReport = useCallback(async () => {
    // Pastikan admin ada sebelum memanggil
    if (!admin || !admin.id) return;

    try {
      setLoading(true);
      const res = await api.get(`/tickets/admin-report/${admin.id}`);
      setReportData(res.data);
      setFilter('all'); // reset filter setiap ganti admin
    } catch (err) {
      console.error('Gagal mengambil laporan tiket:', err);
    } finally {
      setLoading(false);
    }
  }, [admin]); // admin dijadikan dependency untuk useCallback

  useEffect(() => {
    // useEffect sekarang memanggil fungsi yang stabil
    fetchAdminReport();
  }, [fetchAdminReport]); // fetchAdminReport dijadikan dependency untuk useEffect

  // ... (Sisa kode component Anda)

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

  const { total, completed, rejected, in_progress, tickets } = reportData;

  // NEW: filter tickets sesuai kategori
  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.status === 'Selesai';
    if (filter === 'in_progress') return t.status !== 'Selesai' && t.status !== 'Ditolak';
    if (filter === 'rejected') return t.status === 'Ditolak';
    return true;
  });

  return (
    <div className="report-container">
      <button className="back-btn" onClick={onBack}>← Kembali</button>
      <h2>Laporan Penyelesaian - {admin.name}</h2>
      
      {loading ? <p>Memuat data...</p> : (
        <>
          <div className="summary-cards">
            <div
              className={`card ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <h3>Total Tiket</h3>
              <p>{total}</p>
            </div>
            <div
              className={`card ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              <h3>Tiket Selesai</h3>
              <p>{completed}</p>
            </div>
            <div
              className={`card ${filter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilter('in_progress')}
            >
              <h3>Tiket Belum Selesai</h3>
              <p>{in_progress}</p>
            </div>
            <div
              className={`card ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              <h3>Tiket Ditolak</h3>
              <p>{rejected}</p>
            </div>
          </div>

          <h3>
            Daftar Tiket {filter !== 'all' ? `(${filter.replace('_', ' ')})` : ''}
          </h3>
          {filteredTickets.length === 0 ? (
            <p>Tidak ada tiket.</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Kode Tiket</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Pembuat</th>
                  <th>Tgl Dibuat</th>
                  <th>Tgl Mulai</th>
                  <th>Tgl Selesai</th>
                  <th>Durasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.kode_tiket}</td>
                    <td>{t.title}</td>
                    <td>{t.status}</td>
                    <td>{t.creator?.name ?? '-'}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
                    <td>{t.started_at ? new Date(t.started_at).toLocaleDateString() : '-'}</td>
                    <td>{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : '-'}</td>
                    <td>{calculateDuration(t.started_at, t.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}