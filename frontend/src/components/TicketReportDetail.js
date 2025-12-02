import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import TicketDetailModal from './TicketDetailModal';
import { saveAs } from 'file-saver';
import { motion, useIsPresent, AnimatePresence } from 'framer-motion';
import Select from 'react-select';

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
}

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

const filterExpandVariants = {
  closed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    marginTop: 0,
    marginBottom: 0
  },
  open: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
    y: 0
  }
};
const filterExpandTransition = {
  type: "spring",
  stiffness: 150,
  damping: 25
};

export default function TicketReportDetail() {
  const isPresent = useIsPresent();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { adminId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateFilters = {
    year: searchParams.get('year') || currentYear.toString(),
    month: searchParams.get('month') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  };

  const [filterType, setFilterType] = useState('month');

  const [admin, setAdmin] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const desktopListRef = useRef(null);
  const mobileListRef = useRef(null);


  const yearOptions = years.map(y => ({ value: y.toString(), label: y.toString() }));


  const monthOptions = [{ value: '', label: 'Semua Bulan' }, ...months];


  const activeYear = yearOptions.find(y => y.value === dateFilters.year);
  const activeMonth = monthOptions.find(m => m.value === dateFilters.month);
  const activeFilterType = filterTypeOptions.find(opt => opt.value === filterType);

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
    const currentEndDate = searchParams.get('end_date');
    if (name === 'start_date') {
      if (value === 'all' || value === '') {
        newParams.delete('start_date');
        newParams.delete('end_date');
      } else {
        newParams.set('start_date', value);
        const newStartDateObj = new Date(value);
        const currentEndDateObj = currentEndDate ? new Date(currentEndDate) : null;
        if (!currentEndDate || !currentEndDateObj || currentEndDateObj < newStartDateObj) {
          newParams.set('end_date', value);
        }
      }
    }
    else if (name === 'end_date') {
      if (value === 'all' || value === '') {
        newParams.delete('end_date');
      } else {
        newParams.set('end_date', value);
        const currentStartDate = searchParams.get('start_date');
        if (currentStartDate) {
          const newEndDateObj = new Date(value);
          const currentStartDateObj = new Date(currentStartDate);

          if (newEndDateObj < currentStartDateObj) {
            newParams.set('end_date', currentStartDate);
          }
        }
      }
    }
    else {
      if (value === 'all' || value === '') {
        newParams.delete(name);
      } else {
        newParams.set(name, value);
      }
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
      newParams.delete('month');
      newParams.delete('year');
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    if (!isPresent) return;
    const fetchAdminDetails = async () => {
      if (!adminId) return;
      try {
        const res = await api.get(`/users/${adminId}`);
        setAdmin(res.data);
      } catch (err) {
        console.error('Gagal mengambil detail admin:', err);
      }
    };
    fetchAdminDetails();
  }, [adminId, isPresent]);

  const fetchAdminReport = useCallback(async (statusFilter, page = 1) => {
    if (!adminId) return;
    setLoading(true);

    if (page === 1) {
      setReportData(null);
    }
    try {
      const params = { page };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (filterType === 'month') {
        if (dateFilters.year) params.year = dateFilters.year;
        if (dateFilters.month) params.month = dateFilters.month;
      } else if (filterType === 'date_range') {
        if (dateFilters.start_date) params.start_date = dateFilters.start_date;
        if (dateFilters.end_date) params.end_date = dateFilters.end_date;
      }

      const res = await api.get(`/tickets/admin-report/${adminId}`, { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Gagal mengambil laporan tiket:', err);
    } finally {
      setLoading(false);
    }
  }, [adminId, dateFilters.year, dateFilters.month, dateFilters.start_date, dateFilters.end_date, filterType]);

  useEffect(() => {
    if (!isPresent) return;
    fetchAdminReport(filter, 1);
  }, [fetchAdminReport, filter, isPresent]);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileFilterOpen(true);
    }
    else {
      setIsMobileFilterOpen(false);
    }
  }, [isMobile]);

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
  };

  const loadMoreItems = async () => {
    if (isLoadingMore || !reportData || !reportData.tickets || reportData.tickets.current_page >= reportData.tickets.last_page) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = reportData.tickets.current_page + 1;

    try {
      const params = { page: nextPage };
      if (filter !== 'all') params.status = filter;
      if (filterType === 'month') {
        if (dateFilters.year) params.year = dateFilters.year;
        if (dateFilters.month) params.month = dateFilters.month;
      } else if (filterType === 'date_range') {
        if (dateFilters.start_date) params.start_date = dateFilters.start_date;
        if (dateFilters.end_date) params.end_date = dateFilters.end_date;
      }

      const res = await api.get(`/tickets/admin-report/${adminId}`, { params });

      setReportData(prev => ({
        ...prev,
        tickets: {
          ...res.data.tickets,
          data: [
            ...prev.tickets.data,
            ...res.data.tickets.data
          ]
        }
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

    if (nearBottom && !loading && !isLoadingMore && reportData && reportData.tickets && reportData.tickets.current_page < reportData.tickets.last_page) {
      loadMoreItems();
    }
  };

  const handleDownload = async (type) => {
    if (type === 'pdf') setExportingPdf(true);
    else setExportingExcel(true);

    const params = new URLSearchParams({ type, admin_id: admin.id, all: 'true' });
    if (filter !== 'all') params.append('status', filter);
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
      const fileName = `laporan-${admin.name}-${new Date().toISOString().split('T')[0]}.${extension}`;
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

  if (!admin) {
    return <p>Memuat data admin...</p>;
  }
  if (loading && !reportData) {
    return <p>Memuat data...</p>;
  }

  const { total, completed, rejected, in_progress } = reportData || {};
  const ticketsOnPage = (reportData && reportData.tickets) ? reportData.tickets.data : [];

  return (
    <motion.div
      className="user-management-container"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={staggerItem}
        className="user-management-header-report"
        style={{ marginBottom: '20px' }}
      >
        <h2 variants={staggerItem}>Laporan Penyelesaian - {admin.name}</h2>
      </motion.div>

      {!reportData ? <motion.p variants={staggerItem}>Memuat data statistik...</motion.p> : (
        <>
          <motion.div variants={staggerItem} className="summary-cards">
            <div className={`card ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterClick('all')}><h3>Total Tiket</h3><p>{total}</p></div>
            <div className={`card ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterClick('completed')}><h3>Tiket Selesai</h3><p>{completed}</p></div>
            <div className={`card ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => handleFilterClick('in_progress')}><h3>Tiket Belum Selesai</h3><p>{in_progress}</p></div>
            <div className={`card ${filter === 'rejected' ? 'active' : ''}`} onClick={() => handleFilterClick('rejected')}><h3>Tiket Ditolak</h3><p>{rejected}</p></div>
          </motion.div>


          <AnimatePresence>
            {isMobile && (
              <motion.div
                key="toggle-filter-button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  className="btn-toggle-filters"
                  onClick={() => setIsMobileFilterOpen(prev => !prev)}
                >
                  <i className={`fas ${isMobileFilterOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '8px' }}></i>
                  {isMobileFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isMobileFilterOpen && (
              <motion.div
                variants={staggerItem}
                className="filters-container"
              >
                <motion.div
                  key="mobile-filters-content"
                  initial={isMobile ? { height: 0, opacity: 0, y: -20, marginTop: 0, marginBottom: 0, overflow: 'hidden' } : false}
                  animate="open"
                  exit="closed"
                  transition={filterExpandTransition}
                  variants={filterExpandVariants}
                  className="filters-content-wrapper"
                >
                  <Select
                    value={activeFilterType}
                    onChange={handleFilterTypeChange}
                    options={filterTypeOptions}
                    classNamePrefix="report-filter-select"
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    styles={{
                      container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 })
                    }}
                  />
                  {filterType === 'month' && (
                    <>
                      <Select
                        name="month"
                        value={activeMonth}
                        onChange={handleDateFilterChange}
                        options={monthOptions}
                        classNamePrefix="report-filter-select"
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={{
                          container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                      <Select
                        name="year"
                        value={activeYear}
                        onChange={handleDateFilterChange}
                        options={yearOptions}
                        classNamePrefix="report-filter-select"
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={{
                          container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </>
                  )}
                  {filterType === 'date_range' && (
                    <motion.div
                      variants={staggerItem}
                      className='date-range-container'
                    >

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
                        min={dateFilters.start_date || undefined}
                      />
                    </motion.div>
                  )}

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={staggerItem} className="download-buttons">
            <button className="btn-download pdf" onClick={() => handleDownload('pdf')} disabled={exportingPdf}>
              <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
              {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
            </button>
            <button className="btn-download excel" onClick={() => handleDownload('excel')} disabled={exportingExcel}>
              <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
              {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
            </button>
          </motion.div>
          <motion.div variants={staggerItem} className="job-list-container">
            {(loading && !reportData.tickets) ? <p>Memuat tabel...</p> : (
              <div className="table-scroll-container">
                <table className="job-table">
                  <thead>
                    <tr>
                      <th>Kode Tiket</th>
                      <th>Judul</th>
                      <th>Status</th>
                      <th>Workshop</th>
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
                      {ticketsOnPage.length > 0 ? (
                        ticketsOnPage.map(t => (
                          <tr key={t.id} className="clickable-row" onClick={(e) => handleRowClick(e, t)}>
                            <td>{t.kode_tiket || '-'}</td>
                            <td>
                              <span className="description-cell">{t.title}</span>
                            </td>
                            <td>{t.status}</td>
                            <td>{t.workshop ? t.workshop.name : 'N/A'}</td>
                            <td>{t.creator?.name ?? '-'}</td>
                            <td>{formatDate(t.created_at)}</td>
                            <td>{formatDate(t.started_at)}</td>
                            <td>{formatDate(t.completed_at)}</td>
                            <td>{calculateDuration(t.started_at, t.completed_at)}</td>
                          </tr>
                        ))
                      ) : (
                        !isLoadingMore && <tr><td colSpan="9" style={{ textAlign: 'center' }}>Tidak ada tiket yang sesuai dengan filter ini.</td></tr> // <-- UBAH
                      )}
                      {isLoadingMore && (
                        <tr><td colSpan="9" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {!loading && ticketsOnPage.length > 0 && reportData && reportData.tickets && (
                  <table className="job-table">
                    <tfoot>
                      <tr className="subtotal-row">
                        <td colSpan={8}>Total Data</td>
                        <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                          {reportData.tickets.total} Data
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              </div>
            )}
          </motion.div>
          <motion.div
            variants={staggerItem}
            className="job-list-mobile"
            ref={mobileListRef}
            onScroll={handleScroll}
            style={{ overflowY: 'auto', maxHeight: '65vh' }}
          >
            {(loading && !reportData.tickets) ? (
              <p style={{ textAlign: 'center' }}>Memuat tiket...</p>
            ) : ticketsOnPage.length > 0 ? (
              ticketsOnPage.map((t) => (
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
                      <span className="value">{t.status}</span>
                    </div>
                    <div className="data-group">
                      <span className="label">Workshop</span>
                      <span className="value">{t.workshop ? t.workshop.name : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="data-group">
                      <span className="label">Pembuat</span>
                      <span className="value">{t.creator?.name ?? '-'}</span>
                    </div>
                    <div className="data-group">
                      <span className="label">Tgl Dibuat</span>
                      <span className="value">{formatDate(t.created_at)}</span>
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="data-group">
                      <span className="label">Mulai</span>
                      <span className="value">{formatDate(t.started_at)}</span>
                    </div>
                    <div className="data-group">
                      <span className="label">Selesai</span>
                      <span className="value">{formatDate(t.completed_at)}</span>
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="data-group single">
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
          {!loading && !isLoadingMore && ticketsOnPage.length > 0 && reportData && reportData.tickets && (
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
                  {reportData.tickets.total} Data
                </span>
              </div>

            </motion.div>
          )}
        </>
      )
      }
      <TicketDetailModal
        show={Boolean(selectedTicketForDetail)}
        ticket={selectedTicketForDetail}
        onClose={() => setSelectedTicketForDetail(null)}
      />
    </motion.div >
  );
}