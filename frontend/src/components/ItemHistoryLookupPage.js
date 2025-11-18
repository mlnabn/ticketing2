import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Select from 'react-select'; // 💡 NEW: Import Select
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { saveAs } from 'file-saver';
import QrScannerModal from './QrScannerModal';
import HistoryModal from './HistoryModal';
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

const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Maret' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];

// 💡 NEW: Opsi untuk Select Filter Type
const filterTypeOptions = [
    { value: 'month', label: 'Filter Riwayat per Bulan' },
    { value: 'date_range', label: 'Filter Riwayat per Tanggal' },
];

// 💡 NEW: Mengubah array months ke format react-select
const monthOptions = [
    { value: '', label: 'Semua Bulan' },
    ...months.map(m => ({ value: m.value.toString(), label: m.name })),
];


function ItemHistoryLookupPage() {
    const isPresent = useIsPresent();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(!isMobile);
    const { showToast } = useOutletContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [filterType, setFilterType] = useState('month');
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        month: '',
        year: new Date().getFullYear().toString()
    });
    const [years, setYears] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilters, setHistoryFilters] = useState({ start_date: '', end_date: '' });
    const [exportingHistoryExcel, setExportingHistoryExcel] = useState(false);
    const [exportingHistoryPdf, setExportingHistoryPdf] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);

    // 💡 NEW: Opsi tahun yang diubah ke format react-select
    const yearSelectOptions = [{ value: '', label: 'Semua Tahun' }, ...years.map(y => ({ value: y.toString(), label: y.toString() }))];


    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };
    const formatLogTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const formatEventDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const getApiParams = useCallback((page = 1) => {
        const baseParams = {
            page: page,
            type: 'all_stock',
            search: debouncedSearchTerm,
        };

        if (filterType === 'month') {
            if (filters.month) baseParams.month = filters.month;
            if (filters.year) baseParams.year = filters.year;
        } else {
            if (filters.start_date) baseParams.start_date = filters.start_date;
            if (filters.end_date) baseParams.end_date = filters.end_date;
        }
        return baseParams;
    }, [debouncedSearchTerm, filterType, filters]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setSelectedItem(null);
        setHistoryData([]);
        setItems([]);
        try {
            const params = getApiParams(1);
            const res = await api.get('/reports/inventory/detailed', { params });
            setItems(res.data.data);
            setPagination({
                currentPage: res.data.current_page,
                totalPages: res.data.last_page,
                total: res.data.total
            });
        } catch (error) {
            showToast('Gagal memuat data stok.', 'error');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [showToast, getApiParams]);

    useEffect(() => {
        if (!isPresent) return;
        api.get('/reports/inventory/dashboard')
            .then(res => {
                if (res.data.availableYears && res.data.availableYears.length > 0) {
                    setYears(res.data.availableYears);
                    if (!filters.year) {
                        setFilters(prev => ({ ...prev, year: res.data.availableYears[0] }));
                    }
                } else {
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

    useEffect(() => {
        if (!isPresent) return;
        fetchData();
    }, [fetchData, isPresent]);

    const getRelevantDate = (item) => {
        const latestHistoryRecord = item.latest_history;
        if (latestHistoryRecord) {
            return latestHistoryRecord.event_date || latestHistoryRecord.created_at;
        }
        switch (item.status_detail?.nama_status) {
            case 'Digunakan':
            case 'Dipinjam':
                return item.tanggal_keluar;
            case 'Rusak':
                return item.tanggal_rusak;
            case 'Hilang':
                return item.tanggal_hilang;
            case 'Perbaikan':
                return item.tanggal_mulai_perbaikan;
            case 'Tersedia':
                return item.updated_at;
            default:
                return item.updated_at;
        }
    };

    useEffect(() => {
        if (!isMobile) {
            setIsMobileFilterOpen(true);
        }
        else {
            setIsMobileFilterOpen(false);
        }
    }, [isMobile]);

    const getResponsiblePerson = (item) => {
        const latestHistoryRecord = item.latest_history;
        if (latestHistoryRecord) {
            if (latestHistoryRecord.related_user?.name) {
                return latestHistoryRecord.related_user.name;
            }
            if (latestHistoryRecord.triggered_by_user?.name) {
                return latestHistoryRecord.triggered_by_user.name;
            }
            return '-';
        }
        switch (item.status_detail?.nama_status) {
            case 'Digunakan':
            case 'Dipinjam': return item.user_peminjam?.name || item.workshop?.name || '-';
            case 'Rusak': return item.user_perusak?.name || '-';
            case 'Hilang': return item.user_penghilang?.name || '-';
            case 'Perbaikan': return item.teknisi_perbaikan?.name || '-';
            default: return '-';
        }
    };

    const handleSearchAndShowHistory = useCallback(async (code) => {
        if (!code) return;
        showToast(`Mencari riwayat untuk: ${code}`, 'info');
        setSelectedItem(null);
        setHistoryData([]);
        setLoading(true);
        try {
            const res = await api.get(`/inventory/stock-items/by-serial/${code}`);
            setSelectedItem(res.data);
            setItems([res.data]);
            setPagination(prev => ({ ...prev, total: 1 }));
        } catch (error) {
            showToast(`Aset dengan kode "${code}" tidak ditemukan.`, 'error');
            setItems([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const handleScanSuccess = (decodedText) => {
        setIsScannerOpen(false);
        handleSearchAndShowHistory(decodedText);
    };

    useEffect(() => {
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {
            const isModalOpen = isScannerOpen;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || isModalOpen) return;
            if (typeof e.key !== 'string') return;

            if (interval) clearInterval(interval);

            if (e.code === 'Enter' || e.key === 'Enter') {
                if (barcode) handleSearchAndShowHistory(barcode.trim());
                barcode = '';
                return;
            }

            if (e.key.length === 1) {
                barcode += e.key;
            }
            interval = setInterval(() => barcode = '', 50);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSearchAndShowHistory, isScannerOpen]);

    // 💡 KEEP: Handler untuk input native (tanggal)
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // 💡 NEW: Handler untuk Select Bulan/Tahun
    const handleSelectFilterChange = (selectedOption, name) => {
        setFilters(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    };

    // 💡 NEW: Handler untuk Select Filter Type (menggantikan handleFilterTypeChange lama)
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

    const fetchHistory = useCallback(async () => {
        if (!selectedItem?.id) return;
        setHistoryLoading(true);
        setHistoryData([]);
        try {
            const params = {
                start_date: historyFilters.start_date,
                end_date: historyFilters.end_date
            };
            const res = await api.get(`/inventory/stock-items/${selectedItem.id}/history`, { params });
            setHistoryData(res.data);
        } catch (error) {
            showToast('Gagal memuat riwayat aset.', 'error');
        } finally {
            setHistoryLoading(false);
        }
    }, [selectedItem, historyFilters, showToast]);

    useEffect(() => {
        if (!isPresent) return;
        fetchHistory();
    }, [fetchHistory, isPresent]);

    const handleHistoryFilterChange = (e) => {
        setHistoryFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleHistoryExport = async (exportType) => {
        if (!selectedItem) return;
        if (exportType === 'excel') setExportingHistoryExcel(true); else setExportingHistoryPdf(true);
        try {
            const params = {
                type: 'item_history',
                stok_barang_id: selectedItem.id,
                start_date: historyFilters.start_date,
                end_date: historyFilters.end_date,
                export_type: exportType
            };
            const response = await api.get('/reports/inventory/export', {
                params,
                responseType: 'blob',
            });
            const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `Riwayat_${selectedItem.kode_unik}_${new Date().toISOString().split('T')[0]}.${extension}`;
            saveAs(response.data, fileName);
        } catch (err) {
            console.error(`Gagal mengunduh riwayat ${exportType}:`, err);
            showToast('Gagal mengunduh riwayat. Mohon coba lagi.', 'error');
        } finally {
            if (exportType === 'excel') setExportingHistoryExcel(false); else setExportingHistoryPdf(false);
        }
    };

    const closeHistoryPanel = () => {
        setSelectedItem(null);
        setHistoryData([]);
        setHistoryFilters({ start_date: '', end_date: '' });
    };

    const loadMoreItems = async () => {
        if (isLoadingMore || pagination.currentPage >= pagination.totalPages) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pagination.currentPage + 1;
            const params = getApiParams(nextPage);
            const res = await api.get('/reports/inventory/detailed', { params });

            setItems(prevItems => [...prevItems, ...res.data.data]);
            setPagination(prev => ({
                ...prev,
                currentPage: res.data.current_page,
                totalPages: res.data.last_page
            }));
        } catch (error) {
            showToast('Gagal memuat data tambahan.', 'error');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && !loading && !isLoadingMore && pagination.currentPage < pagination.totalPages) {
            loadMoreItems();
        }
    };
    const handleItemClick = (item) => {
        setSelectedItem(item);
        if (isMobile) {
            setIsHistoryModalOpen(true);
        }
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
                <h1 className="page-title">Lacak Riwayat Aset</h1>
                <p className="page-description" style={{ textAlign: 'center' }}>Gunakan pencarian, klik item dari daftar, atau scan QR/Barcode untuk melihat riwayat lengkap sebuah aset.</p>

                <motion.div
                    variants={staggerItem}
                    className="action-buttons-stok">
                    <motion.input
                        variants={staggerItem}
                        type="text"
                        placeholder="Cari berdasarkan Kode Unik, S/N, atau Nama Barang..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="filter-search-input-invReport"
                    />
                    <button className="btn-scan history" onClick={() => setIsScannerOpen(true)}>
                        <span className="fa-stack" style={{fontSize: '0.8rem'}}>
                            <i className="fas fa-qrcode fa-stack-2x"></i>
                            <i className="fas fa-expand fa-stack-1x fa-inverse"></i>
                        </span>
                        Scan QR
                    </button>
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
                                    placeholder="Filter Riwayat"
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

                                        {/* 3. Filter Tahun: Select */}
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
                                        className='date-range-container'
                                    >
                                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-date" style={{ flex: 1 }} />
                                        <span style={{ alignSelf: 'center' }}>-</span>
                                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-date" style={{ flex: 1 }} />
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div variants={staggerItem} className={`split-view-container ${selectedItem ? 'split-view-active' : ''}`}>
                    <div className="list-panel">
                        <div className="job-list-container">
                            {/* Desktop View */}
                            <div className="table-scroll-container" style={{ maxHeight: '65vh' }}>
                                <table className="job-table">
                                    <thead>
                                        <tr>
                                            <th>Kode Unik</th>
                                            <th>Nama Barang</th>
                                            <th className={selectedItem ? 'hide-on-narrow' : ''}>Status Saat Ini</th>
                                            <th className={selectedItem ? 'hide-on-narrow' : ''}>Tgl Kejadian Terakhir</th>
                                            <th className={selectedItem ? 'hide-on-narrow' : ''}>Penanggung Jawab/Pengguna Terakhir</th>
                                        </tr>
                                    </thead>
                                </table>
                                <div
                                    ref={desktopListRef}
                                    onScroll={handleScroll}
                                    style={{ overflowY: 'auto', maxHeight: 'calc(65vh - 45px)' }}
                                >
                                    <table className="job-table">
                                        <tbody>
                                            {loading && (
                                                <tr><td colSpan={selectedItem ? 2 : 5} style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                            )}

                                            {!loading && items.map(item => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
                                                    style={{ cursor: 'pointer' }}
                                                    className={`hoverable-row ${selectedItem?.id === item.id ? 'selected-row' : ''}`}
                                                >
                                                    <td>{item.kode_unik}</td>
                                                    <td>{item.master_barang?.nama_barang || 'N/A'}</td>
                                                    <td className={selectedItem ? 'hide-on-narrow' : ''}>
                                                        <span className={`badge-status status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {item.status_detail?.nama_status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className={selectedItem ? 'hide-on-narrow' : ''}>{formatDate(getRelevantDate(item))}</td>
                                                    <td className={selectedItem ? 'hide-on-narrow' : ''}>{getResponsiblePerson(item)}</td>
                                                </tr>
                                            ))}

                                            {isLoadingMore && (
                                                <tr><td colSpan={selectedItem ? 2 : 5} style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                            )}

                                            {!loading && !isLoadingMore && items.length === 0 && (
                                                <tr><td colSpan={selectedItem ? 2 : 5} style={{ textAlign: 'center' }}>Tidak ada data ditemukan.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!loading && items.length > 0 && (
                                    <table className="job-table">
                                        <tfoot>
                                            <tr className="subtotal-row">
                                                <td colSpan={selectedItem ? 1 : 4}>Total Aset</td>
                                                <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                                    {pagination.total} Data
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>

                            {/* Mobile View */}
                            <div
                                className="job-list-mobile"
                                ref={mobileListRef}
                                onScroll={handleScroll}
                                style={{ overflowY: 'auto', maxHeight: '65vh' }}
                            >
                                {loading ? (<p style={{ textAlign: 'center' }}>Memuat...</p>) : items.length > 0 ? (
                                    items.map(item => (
                                        <div
                                            key={item.id}
                                            className={`ticket-card-mobile clickable-row ${selectedItem?.id === item.id ? 'selected-row' : ''}`}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="card-row">
                                                <div className="data-group single">
                                                    <span className="label">Nama Barang</span>
                                                    <span className="value description">{item.master_barang?.nama_barang || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="card-row">
                                                <div className="data-group">
                                                    <span className="label">Kode Unik</span>
                                                    <span className="value">{item.kode_unik}</span>
                                                </div>
                                                <div className="data-group">
                                                    <span className="label">Status Saat Ini</span>
                                                    <span className="value">
                                                        <span className={`status-badge status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {item.status_detail?.nama_status || 'N/A'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-row">
                                                <div className="data-group single">
                                                    <span className="label">Tgl Kejadian Terakhir</span>
                                                    <span className="value">{formatDate(getRelevantDate(item))}</span>
                                                </div>
                                            </div>
                                            <div className="card-row">
                                                <div className="data-group single">
                                                    <span className="label">Lokasi/Pengguna Terakhir</span>
                                                    <span className="value">{getResponsiblePerson(item)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (<p style={{ textAlign: 'center' }}>Tidak ada data.</p>)}
                                {isLoadingMore && (<p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>)}
                            </div>
                            <div className='job-list-mobile'>
                                {!loading && !isLoadingMore && items.length > 0 && (
                                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Aset</span>
                                        <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                            {pagination.total} Data
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === PANEL KANAN: RIWAYAT ITEM === */}
                    {selectedItem && !isMobile && (
                        <div className="history-panel">
                            <div className="history-panel-header">
                                <h4>Riwayat Aset: {selectedItem.master_barang?.nama_barang} ({selectedItem.kode_unik})</h4>
                                <button onClick={closeHistoryPanel} className="close-button">&times;</button>
                            </div>

                            <div className="history-panel-controls">
                                <div className="date-filters">
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={historyFilters.start_date}
                                        onChange={handleHistoryFilterChange}
                                        className="filter-select-date"
                                    />
                                    <span>-</span>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={historyFilters.end_date}
                                        onChange={handleHistoryFilterChange}
                                        className="filter-select-date"
                                    />
                                </div>
                                <div className="download-buttons">
                                    <button onClick={() => handleHistoryExport('excel')} className="btn-download excel" disabled={exportingHistoryExcel}>
                                        <i className="fas fa-file-excel"></i> {exportingHistoryExcel ? '...' : 'Ekspor Excel'}
                                    </button>
                                    <button onClick={() => handleHistoryExport('pdf')} className="btn-download pdf" disabled={exportingHistoryPdf}>
                                        <i className="fas fa-file-pdf"></i> {exportingHistoryPdf ? '...' : 'Ekspor PDF'}
                                    </button>
                                </div>
                            </div>

                            <div className="history-list-scroll">
                                {historyLoading ? (
                                    <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat riwayat...</p>
                                ) : historyData.length > 0 ? (
                                    historyData.map(log => (
                                        <div key={log.id} className="history-log-item">
                                            <div className="info-row full-width" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #4A5568' }}>
                                                <span className="info-label" style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Dicatat pada: {formatLogTime(log.created_at)}</span>
                                            </div>
                                            <div className="form-row2">
                                                <div className="info-row">
                                                    <span className="info-label">Status</span>
                                                    <span className="info-value-info" style={{ fontWeight: 'bold' }}>{log.status_detail?.nama_status || 'N/A'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Tanggal Kejadian</span>
                                                    <span className="info-value-info">{formatEventDate(log.event_date)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Aksi oleh</span>
                                                    <span className="info-value-info">{log.triggered_by_user?.name || 'Sistem'}</span>
                                                </div>
                                                {log.related_user && (
                                                    <div className="info-row">
                                                        <span className="info-label">Terkait</span>
                                                        <span className="info-value-info">{log.related_user.name}</span>
                                                    </div>
                                                )}
                                                {log.workshop && (
                                                    <div className="info-row">
                                                        <span className="info-label">Lokasi</span>
                                                        <span className="info-value-info">{log.workshop.name}</span>
                                                    </div>

                                                )}
                                                {log.deskripsi && (
                                                    <div className="info-row full-width">
                                                        <span className="info-label">Catatan</span>
                                                        <span className="info-value-info" style={{ whiteSpace: 'pre-wrap' }}>{log.deskripsi}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada riwayat ditemukan untuk filter ini.</p>
                                )}
                            </div>

                            {!historyLoading && historyData.length > 0 && (
                                <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', borderTop: '1px solid #4A5568', borderRadius: '12px' }}>
                                    <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Riwayat (Barang ini)</span>
                                    <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                        {historyData.length} Data
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
            <QrScannerModal
                show={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            <HistoryModal
                show={isHistoryModalOpen && Boolean(selectedItem) && isMobile}
                item={selectedItem}
                showToast={showToast}
                startDate={historyFilters.start_date}
                endDate={historyFilters.end_date}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    closeHistoryPanel();
                }}
            />
        </motion.div>
    );
}

export default ItemHistoryLookupPage;