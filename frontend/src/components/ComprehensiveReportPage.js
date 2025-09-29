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

export default function ComprehensiveReportPage({ title, onBack, filterType = 'all' }) {
  const [tableData, setTableData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(filterType);
  const [loading, setLoading] = useState(true);
  
  const [baseStats, setBaseStats] = useState(null); 
  const [currentStats, setCurrentStats] = useState(null);

  const fetchData = useCallback(async (page, currentFilter) => {
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
        params.status = ['Sedang Dikerjakan', 'Ditunda'];
      }

      const [tableRes, statsRes] = await Promise.all([
        api.get('/tickets', { params }),
        api.get('/tickets/report-stats', { params })
      ]);
      
      setTableData(tableRes.data);
      setCurrentStats(statsRes.data);

      if (!baseStats) {
        setBaseStats(statsRes.data);
      }
      
    } catch (err) {
      console.error('Gagal mengambil data laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [baseStats]);

  useEffect(() => {
    fetchData(currentPage, filter);
  }, [currentPage, filter, fetchData]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDownload = (type) => {
    const baseURL = api.defaults.baseURL;
    const params = new URLSearchParams();
    params.append('type', type);

    if (filter === 'completed') {
      params.append('status', 'Selesai');
    } else if (filter === 'rejected') {
      params.append('status', 'Ditolak');
    } else if (filter === 'in_progress') {
      ['Sedang Dikerjakan', 'Ditunda'].forEach(s => params.append('status[]', s));
    } else if (filter === 'handled') {
      params.append('handled_status', 'handled');
    }

    const downloadUrl = `${baseURL}/tickets/export?${params.toString()}`;
    const token = localStorage.getItem('auth.accessToken');

    if (token) {
      window.open(`${downloadUrl}&token=${token}`, '_blank');
    } else {
      alert('Sesi Anda mungkin telah berakhir. Silakan login kembali.');
    }
  };

  const tickets = tableData ? tableData.data : [];

  return (
    <div className="report-container">
      <button className="back-btn" onClick={onBack}>Kembali</button>
      <h2>{title}</h2>
      {loading && !baseStats ? <p className="report-status-message">Memuat data...</p> : (
        <>
          {baseStats && (
            <div className="summary-cards">
              <div className={`card ${filter === 'all' || filter === 'handled' ? 'active' : ''}`} onClick={() => handleFilterChange(filterType)}>
                <h3>Total Tiket</h3><p>{baseStats.total}</p>
              </div>
              <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>
                <h3>Tiket Selesai</h3><p>{baseStats.completed}</p>
              </div>
              <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterChange('in_progress')}>
                <h3>Sedang Dikerjakan</h3><p>{baseStats.in_progress}</p>
              </div>
              
              {filterType !== 'handled' && (
                <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterChange('rejected')}>
                  <h3>Tiket Ditolak</h3><p>{baseStats.rejected}</p>
                </div>
              )}
            </div>
          )}
          <h3>Daftar Tiket {filter !== 'all' && filter !== 'handled' ? `(${filter.replace('_', ' ')})` : ''}</h3>
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
              <div className="report-table-wrapper">
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
              </div>

              <div className="report-list-mobile">
                {tickets.map(t => (
                  <div key={t.id} className="report-card-mobile">
                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Kode Tiket</span>
                        <span className="value">{t.kode_tiket || '-'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Status</span>
                        <span className="value status">{t.status}</span>
                      </div>
                    </div>
                    <div className="card-row">
                      <div className="data-group single">
                        <span className="label">Deskripsi</span>
                        <span className="value description">{t.title}</span>
                      </div>
                    </div>
                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Admin</span>
                        <span className="value">{t.user?.name ?? 'N/A'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Pengirim</span>
                        <span className="value">{t.creator?.name ?? 'N/A'}</span>
                      </div>
                    </div>
                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Workshop</span>
                        <span className="value">{t.workshop || '-'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Dibuat</span>
                        <span className="value">{formatDate(t.created_at)}</span>
                      </div>
                    </div>
                    <div className="card-row">
                      <div className="data-group single">
                        <span className="label">Durasi Pengerjaan</span>
                        <span className="value time-duration">
                          {formatDate(t.started_at)} s/d {formatDate(t.completed_at)}
                          <strong> ({calculateDuration(t.started_at, t.completed_at)})</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tableData && tableData.last_page > 1 && (
                <Pagination
                  currentPage={tableData.current_page}
                  lastPage={tableData.last_page}
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