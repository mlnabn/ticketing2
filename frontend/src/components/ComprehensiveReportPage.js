import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../services/api';
// import Pagination from './Pagination';
import TicketDetailModal from './TicketDetailModal';
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export default function ComprehensiveReportPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterTypePath = location.pathname.includes('/handled') ? 'handled' : 'all';
  const title = filterTypePath === 'handled' ? 'Laporan Tiket yang Dikerjakan' : 'Laporan Seluruh Tiket';

  // (DIUBAH) Baca semua parameter filter tanggal dari URL
  const dateFilters = {
    year: searchParams.get('year') || currentYear.toString(),
    month: searchParams.get('month') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  };

  // (BARU) State untuk tipe filter (bulan atau rentang tanggal)
  const [filterType, setFilterType] = useState('month');

  const [tableData, setTableData] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState(filterTypePath);
  const [loading, setLoading] = useState(true);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // (BARU) Set tipe filter awal berdasarkan parameter URL
  useEffect(() => {
    if (dateFilters.start_date || dateFilters.end_date) {
      setFilterType('date_range');
    } else {
      setFilterType('month');
    }
  }, [dateFilters.start_date, dateFilters.end_date]);

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);

    if (value === 'all' || value === '') {
      newParams.delete(name);
    } else {
      newParams.set(name, value);
    }
    setSearchParams(newParams);
  };

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    const newParams = new URLSearchParams(searchParams);

    if (newType === 'month') {
      // Hapus filter rentang tanggal
      newParams.delete('start_date');
      newParams.delete('end_date');
      // Set default tahun jika belum ada
      if (!newParams.get('year')) {
        newParams.set('year', currentYear.toString());
      }
    } else if (newType === 'date_range') {
      // Hapus filter bulan & tahun
      newParams.delete('month');
      newParams.delete('year');
    }
    setSearchParams(newParams);
  };

  const fetchTableData = useCallback(async (currentFilter) => {
    setLoading(true);
    try {
      const params = { all: true };
      if (filterType === 'month') {
        if (dateFilters.year) params.year = dateFilters.year;
        if (dateFilters.month) params.month = dateFilters.month;
      } else if (filterType === 'date_range') {
        if (dateFilters.start_date) params.start_date = dateFilters.start_date;
        if (dateFilters.end_date) params.end_date = dateFilters.end_date;
      }


      if (currentFilter === 'handled') {
        params.handled_status = 'handled';
      } else if (currentFilter !== 'all') {
        params.status = currentFilter;
      }

      const res = await api.get('/tickets', { params });
      setTableData({ data: res.data });
    } catch (err) {
      console.error('Gagal mengambil data tabel laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilters.year, dateFilters.month, dateFilters.start_date, dateFilters.end_date, filterType]);

  useEffect(() => {
    fetchTableData(filter);
  }, [filter, fetchTableData]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = {};
        if (filterType === 'month') {
          if (dateFilters.year) params.year = dateFilters.year;
          if (dateFilters.month) params.month = dateFilters.month;
        } else if (filterType === 'date_range') {
          if (dateFilters.start_date) params.start_date = dateFilters.start_date;
          if (dateFilters.end_date) params.end_date = dateFilters.end_date;
        }

        if (filterTypePath === 'handled') params.handled_status = 'true';

        const res = await api.get('/tickets/report-stats', { params });
        setStats(res.data);
      } catch (err) {
        console.error('Gagal mengambil data statistik laporan:', err);
      }
    };
    fetchStats();
  }, [dateFilters.year, dateFilters.month, dateFilters.start_date, dateFilters.end_date, filterType, filterTypePath]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // setCurrentPage(1);
  };

  const handleDownload = async (type) => {
    if (type === 'pdf') setExportingPdf(true);
    else setExportingExcel(true);

    const params = new URLSearchParams({ type });
    if (filter === 'handled') {
      params.append('handled_status', 'handled');
    } else if (filter !== 'all') {
      params.append('status', filter);
    }
    if (filterType === 'month') {
      if (dateFilters.year) params.append('year', dateFilters.year);
      if (dateFilters.month) params.append('month', dateFilters.month);
    } else if (filterType === 'date_range') {
      if (dateFilters.start_date) params.append('start_date', dateFilters.start_date);
      if (dateFilters.end_date) params.append('end_date', dateFilters.end_date);
    }
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
    } finally {
      if (type === 'pdf') setExportingPdf(false);
      else setExportingExcel(false);
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

          

          <h3>Filter Tiket {filter !== 'all' ? `(${filter.replace('_', ' ')})` : ''}</h3>

          <div className="report-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <select value={filterType} onChange={handleFilterTypeChange} className="filter-select">
              <option value="month">Filter per Bulan</option>
              <option value="date_range">Filter per Tanggal</option>
            </select>

            {/* Filter per Bulan */}
            {filterType === 'month' && (
              <>
                <select
                  name="month"
                  value={dateFilters.month}
                  onChange={handleDateFilterChange}
                  className="filter-select"
                >
                  <option value="">Semua Bulan</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  name="year"
                  value={dateFilters.year}
                  onChange={handleDateFilterChange}
                  className="filter-select"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            )}

            {/* Filter per Rentang Tanggal */}
            {filterType === 'date_range' && (
              <>
                <input
                  type="date"
                  name="start_date"
                  value={dateFilters.start_date}
                  onChange={handleDateFilterChange}
                  className="filter-select-date"
                />
                <span style={{ alignSelf: 'center' }}>-</span>
                <input
                  type="date"
                  name="end_date"
                  value={dateFilters.end_date}
                  onChange={handleDateFilterChange}
                  className="filter-select-date"
                />
              </>
            )}
          </div>
          <div className="download-buttons">
            <button className="btn-download pdf" onClick={() => handleDownload('pdf')} disabled={exportingPdf}>
              <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
              {exportingPdf ? 'Mengekspor...' : 'Download PDF'}
            </button>
            <button className="btn-download excel" onClick={() => handleDownload('excel')} disabled={exportingExcel}>
              <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
              {exportingExcel ? 'Mengekspor...' : 'Download Excel'}
            </button>
          </div>

          {loading ? <p>Memuat data...</p> : tickets.length === 0 ? (
            <p>Tidak ada tiket yang sesuai dengan filter ini.</p>
          ) : (
            <>
              {/* --- Desktop Table --- */}
              <div className="job-list-container">
                <div className="table-scroll-container">
                  <table className="job-table">
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
                  </table>

                  <div className="table-body-scroll">
                    <table className="job-table">
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
                </div>
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

              {/* {tableData && tableData.last_page > 1 && (
                <Pagination
                  currentPage={tableData.current_page}
                  lastPage={tableData.last_page}
                  onPageChange={setCurrentPage}
                />
              )} */}
            </>
          )
          }
        </>
      )}
      {
        selectedTicketForDetail && (
          <TicketDetailModal
            ticket={selectedTicketForDetail}
            onClose={() => setSelectedTicketForDetail(null)}
          />
        )
      }
    </div >
  );
}
