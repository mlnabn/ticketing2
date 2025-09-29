// file: src/components/TicketReportDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Pagination from './Pagination';

// Helper ditambahkan di dalam agar komponen mandiri
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

export default function TicketReportDetail({ admin, onBack }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAdminReport = useCallback(async (page, statusFilter) => {
    if (!admin || !admin.id) return;
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await api.get(`/tickets/admin-report/${admin.id}`, { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Gagal mengambil laporan tiket:', err);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchAdminReport(currentPage, filter);
  }, [fetchAdminReport, currentPage, filter]);

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDownload = (type) => {
    const baseURL = api.defaults.baseURL;
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('admin_id', admin.id);

    if (filter !== 'all') {
      params.append('status', filter);
    }

    const downloadUrl = `${baseURL}/tickets/export?${params.toString()}`;
    const token = localStorage.getItem('auth.accessToken');

    if (token) {
      window.open(`${downloadUrl}&token=${token}`, '_blank');
    } else {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  };

  if (loading && !reportData) {
    return <p>Memuat data...</p>;
  }

  const { total, completed, rejected, in_progress } = reportData || {};
  const ticketsData = reportData ? reportData.tickets : null;
  const ticketsOnPage = ticketsData ? ticketsData.data : [];

  return (
    <div className="report-container">
      <button className="back-btn" onClick={onBack}>Kembali</button>
      <h2>Laporan Penyelesaian - {admin.name}</h2>

      {loading && !reportData ? <p>Memuat data...</p> : (
        <>
          <div className="summary-cards">
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
          
          {loading ? <p>Memuat tabel...</p> : ticketsOnPage.length === 0 ? (<p>Tidak ada tiket yang sesuai dengan filter ini.</p>) : (
            <>
              <div className="report-detail-table-wrapper">
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
                        <td>{formatDate(t.created_at)}</td>
                        <td>{formatDate(t.started_at)}</td>
                        <td>{formatDate(t.completed_at)}</td>
                        <td>{calculateDuration(t.started_at, t.completed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="report-detail-list-mobile">
                {ticketsOnPage.map(t => (
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
                        <span className="label">Workshop</span>
                        <span className="value">{t.workshop || '-'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Pengirim</span>
                        <span className="value">{t.creator?.name ?? 'N/A'}</span>
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

              {ticketsData && ticketsData.last_page > 1 && (
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