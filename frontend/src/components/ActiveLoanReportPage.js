import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import Select from 'react-select';
import api from '../services/api';
import { saveAs } from 'file-saver';
import ActiveLoanDetailModal from './ActiveLoanDetailModal';
import { motion, useIsPresent, AnimatePresence } from 'framer-motion';

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
const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Maret' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];
const filterTypeOptions = [
    { value: 'month', label: 'Filter per Bulan' },
    { value: 'date_range', label: 'Filter per Tanggal' },
];
const monthOptions = [
    { value: '', label: 'Semua Bulan' },
    ...months.map(m => ({ value: m.value.toString(), label: m.name })),
];

const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768;

export default function ActiveLoanReportPage() {
    const isPresent = useIsPresent();
    const type = 'active_loans';
    const title = 'Laporan Peminjaman Aktif';
    const [isMobile, setIsMobile] = useState(isMobileDevice());
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(!isMobileDevice());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('month');
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        month: '',
        year: new Date().getFullYear().toString()
    });
    const [years, setYears] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [selectedItem, setSelectedItem] = useState(null);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);
    const yearOptions = years.map(y => ({ value: y.toString(), label: y.toString() }));
    const yearSelectOptions = [{ value: '', label: 'Semua Tahun' }, ...yearOptions];


    // --- Helper Functions ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const calculateDuration = (startDate) => {
        if (!startDate) return { text: '-', days: 0 };
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { text: 'Hari ini', days: 0 };
        if (diffDays === 1) return { text: '1 hari', days: 1 };
        return { text: `${diffDays} hari`, days: diffDays };
    };

    const getDurationStyle = (days) => {
        if (days > 30) return { color: '#ef4444', fontWeight: 'bold' };
        if (days > 7) return { color: '#f97316' };
        return {};
    };

    const getApiParams = useCallback((page = 1) => {
        const baseParams = {
            type,
            search: debouncedSearchTerm,
        };

        if (filterType === 'month') {
            baseParams.month = filters.month;
            baseParams.year = filters.year;
        } else {
            baseParams.start_date = filters.start_date;
            baseParams.end_date = filters.end_date;
        }

        baseParams.page = page;
        return baseParams;
    }, [type, debouncedSearchTerm, filterType, filters]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData([]);
        try {
            const params = getApiParams(1);
            const res = await api.get('/reports/inventory/detailed', { params });
            setData(res.data.data);
            setPagination({
                currentPage: res.data.current_page,
                totalPages: res.data.last_page,
                total: res.data.total
            });
        } catch (error) {
            console.error(`Gagal memuat laporan ${type}`, error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [getApiParams, type]);

    const loadMoreItems = async () => {
        if (isLoadingMore || pagination.currentPage >= pagination.totalPages) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pagination.currentPage + 1;
            const params = getApiParams(nextPage, false);
            const res = await api.get('/reports/inventory/detailed', { params });

            setData(prevData => [...prevData, ...res.data.data]);
            setPagination(prev => ({
                ...prev,
                currentPage: res.data.current_page,
                totalPages: res.data.last_page
            }));
        } catch (error) {
            console.error('Gagal memuat data tambahan', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters(prevFilters => {
        let newFilters = { ...prevFilters, [name]: value };

        // --- Logika Khusus untuk 'start_date' ---
        if (name === 'start_date') {
            const currentEndDate = prevFilters.end_date;
            
            if (value === '') {
                newFilters.end_date = '';
            } else {
                const newStartDateObj = new Date(value);
                const currentEndDateObj = currentEndDate ? new Date(currentEndDate) : null;
                if (currentEndDate === '' || !currentEndDateObj || currentEndDateObj < newStartDateObj) {
                    newFilters.end_date = value;
                }
            }
        }
        if (newFilters.start_date && newFilters.end_date) {
            const startDate = new Date(newFilters.start_date);
            const endDate = new Date(newFilters.end_date);
            if (endDate < startDate) {
                newFilters.end_date = newFilters.start_date;
            }
        }
        
        return newFilters;
    });
};

    const handleSelectFilterChange = (selectedOption, name) => {
        setFilters(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    };
    const handleSelectFilterTypeChange = (selectedOption) => {
        const newType = selectedOption.value;
        setFilterType(newType);
        setFilters(prev => ({
            ...prev,
            start_date: '',
            end_date: '',
            month: '',
        }));
    };

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.action-buttons-group')) {
            return;
        }
        setSelectedItem(item);
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && !loading && !isLoadingMore && pagination.currentPage < pagination.totalPages) {
            loadMoreItems();
        }
    };

    const handleExport = async (exportType) => {
        if (exportType === 'excel') setExportingExcel(true);
        else setExportingPdf(true);

        try {
            const params = {
                type,
                search: searchTerm,
                export_type: exportType,
                all: true,
                month: filterType === 'month' ? filters.month : '',
                year: filterType === 'month' ? filters.year : '',
                start_date: filterType === 'date_range' ? filters.start_date : '',
                end_date: filterType === 'date_range' ? filters.end_date : '',
            };

            const response = await api.get('/reports/inventory/export', {
                params,
                responseType: 'blob',
            });

            const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `Laporan_Peminjaman_Aktif_${new Date().toISOString().split('T')[0]}.${extension}`;
            saveAs(response.data, fileName);

        } catch (err) {
            console.error(`Gagal mengunduh file ${exportType}:`, err);
            alert('Gagal mengunduh file. Mohon coba lagi.');
        } finally {
            if (exportType === 'excel') setExportingExcel(false);
            else setExportingPdf(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyDesktop = window.innerWidth >= 768;
            setIsMobile(!isCurrentlyDesktop);
            if (isCurrentlyDesktop) {
                setIsMobileFilterOpen(true);
            }
            else {
                setIsMobileFilterOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isPresent) return;
        api.get('/reports/inventory/dashboard')
            .then(res => {
                const availableYears = res.data.availableYears || [];
                setYears(availableYears);
                if (availableYears.length > 0 && !filters.year) {
                    setFilters(prev => ({ ...prev, year: availableYears[0] }));
                } else if (availableYears.length === 0) {
                    const currentYear = new Date().getFullYear().toString();
                    setYears([currentYear]);
                }
            })
            .catch(err => {
                console.error("Gagal memuat data tahun", err);
                const currentYear = new Date().getFullYear().toString();
                setYears([currentYear]);
            });
    }, [filters.year, isPresent]);

    // Efek untuk memuat data laporan
    useEffect(() => {
        if (!isPresent) return;
        fetchData();
    }, [fetchData, isPresent]);
    // --- End Effects ---

    const columnStyles = {
        col1: { textAlign: 'center' },
        col2: { textAlign: 'left' },
    };

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
                <h1>{title}</h1>
            </motion.div>

            <motion.div variants={staggerItem} className="action-buttons-stok">
                <motion.input
                    type="text"
                    placeholder="Cari Kode SKU / Nama Barang / Peminjam..."
                    className="filter-search-input-invReport"
                    value={searchTerm}
                    variants={staggerItem}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="download-button-group">
                    <button onClick={() => handleExport('excel')} disabled={exportingExcel} className="btn-download excel">
                        <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                        {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                    </button>
                    <button onClick={() => handleExport('pdf')} disabled={exportingPdf} className="btn-download pdf">
                        <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                        {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                    </button>
                </div>
            </motion.div>

            {isMobile && (
                <motion.button
                    variants={staggerItem}
                    className="btn-toggle-filters"
                    onClick={() => setIsMobileFilterOpen(prev => !prev)}
                >
                    <i className={`fas ${isMobileFilterOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '8px' }}></i>
                    {isMobileFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                </motion.button>
            )}

            <AnimatePresence initial={false}>
                {isMobileFilterOpen && (
                    <motion.div
                        variants={staggerItem}
                        className="filters-container"
                    >
                        <motion.div
                            key="mobile-filters-content"
                            initial={isMobile ? "closed" : false}
                            animate="open"
                            exit="closed"
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 25
                            }}
                            variants={{
                                closed: { height: 0, opacity: 0, overflow: 'hidden', marginTop: 0, marginBottom: 0 },
                                open: { height: 'auto', opacity: 1, overflow: 'visible', marginTop: '0.75rem', marginBottom: '0.75rem' }
                            }}
                            className="filters-content-wrapper"
                        >

                            {/* 1. Filter Tipe: Select */}
                            <Select
                                classNamePrefix="report-filter-select"
                                options={filterTypeOptions}
                                value={filterTypeOptions.find(opt => opt.value === filterType)}
                                onChange={handleSelectFilterTypeChange}
                                isSearchable={false}
                                placeholder="Filter Laporan"
                                menuPortalTarget={document.body}
                                styles={{
                                    container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                            />

                            {filterType === 'month' && (
                                <>
                                    {/* 2. Filter Bulan: Select */}
                                    <Select
                                        classNamePrefix="report-filter-select"
                                        name="month"
                                        options={monthOptions}
                                        value={monthOptions.find(m => m.value === filters.month)}
                                        onChange={(selectedOption) => handleSelectFilterChange(selectedOption, 'month')}
                                        placeholder="Semua Bulan"
                                        isSearchable={false}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            container: (base) => ({ ...base, flex: 1, zIndex: 999 }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                        }}
                                    />
                                    <Select
                                        classNamePrefix="report-filter-select"
                                        name="year"
                                        options={yearSelectOptions}
                                        value={yearSelectOptions.find(y => y.value === filters.year)}
                                        onChange={(selectedOption) => handleSelectFilterChange(selectedOption, 'year')}
                                        placeholder="Semua Tahun"
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
                                    className="date-range-container"
                                >
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={filters.start_date}
                                        onChange={handleFilterChange}
                                        className="filter-select-date"
                                    />
                                    <span style={{ alignSelf: 'center' }}>-</span>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={filters.end_date}
                                        onChange={handleFilterChange}
                                        className="filter-select-date"
                                        min={filters.start_date || undefined}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={staggerItem} className="job-list-container">
                {/* Tampilan Desktop */}
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th style={columnStyles.col1}>Kode SKU</th>
                                <th style={columnStyles.col1}>Nama Barang</th>
                                <th style={columnStyles.col1}>Status</th>
                                <th style={columnStyles.col1}>Peminjam</th>
                                <th style={columnStyles.col1}>Lokasi</th>
                                <th style={columnStyles.col1}>Tgl Pinjam</th>
                                <th style={columnStyles.col1}>Durasi Pinjam</th>
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
                                {loading && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                )}
                                {!loading && data.map(item => {
                                    const duration = calculateDuration(item.tanggal_keluar);
                                    return (
                                        <tr key={item.id} className="hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                            <td style={columnStyles.col1}>{item.kode_unik || '-'}</td>
                                            <td style={columnStyles.col2}>{item.master_barang?.nama_barang || '-'}</td>
                                            <td style={columnStyles.col2}>{item.status_detail?.nama_status || '-'}</td>
                                            <td style={columnStyles.col2}>{item.user_peminjam?.name || '-'}</td>
                                            <td style={columnStyles.col2}>{item.workshop?.name || '-'}</td>
                                            <td style={columnStyles.col2}>{formatDate(item.tanggal_keluar)}</td>
                                            <td style={{ ...getDurationStyle(duration.days), ...columnStyles.col2 }}>{duration.text}</td>
                                        </tr>
                                    )
                                })}
                                {isLoadingMore && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                )}
                                {!loading && !isLoadingMore && data.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Tidak ada data peminjaman aktif.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && data.length > 0 && (
                        <table className="job-table">
                            <tfoot>
                                <tr className="subtotal-row">
                                    <td colSpan="6">Total Peminjaman</td>
                                    <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                        {pagination.total} Data
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {/* Tampilan Mobile */}
                <div
                    className="job-list-mobile"
                    ref={mobileListRef}
                    onScroll={handleScroll}
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {loading && (
                        <p style={{ textAlign: 'center' }}>Memuat data...</p>
                    )}

                    {!loading && data.map(item => {
                        const duration = calculateDuration(item.tanggal_keluar);
                        return (
                            <div key={item.id} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                <div className="card-row">
                                    <div className="data-group single">
                                        <span className="label">Nama Barang</span>
                                        <span className="value description">
                                            {item.master_barang?.nama_barang || '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">Kode SKU</span>
                                        <span className="value">{item.kode_unik || '-'}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Peminjam</span>
                                        <span className="value">{item.user_peminjam?.name || '-'}</span>
                                    </div>
                                </div>
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">Lokasi</span>
                                        <span className="value">{item.workshop?.name || '-'}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Status</span>
                                        <span className="value">{item.status_detail?.nama_status || '-'}</span>
                                    </div>
                                </div>
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">Tgl Pinjam</span>
                                        <span className="value">{formatDate(item.tanggal_keluar)}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Durasi Pinjam</span>
                                        <span className="value" style={getDurationStyle(duration.days)}>
                                            {duration.text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isLoadingMore && (
                        <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                    )}

                    {!loading && !isLoadingMore && data.length === 0 && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada data peminjaman aktif.</p>
                        </div>
                    )}
                </div>

            </motion.div>

            {/* Total Peminjaman untuk Mobile */}
            <motion.div className='job-list-mobile'>
                {!loading && !isLoadingMore && data.length > 0 && (
                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Peminjaman</span>
                        <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {pagination.total} Data
                        </span>
                    </div>
                )}
            </motion.div>

            <ActiveLoanDetailModal
                show={Boolean(selectedItem)}
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                formatDate={formatDate}
                calculateDuration={calculateDuration}
            />
        </motion.div>
    );
}