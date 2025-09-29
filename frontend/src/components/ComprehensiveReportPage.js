// file: src/components/ComprehensiveReportPage.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Pagination from './Pagination';
import { saveAs } from 'file-saver';

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

export default function ComprehensiveReportPage({ title, onBack, filterType = 'all' }) {
  const [tableData, setTableData] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(filterType);
  const [loading, setLoading] = useState(true); 

  const fetchTableData = useCallback(async (page, currentFilter) => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (currentFilter === 'handled') {
        params.handled_status = 'handled';
      } else if (currentFilter === 'completed') {
        params.status = 'Selesai';
      } else if (currentFilter === 'rejected') {
        params.status = 'Ditolak';
      } else if (currentFilter === 'in_progress') {
        params.status = 'in_progress';
      }
      const res = await api.get('/tickets', { params });
      setTableData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data tabel laporan:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tickets/report-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil data statistik laporan:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTableData(currentPage, filter);
  }, [currentPage, filter, fetchTableData]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDownload = async (type) => {
        const params = {
            type,
            // Sertakan filter yang sedang aktif
            status: filter === 'all' ? null : filter,
            handled_status: filter === 'handled' ? 'handled' : null,
        };

        try {
            const response = await api.get('/tickets/download-export', {
                params,
                responseType: 'blob', // Penting: agar axios menerima file
            });

            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `laporan-tiket-${new Date().toISOString().split('T')[0]}.${extension}`;
            saveAs(response.data, fileName); // Memicu unduhan di browser

        } catch (err) {
            console.error('Gagal mengunduh file laporan:', err);
            alert('Gagal mengunduh file. Mohon coba lagi.');
        }
    };

  const tickets = tableData ? tableData.data : [];

  return (
    <div className="report-container">
      <button className="back-btn" onClick={onBack}>Kembali</button>
      <h2>{title}</h2>
      {(!stats) ? <p className="report-status-message">Memuat data statistik...</p> : (
        <>
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
            {filterType !== 'handled' && (
                <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterChange('rejected')}>
                  <h3>Tiket Ditolak</h3><p>{stats.rejected}</p>
                </div>
              )}
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
          {loading ? <p>Memuat tabel...</p> : tickets.length === 0 ? (
            <p>Tidak ada tiket yang sesuai dengan filter ini.</p>
          ) : (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Kode Tiket</th><th>Judul</th><th>Status</th><th>Workshop</th><th>Admin Pengerja</th><th>Pembuat</th><th>Tgl Dibuat</th><th>Tgl Mulai</th><th>Tgl Selesai</th><th>Durasi</th>
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