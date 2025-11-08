import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import TicketDetailModal from './TicketDetailModal';
import { saveAs } from 'file-saver';
import { motion, useIsPresent } from 'framer-motion';

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
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

const yearOptions = years.map(y => ({ value: y.toString(), label: y.toString() }));

const filterTypeOptions = [
  { value: 'month', label: 'Filter per Bulan' },
  { value: 'date_range', label: 'Filter per Tanggal' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};


export default function ComprehensiveReportPage() {
  const isPresent = useIsPresent();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterTypePath = location.pathname.includes('/handled') ? 'handled' : 'all';
  const title = filterTypePath === 'handled' ? 'Laporan Tiket yang Dikerjakan' : 'Laporan Seluruh Tiket';
  const dateFilters = {
    year: searchParams.get('year') || currentYear.toString(),
    month: searchParams.get('month') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  };
  const [filterType, setFilterType] = useState('month');

  const [tableData, setTableData] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState(filterTypePath);
  const [loading, setLoading] = useState(true);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const desktopListRef = useRef(null);
  const mobileListRef = useRef(null);


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

  const handleFilterTypeChange = (selectedOption) => {
    const newType = selectedOption.value;
    setFilterType(newType);
    const newParams = new URLSearchParams(searchParams);

    if (newType === 'month') {
      newParams.delete('start_date');
      newParams.delete('end_date');
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

  const fetchTableData = useCallback(async (currentFilter, page = 1) => {
    setLoading(true);
    if (page === 1) {
      setTableData(null);
    }
    try {
      const params = { page };
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
      setTableData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data tabel laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilters.year, dateFilters.month, dateFilters.start_date, dateFilters.end_date, filterType]);

  useEffect(() => {
    if (!isPresent) return;
    fetchTableData(filter, 1);
  }, [filter, fetchTableData, isPresent]);

  useEffect(() => {
    if (!isPresent) return;
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
  }, [dateFilters.year, dateFilters.month, dateFilters.start_date, dateFilters.end_date, filterType, filterTypePath, isPresent]);

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

  const loadMoreItems = async () => {
    if (isLoadingMore || !tableData || tableData.current_page >= tableData.last_page) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = tableData.current_page + 1;

    try {
      const params = { page: nextPage };
      if (filterType === 'month') {
        if (dateFilters.year) params.year = dateFilters.year;
        if (dateFilters.month) params.month = dateFilters.month;
      } else if (filterType === 'date_range') {
        if (dateFilters.start_date) params.start_date = dateFilters.start_date;
        if (dateFilters.end_date) params.end_date = dateFilters.end_date;
      }
      if (filter === 'handled') {
        params.handled_status = 'handled';
      } else if (filter !== 'all') {
        params.status = filter;
      }

      const res = await api.get('/tickets', { params });

      setTableData(prev => ({
        ...res.data,
        data: [
          ...prev.data,
          ...res.data.data
        ]
      }));
    } catch (err) {
      console.error('Gagal memuat lebih banyak tiket:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

    if (nearBottom && !loading && !isLoadingMore && tableData && tableData.current_page < tableData.last_page) {
      loadMoreItems();
    }
  };

  const tickets = tableData ? tableData.data : [];

  return (
    // Ganti <div> dengan motion.div
    <motion.div
      className="user-management-container"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 variants={staggerItem}>{title}</motion.h2>

      {!stats ? <motion.p variants={staggerItem} className="report-status-message">Memuat data statistik...</motion.p> : (
        <>
          <motion.div variants={staggerItem} className="summary-cards">
            <div className={`card ${filter === 'all' || filter === 'handled' ? 'active' : ''}`} onClick={() => handleFilterChange(filterTypePath)}>
              <h3>{filterTypePath === 'handled' ? 'Total Dikerjakan' : 'Total Tiket'}</h3>
              <p>{stats.total}</p>
            </div>
            <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>
              <h3>Tiket Selesai</h3><p>{stats.completed}</p>
            </div>
            <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterChange('in_progress')}>
              <h3>Sedang Dikerjakan</h3><p>{stats.in_progress}</p>
            </div>
            {filterTypePath === 'all' && (
              <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterChange('rejected')}>
                <h3>Tiket Ditolak</h3><p>{stats.rejected}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="report-filters"
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              alignItems: 'center',
              width: '100%',
            }}>

            <Select
              classNamePrefix="report-filter-select"
              options={filterTypeOptions}
              value={filterTypeOptions.find(opt => opt.value === filterType)}
              onChange={handleFilterTypeChange} 
              isSearchable={false}
              styles={{ container: (base) => ({ ...base, flex: 1 }) }}
            />

            {/* Filter per Bulan */}
            {filterType === 'month' && (
              <>
                {/* 2. Filter Bulan */}
                <Select
                  classNamePrefix="report-filter-select"
                  name="month"
                  options={months}
                  value={months.find(m => m.value === dateFilters.month) || months[0]}
                  onChange={(selectedOption) => handleDateFilterChange({ target: { name: 'month', value: selectedOption.value } })}
                  placeholder="Semua Bulan"
                  isSearchable={false}
                  styles={{ container: (base) => ({ ...base, flex: 1 }) }}
                />
                {/* 3. Filter Tahun */}
                <Select
                  classNamePrefix="report-filter-select"
                  name="year"
                  options={yearOptions}
                  value={yearOptions.find(y => y.value === dateFilters.year)}
                  onChange={(selectedOption) => handleDateFilterChange({ target: { name: 'year', value: selectedOption.value } })}
                  isSearchable={false}
                  styles={{ container: (base) => ({ ...base, flex: 1 }) }}
                />
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
                  style={{ flex: 1 }} 
                />
                <span className='strip' style={{ alignSelf: 'center' }}>-</span>
                <input
                  type="date"
                  name="end_date"
                  value={dateFilters.end_date}
                  onChange={handleDateFilterChange}
                  className="filter-select-date"
                  style={{ flex: 1 }}
                />
              </>
            )}
          </motion.div>

          <motion.div variants={staggerItem} className="download-buttons">
            <button className="btn-download pdf" onClick={() => handleDownload('pdf')} disabled={exportingPdf}>
              <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
              {exportingPdf ? 'Mengekspor...' : 'Download PDF'}
            </button>
            <button className="btn-download excel" onClick={() => handleDownload('excel')} disabled={exportingExcel}>
              <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
              {exportingExcel ? 'Mengekspor...' : 'Download Excel'}
            </button>
          </motion.div>

          {loading && !tableData ? <motion.p variants={staggerItem}>Memuat data...</motion.p> : (
            <>
              {/* --- Desktop Table --- */}
              <motion.div variants={staggerItem} className="job-list-container">
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

                  <div
                    className="table-body-scroll"
                    ref={desktopListRef}
                    onScroll={handleScroll}
                  >
                    <table className="job-table">
                      <tbody>
                        {tickets.length > 0 ? (
                          tickets.map(t => (
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
                          ))
                        ) : (
                          !isLoadingMore && <tr><td colSpan="10" style={{ textAlign: 'center' }}>Tidak ada tiket yang sesuai dengan filter ini.</td></tr>
                        )}
                        {isLoadingMore && (
                          <tr><td colSpan="10" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!loading && tickets.length > 0 && tableData && (
                    <table className="job-table">
                      <tfoot>
                        <tr className="subtotal-row">
                          <td colSpan={9}>Total Data</td>
                          <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                            {tableData.total} Data
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                </div>
              </motion.div>

              {/* --- Mobile Card View --- */}
              <motion.div
                variants={staggerItem}
                className="job-list-mobile"
                ref={mobileListRef}
                onScroll={handleScroll}
                style={{ overflowY: 'auto', maxHeight: '65vh' }}
              >
                {tickets.length > 0 ? (
                  tickets.map(t => (
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
                  ))
                ) : (
                  !isLoadingMore && <p style={{ textAlign: 'center' }}>Tidak ada tiket yang sesuai.</p>
                )}


                {isLoadingMore && (
                  <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                )}
              </motion.div>
              {!loading && !isLoadingMore && tickets.length > 0 && tableData && (
                <motion.div variants={staggerItem} className='job-list-mobile'>

                  <div className="subtotal-card-mobile acquisition-subtotal"
                    style={{ marginTop: '1rem', marginBottom: '1rem' }}
                  >
                    <span className="subtotal-label"
                      style={{ fontSize: '13px', fontWeight: 'bold' }}
                    >Total Tiket</span>
                    <span className="subtotal-value value-acquisition"
                      style={{ fontSize: '13px', fontWeight: 'bold' }}
                    >
                      {tableData.total} Data
                    </span>
                  </div>

                </motion.div>
              )}
            </>
          )
          }
        </>
      )}
      <TicketDetailModal
        show={Boolean(selectedTicketForDetail)}
        ticket={selectedTicketForDetail}
        onClose={() => setSelectedTicketForDetail(null)}
      />
    </motion.div >
  );
}