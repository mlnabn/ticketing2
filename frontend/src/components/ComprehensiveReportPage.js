import React, { useState, useEffect, useCallback } from 'react';
// BARU: Impor hooks dari React Router
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Pagination from './Pagination';
import TicketDetailModal from './TicketDetailModal'; // BARU: Impor modal
import { saveAs } from 'file-saver';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
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

// DIHAPUS: Props lama seperti `title`, `onBack`, `filterType`, `dateFilters`
export default function ComprehensiveReportPage() {
  // BARU: Gunakan hooks untuk mendapatkan info dari URL dan untuk navigasi
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // BARU: Tentukan tipe filter dan judul berdasarkan path URL
  const filterType = location.pathname.includes('/handled') ? 'handled' : 'all';
  const title = filterType === 'handled' ? 'Laporan Tiket yang Dikerjakan' : 'Laporan Seluruh Tiket';

  // BARU: Ambil filter tanggal dari URL
  const dateFilters = {
    year: searchParams.get('year'),
    month: searchParams.get('month'),
  };

  const [tableData, setTableData] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(filterType);
  const [loading, setLoading] = useState(true);
  
  // BARU: State untuk modal detail tiket, sekarang dikelola di sini
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

  const fetchTableData = useCallback(async (page, currentFilter) => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (dateFilters.year) params.year = dateFilters.year;
      if (dateFilters.month) params.month = dateFilters.month;
      
      if (currentFilter === 'handled') {
        params.handled_status = 'handled';
      } else if (currentFilter !== 'all') {
        params.status = currentFilter;
      }
      const res = await api.get('/tickets', { params });
      setTableData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data tabel laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilters.year, dateFilters.month]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = {};
        if (dateFilters.year) params.year = dateFilters.year;
        if (dateFilters.month) params.month = dateFilters.month;
        if (filterType === 'handled') params.handled_status = 'true';
        
        const res = await api.get('/tickets/report-stats', { params });
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil data statistik laporan:', err);
      }
    };
    fetchStats();
  }, [dateFilters.year, dateFilters.month, filterType]);

  useEffect(() => {
    fetchTableData(currentPage, filter);
  }, [currentPage, filter, fetchTableData]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDownload = async (type) => {
    const params = new URLSearchParams({ type });
    if (filter === 'handled') {
      params.append('handled_status', 'handled');
    } else if (filter !== 'all') {
      params.append('status', filter);
    }
    if (dateFilters?.year) params.append('year', dateFilters.year);
    if (dateFilters?.month) params.append('month', dateFilters.month);

    try {
      const response = await api.get('/tickets/download-export', {
        params,
        responseType: 'blob',
      });
      const extension = type === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `laporan-tiket-${new Date().toISOString().split('T')[0]}.${extension}`;
      saveAs(response.data, fileName);
    } catch (err) {
      console.error('Gagal mengunduh file laporan:', err);
      alert('Gagal mengunduh file. Mohon coba lagi.');
    }
  };


  const handleTicketClick = (ticket) => {
    setSelectedTicketForDetail(ticket);
  };

  const handleRowClick = (e, ticket) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('a')) return;
    handleTicketClick(ticket);
  };

  const tickets = tableData ? tableData.data : [];

  return (
    <div className="report-container">
      <h2>{title}</h2>

      <p className="report-filter-info">
        Menampilkan data untuk: <strong>
          {dateFilters?.month ? new Date(0, dateFilters.month - 1).toLocaleString('id-ID', { month: 'long' }) : 'Semua Bulan'} {dateFilters?.year}
        </strong>
      </p>

      {!stats ? <p className="report-status-message">Memuat data statistik...</p> : (
        <>
          <div className="summary-cards">
            <div className={`card ${filter === 'all' || filter === 'handled' ? 'active' : ''}`} onClick={() => handleFilterChange(filterType)}>
              <h3>{filterType === 'handled' ? 'Total Dikerjakan' : 'Total Tiket'}</h3>
              <p>{stats.total}</p>
            </div>
            <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>
              <h3>Tiket Selesai</h3><p>{stats.completed}</p>
            </div>
            <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterChange('in_progress')}>
              <h3>Sedang Dikerjakan</h3><p>{stats.in_progress}</p>
            </div>
            {filterType === 'all' && (
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

          {loading ? <p>Memuat data...</p> : tickets.length === 0 ? (
            <p>Tidak ada tiket yang sesuai dengan filter ini.</p>
          ) : (
            <>
              {/* --- Desktop Table --- */}
              <div className="job-list-container">
                <table className="job-table">
                  <thead>
                    <tr>
                      <th>Kode Tiket</th><th>Judul</th><th>Status</th><th>Workshop</th>
                      <th>Admin Pengerja</th><th>Pembuat</th><th>Tgl Dibuat</th>
                      <th>Tgl Mulai</th><th>Tgl Selesai</th><th>Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} className="clickable-row" onClick={(e) => handleRowClick(e, t)}>
                        <td>{t.kode_tiket || '-'}</td>
                        <td>
                          <span className="description-cell">{t.title}</span>
                        </td>
                        <td>{t.status}</td>
                        <td>{t.workshop ? t.workshop.name : 'N/A'}</td>
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

              {/* --- Mobile Card View --- */}
              <div className="job-list-mobile">
                {tickets.map(t => (
                  <div key={t.id} className="ticket-card-mobile clickable-row" onClick={(e) => handleRowClick(e, t)}>
                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Kode Tiket</span>
                        <span className="value">{t.kode_tiket || '-'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Judul</span>
                        <span className="value">
                          <span className="description-cell">{t.title}</span>
                        </span>
                      </div>
                    </div>

                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Status</span>
                        <span className={`value status-${t.status}`}>{t.status}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Workshop</span>
                        <span className="value">{t.workshop ? t.workshop.name : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Admin</span>
                        <span className="value">{t.user?.name ?? 'N/A'}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Pembuat</span>
                        <span className="value">{t.creator?.name ?? 'N/A'}</span>
                      </div>
                    </div>

                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Dibuat</span>
                        <span className="value">{formatDate(t.created_at)}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Mulai</span>
                        <span className="value">{formatDate(t.started_at)}</span>
                      </div>
                    </div>

                    <div className="card-row">
                      <div className="data-group">
                        <span className="label">Selesai</span>
                        <span className="value">{formatDate(t.completed_at)}</span>
                      </div>
                      <div className="data-group">
                        <span className="label">Durasi</span>
                        <span className="value">{calculateDuration(t.started_at, t.completed_at)}</span>
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
      {selectedTicketForDetail && (
        <TicketDetailModal
          ticket={selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
        />
      )}
    </div>
  );
}
