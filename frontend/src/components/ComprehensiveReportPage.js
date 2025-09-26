// file: src/components/ComprehensiveReportPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Pagination from './Pagination';

// Helper di luar komponen agar lebih rapi
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const calculateDuration = (startedAt, completedAt) => {
  if (!startedAt || !completedAt) return 'N/A';
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffInMs = end - start;
  if (diffInMs < 0) return 'Invalid';
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  return `${hours}j ${minutes}m`;
};

export default function ComprehensiveReportPage({ title, onBack }) {
  const [tableData, setTableData] = useState(null);
  const [stats, setStats] = useState(null); // State baru untuk data statistik
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // State baru untuk filter lokal
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data tabel dan statistik
  const fetchData = useCallback(async (page, currentFilter) => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };

      // Terapkan filter berdasarkan state 'filter'
      if (currentFilter === 'handled') {
        params.handled_status = 'handled';
      } else if (currentFilter === 'completed') {
        params.status = 'Selesai';
      } else if (currentFilter === 'rejected') {
        params.status = 'Ditolak';
      } else if (currentFilter === 'in_progress') {
        params.handled_status = 'handled';
        params.status = ['Sedang Dikerjakan', 'Ditunda'];
      }
      // 'all' tidak memerlukan filter khusus

      // Ambil data tabel dan statistik secara bersamaan
      const [tableRes, statsRes] = await Promise.all([
        api.get('/tickets', { params }),
        // Hanya fetch statistik jika belum ada
        stats ? Promise.resolve(null) : api.get('/tickets/report-stats')
      ]);

      setTableData(tableRes.data);
      if (statsRes) {
        setStats(statsRes.data);
      }

    } catch (err) {
      console.error('Gagal mengambil data laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [stats]); // 'stats' ditambahkan agar tidak fetch ulang jika sudah ada

  // useEffect untuk memanggil data saat halaman atau filter berubah
  useEffect(() => {
    fetchData(currentPage, filter);
  }, [currentPage, filter, fetchData]);

  // Handler untuk mengubah filter dan reset halaman ke 1
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const tickets = tableData ? tableData.data : [];

  return (
    <div className="report-container">
        <button className="back-btn" onClick={onBack}>Kembali</button>
        <h2>{title}</h2>
      {loading && (!stats || !tableData) ? <p className="report-status-message">Memuat data...</p> : (
        <>
          {stats && (
            <div className="summary-cards">
              <div className={`card ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>
                <h3>Total Tiket</h3><p>{stats.total}</p>
              </div>
              <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>
                <h3>Tiket Selesai</h3><p>{stats.completed}</p>
              </div>
              <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterChange('in_progress')}>
                <h3>Sedang Dikerjakan</h3><p>{stats.in_progress}</p>
              </div>
              <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterChange('rejected')}>
                <h3>Tiket Ditolak</h3><p>{stats.rejected}</p>
              </div>
            </div>
          )}

          <h3>
            Daftar Tiket {filter !== 'all' ? `(${filter.replace('_', ' ')})` : ''}
          </h3>

          {loading ? <p>Memuat tabel...</p> : tickets.length === 0 ? (
            <p>Tidak ada tiket yang sesuai dengan filter ini.</p>
          ) : (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Kode Tiket</th>
                    <th>Judul</th>
                    <th>Status</th>
                    <th>Workshop</th>
                    <th>Admin Pengerja</th>
                    <th>Pembuat</th>
                    <th>Tgl Dibuat</th>
                    <th>Tgl Mulai</th>
                    <th>Tgl Selesai</th>
                    <th>Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id}>
                      <td>{t.kode_tiket || '-'}</td>
                      <td>{t.title}</td>
                      <td>{t.status}</td>
                      <td>{t.workshop || '-'}</td>
                      <td>{t.user?.name ?? 'N/A'}</td>
                      <td>{t.creator?.name ?? 'N/A'}</td>
                      <td>{formatDate(t.created_at)}</td>
                      <td>{formatDate(t.started_at)}</td>
                      <td>{formatDate(t.completed_at)}</td>
                      <td>{calculateDuration(t.started_at, t.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={tableData.current_page}
                lastPage={tableData.last_page}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}