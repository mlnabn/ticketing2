import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { saveAs } from 'file-saver';
import ActiveLoanDetailModal from './ActiveLoanDetailModal';

const PaginationSummary = ({ pagination }) => {
    if (!pagination || pagination.total === 0) return null;
    return (
        <div className="pagination-summary">
            Menampilkan <strong>{pagination.from}</strong> - <strong>{pagination.to}</strong> dari <strong>{pagination.total}</strong> data
        </div>
    );
};

export default function ActiveLoanReportPage() {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [selectedItem, setSelectedItem] = useState(null);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const type = 'active_loans';
    const title = 'Laporan Peminjaman Aktif';

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, type, ...filters, search: debouncedSearchTerm };
            const res = await api.get('/reports/inventory/detailed', { params });
            setData(res.data.data);
            setPagination(res.data);
        } catch (error) {
            console.error(`Gagal memuat laporan ${type}`, error);
        } finally {
            setLoading(false);
        }
    }, [filters, debouncedSearchTerm]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            const params = {
                type,
                ...filters,
                search: searchTerm,
                export_type: exportType
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

        if (diffDays === 0) return { text: 'Hari ini', days: 0 };
        if (diffDays === 1) return { text: '1 hari', days: 1 };
        return { text: `${diffDays} hari`, days: diffDays };
    };

    const getDurationStyle = (days) => {
        if (days > 30) return { color: '#ef4444', fontWeight: 'bold' };
        if (days > 7) return { color: '#f97316' };
        return {};
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
                <div className="filter-row-bottom">
                    <div className="date-filters">
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-cal" />
                        <span className='strip'>-</span>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-cal" />
                    </div>
                    <div className="download-buttons">
                        <button onClick={() => handleExport('excel')} className="btn-download excel" disabled={exportingExcel}>
                            <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                            {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                        </button>
                        <button onClick={() => handleExport('pdf')} className="btn-download pdf" disabled={exportingPdf}>
                            <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                            {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                        </button>
                    </div>
                </div>
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
                    <div className="table-body-scroll">
                        <table className="job-table">
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                ) : data.length > 0 ? data.map(item => {
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
                                }) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Tidak ada data peminjaman aktif.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*Tampilan Mobile */}
                <div className="job-list-mobile">
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Memuat data...</p>
                    ) : data.length > 0 ? (
                        data.map(item => {
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
                        })
                    ) : (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada data peminjaman aktif.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pagination-container">
                <PaginationSummary pagination={pagination} />
                {pagination && pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={fetchData}
                    />
                )}
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