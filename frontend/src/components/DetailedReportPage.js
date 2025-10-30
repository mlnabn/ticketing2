import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { saveAs } from 'file-saver';
import InventoryDetailModal from './InventoryDetailModal';

const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Maret' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];

export default function DetailedReportPage({ type, title }) {
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
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);

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
            })
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
                    if (!filters.year) { //
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

            let reportName = 'Laporan';
            switch (type) {
                case 'in': reportName = 'Laporan_Barang_Masuk'; break;
                case 'out': reportName = 'Laporan_Barang_Keluar'; break;
                case 'available': reportName = 'Laporan_Barang_Tersedia'; break;
                case 'accountability': reportName = 'Laporan_Hilang_Rusak'; break;
                case 'active_loans': reportName = 'Laporan_Peminjaman_Aktif'; break;
                default: reportName = 'Laporan_Inventaris';
            }
            const fileName = `${reportName}_${new Date().toISOString().split('T')[0]}.${extension}`;

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
    const formatCurrency = (value) => {
        if (isNaN(value)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getItemData = (item) => {
        if (type === 'available' || type === 'active_loans') {
            return {
                kode_unik: item.kode_unik,
                serial_number: item.serial_number || '-',
                nama_barang: item.master_barang?.nama_barang || 'N/A',
                status: item.status_detail?.nama_status || 'N/A',
                tanggal: (type === 'available' ? item.tanggal_masuk : item.tanggal_keluar),
                penanggung_jawab: (type === 'available' ? item.created_by?.name : item.user_peminjam?.name) || '-',
                workshop: item.workshop?.name || '-',
                current_status: item.status_detail?.nama_status || 'N/A',
            };
        }

        else if (type === 'accountability') {
            let responsibleUser = '-';
            let eventDate = item.updated_at; // Default ke tanggal update terakhir
            const currentStatus = item.status_detail?.nama_status || 'N/A';

            if (currentStatus === 'Rusak' && item.user_perusak) {
                responsibleUser = item.user_perusak.name;
                eventDate = item.tanggal_rusak || eventDate;
            } else if (currentStatus === 'Hilang' && item.user_penghilang) {
                responsibleUser = item.user_penghilang.name;
                eventDate = item.tanggal_hilang || eventDate;
            } else if (currentStatus === 'Perbaikan' && item.teknisi_perbaikan) {
                responsibleUser = item.teknisi_perbaikan.name;
                 eventDate = item.tanggal_mulai_perbaikan || eventDate;
            }

             return {
                kode_unik: item.kode_unik,
                serial_number: item.serial_number || '-',
                nama_barang: item.master_barang?.nama_barang || 'N/A',
                // Kolom 'status' sekarang adalah status SAAT INI
                status: currentStatus, 
                tanggal: eventDate, // Tanggal relevan dengan status
                penanggung_jawab: responsibleUser,
                workshop: item.workshop?.name || '-', // Mungkin relevan jika rusak/hilang saat dipinjam
                current_status: currentStatus, // Sama dengan 'status'
             };
        }

        else{
            const stokInfo = item.stok_barang || {};
            const masterInfo = stokInfo.master_barang || {};
            const historyDate = item.event_date || item.created_at;
            const triggeredBy = item.triggered_by_user?.name || '-';
            const workshopName = item.workshop?.name || stokInfo.workshop?.name || '-';
            const historyStatus = item.status_detail?.nama_status || 'N/A';
            const currentStatus = stokInfo.status_detail?.nama_status || 'N/A';
            const previousStatus = item.previous_status_detail?.nama_status || 'Tersedia';

            return {
                kode_unik: stokInfo.kode_unik || '-',
                serial_number: stokInfo.serial_number || '-',
                nama_barang: masterInfo.nama_barang || 'N/A',
                status_dari: previousStatus,
                status: historyStatus,
                tanggal: historyDate,
                penanggung_jawab: triggeredBy,
                workshop: workshopName,
                current_status: currentStatus,
            };
        }
    };

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.action-buttons-group')) {
            return;
        }
        const kodeUnik = (type === 'available' || type === 'active_loans')
            ? item.kode_unik
            : item.stok_barang?.kode_unik;
        if (kodeUnik) {
            setSelectedItem(kodeUnik);
        }
    };

    const dateHeaders = {
        in: 'Tgl Masuk',
        out: 'Tgl Status Diubah',
        available: 'Tgl Masuk',
        accountability: 'Tgl Status',
        active_loans: 'Tgl Keluar'
    };
    // const showWorkshop = type === 'out' || type === 'accountability';
    // const showCurrentStatus = type === 'out' || type === 'accountability';
    // const showStatusDari = type === 'in' || type === 'out' || type === 'accountability' || type === 'item_history';

    // Status Dari hanya untuk history
    const showStatusDari = type === 'in' || type === 'out' || type === 'item_history'; 
    // Status Kejadian hanya untuk history
    const showStatusKejadian = type === 'in' || type === 'out' || type === 'item_history'; 
    // Penanggung Jawab Kejadian hanya untuk history
    const showPJKejadian = type === 'in' || type === 'out' || type === 'item_history'; 

    // Status Saat Ini & Penanggung Jawab Status hanya untuk list barang (bukan history)
    const showCurrentStatus = type === 'available' || type === 'active_loans' || type === 'accountability' || type === 'all_stock';
    const showPJStatus = type === 'available' || type === 'active_loans' || type === 'accountability' || type === 'all_stock';
    
    // Workshop relevan untuk peminjaman dan history keluar/accountability
    const showWorkshop = type === 'out' || type === 'accountability' || type === 'active_loans';

    // const totalColSpan = 6 + (showWorkshop ? 1 : 0) + (showCurrentStatus ? 1 : 0) + (showStatusDari ? 1 : 0);

    const totalColSpan = 3 
                         + (showStatusDari ? 1 : 0) 
                         + (showStatusKejadian ? 1 : 0) 
                         + 1 
                         + (showPJKejadian ? 1 : 0)
                         + (showWorkshop ? 1 : 0) 
                         + (showCurrentStatus ? 1 : 0)
                         + (showPJStatus ? 1 : 0);

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
                    placeholder="Cari Kode Unik / Nama Barang..."
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
                {/*Desktop view*/}
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Kode Unik</th>
                                <th>Serial Number</th>
                                <th>Nama Barang</th>
                                {showStatusDari && <th>Status Dari</th>} 
                                {showStatusKejadian && <th>Status Perubahan</th>}
                                <th>{dateHeaders[type] || 'Tanggal'}</th>
                                {showPJKejadian && <th>Penanggung Jawab Kejadian</th>}
                                {showWorkshop && <th>Workshop</th>}
                                {showCurrentStatus && <th>Status Saat Ini</th>}
                                {showPJStatus && <th>Penanggung Jawab Status</th>}
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
                                    <tr><td colSpan={totalColSpan} style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                )}

                                {!loading && data.map(item => {
                                    const itemData = getItemData(item);
                                    return (
                                        <tr key={item.id} className="hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                            <td>{itemData.kode_unik || '-'}</td>
                                            <td>{itemData.serial_number || '-'}</td>
                                            <td>{itemData.nama_barang || '-'}</td>
                                            {showStatusDari && <td>{itemData.status_dari || '-'}</td>}
                                            {showStatusKejadian && <td>{itemData.status || '-'}</td>}
                                            <td>{formatDate(itemData.tanggal)}</td>
                                            {showPJKejadian && <td>{itemData.penanggung_jawab || '-'}</td>}
                                            {showWorkshop && <td>{itemData.workshop || '-'}</td>}
                                            {showCurrentStatus && (
                                                <td>
                                                    <span className={`badge-status status-${(itemData.current_status || '-').toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {itemData.current_status || '-'}
                                                    </span>
                                                </td>
                                            )}
                                             {showPJStatus && <td>{itemData.penanggung_jawab || '-'}</td>}
                                        </tr>
                                    )
                                })}

                                {isLoadingMore && (
                                    <tr><td colSpan={totalColSpan} style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                )}

                                {!loading && !isLoadingMore && data.length === 0 && (
                                    <tr><td colSpan={totalColSpan} style={{ textAlign: 'center' }}>Tidak ada data untuk ditampilkan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && data.length > 0 && (
                        <table className="job-table">
                            <tfoot>
                                <tr className="subtotal-row">
                                    <td colSpan={totalColSpan - 1}>Total Data</td>
                                    <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                        {pagination.total} Data
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
                {/* Mobile view */}
                <div
                    className="job-list-mobile"
                    ref={mobileListRef}
                    onScroll={handleScroll}
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {loading && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Memuat data...</p></div>
                    )}

                    {!loading && data.map(item => {
                        const itemData = getItemData(item);
                        return (
                            <div key={`mobile-detail-${item.id}`} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                <div className="card-row">
                                    <div className="data-group single">
                                        <span className="label">Nama Barang</span>
                                        <span className="value description">{itemData.nama_barang || '-'}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Kode Unik</span>
                                        <span className="value">{itemData.kode_unik || '-'}</span>
                                    </div>
                                </div>
                                <div className="card-row">
                                    {showStatusDari && (
                                        <div className="data-group">
                                            <span className="label">Status Dari</span>
                                            <span className="value">{itemData.status_dari || '-'}</span>
                                        </div>
                                    )}
                                    <div className="data-group">
                                        <span className="label">Status Kejadian</span>
                                        <span className="value">{itemData.status || '-'}</span>
                                    </div>
                                </div>
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">{dateHeaders[type] || 'Tanggal'}</span>
                                        <span className="value">{formatDate(itemData.tanggal)}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Penanggung Jawab</span>
                                        <span className="value">{itemData.penanggung_jawab || '-'}</span>
                                    </div>
                                </div>
                                {showWorkshop && (
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Workshop</span>
                                            <span className="value">{itemData.workshop || '-'}</span>
                                        </div>
                                        {showCurrentStatus && (
                                            <div className="data-group">
                                                <span className="label">Status Saat Ini</span>
                                                <span className="value">{itemData.current_status || '-'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!loading && !isLoadingMore && data.length > 0 && (
                        <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem' }}>
                            <span className="subtotal-label">Total Riwayat</span>
                            <span className="subtotal-value value-acquisition" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {pagination.total} Data
                            </span>
                        </div>
                    )}

                    {isLoadingMore && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Memuat lebih banyak...</p></div>
                    )}
                    {!loading && !isLoadingMore && data.length === 0 && (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Tidak ada data untuk ditampilkan.</p></div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <InventoryDetailModal
                    kodeUnik={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
}