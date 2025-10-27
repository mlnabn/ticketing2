import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { saveAs } from 'file-saver';
import ActiveLoanDetailModal from './ActiveLoanDetailModal';


const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Maret' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];

export default function ActiveLoanReportPage() {
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
    const type = 'active_loans';
    const title = 'Laporan Peminjaman Aktif';

    const getApiParams = useCallback((page = 1, isExport = false) => {
        const baseParams = {
            type,
            search: isExport ? searchTerm : debouncedSearchTerm,
        };

        if (filterType === 'month') {
            baseParams.month = filters.month;
            baseParams.year = filters.year;
        } else {
            baseParams.start_date = filters.start_date;
            baseParams.end_date = filters.end_date;
        }

        if (isExport) {
            baseParams.export_type = isExport;
            baseParams.all = true;
        } else {
            baseParams.page = page;
        }
        return baseParams;
    }, [type, searchTerm, debouncedSearchTerm, filterType, filters]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData([]);
        try {
            const params = getApiParams(1, false);
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

    useEffect(() => {
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
    }, [filters.year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
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

    const handleExport = async (exportType) => {
        if (exportType === 'excel') setExportingExcel(true);
        else setExportingPdf(true);

        try {
            const params = getApiParams(1, exportType);

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

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && !loading && !isLoadingMore && pagination.currentPage < pagination.totalPages) {
            loadMoreItems();
        }
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header-report">
                <h1>{title}</h1>
            </div>

            <div className="filters-container report-filters">
                <input
                    type="text"
                    placeholder="Cari Kode Unik / Nama Barang / Peminjam..."
                    className="filter-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

            </div>
            <div className="report-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <select value={filterType} onChange={handleFilterTypeChange} className="filter-select">
                    <option value="month">Filter per Bulan</option>
                    <option value="date_range">Filter per Tanggal</option>
                </select>
                {filterType === 'month' && (
                    <>
                        <select name="month" value={filters.month} onChange={handleFilterChange} className="filter-select">
                            <option value="">Semua Bulan</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                        <select name="year" value={filters.year} onChange={handleFilterChange} className="filter-select">
                            <option value="">Semua Tahun</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </>
                )}
                {filterType === 'date_range' && (
                    <>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-date" />
                        <span style={{ alignSelf: 'center' }}>-</span>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-date" />
                    </>
                )}
            </div>
            <div className="download-buttons">
                <button onClick={() => handleExport('excel')} disabled={exportingExcel} className="btn-download excel">
                    <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                    {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExport('pdf')} disabled={exportingPdf} className="btn-download pdf">
                    <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                    {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                </button>
            </div>

            <div className="job-list-container">
                {/* Tampilan Desktop */}
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Kode Unik</th>
                                <th>Nama Barang</th>
                                <th>Status</th>
                                <th>Peminjam</th>
                                <th>Lokasi</th>
                                <th>Tgl Pinjam</th>
                                <th>Durasi Pinjam</th>
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
                                            <td>{item.kode_unik || '-'}</td>
                                            <td>{item.master_barang?.nama_barang || '-'}</td>
                                            <td>{item.status_detail?.nama_status || '-'}</td>
                                            <td>{item.user_peminjam?.name || '-'}</td>
                                            <td>{item.workshop?.name || '-'}</td>
                                            <td>{formatDate(item.tanggal_keluar)}</td>
                                            <td style={getDurationStyle(duration.days)}>{duration.text}</td>
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
                {/*Tampilan Mobile */}
                <div
                    className="job-list-mobile"
                    ref={mobileListRef}
                    onScroll={handleScroll}
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
                                        <span className="label">Kode Unik</span>
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
                    {!loading && !isLoadingMore && data.length > 0 && (
                        <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem' }}>
                            <span className="subtotal-label">Total Peminjaman</span>
                            <span className="subtotal-value value-acquisition" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {pagination.total} Data
                            </span>
                        </div>
                    )}

                    {isLoadingMore && (
                        <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                    )}

                    {!loading && !isLoadingMore && data.length === 0 && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada data peminjaman aktif.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <ActiveLoanDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    formatDate={formatDate}
                    calculateDuration={calculateDuration}
                />
            )}
        </div>
    );
}