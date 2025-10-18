import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import Pagination from './Pagination';
import { saveAs } from 'file-saver';

const PaginationSummary = ({ pagination }) => {
    if (!pagination || pagination.total === 0) {
        return null;
    }
    return (
        <div className="pagination-summary">
            Menampilkan <strong>{pagination.from}</strong> - <strong>{pagination.to}</strong> dari <strong>{pagination.total}</strong> data
        </div>
    );
};

export default function DetailedReportPage({ type, title }) {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

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
    }, [type, filters, debouncedSearchTerm]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleExport = async (exportType) => {
        if (exportType === 'excel') setExportingExcel(true);
        else setExportingPdf(true);

        try {
            const params = {
                type,
                ...filters,
                search: searchTerm,
                export_type: exportType // Mengirim tipe ekspor ke backend
            };

            const response = await api.get('/reports/inventory/export', {
                params,
                responseType: 'blob',
            });

            const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `Laporan_Barang_${type === 'in' ? 'Masuk' : 'Keluar'}_${new Date().toISOString().split('T')[0]}.${extension}`;
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

    const getItemData = (item) => {
        // Untuk laporan 'in' dan 'available', data langsung ada di item.
        if (type === 'in' || type === 'available') {
            return {
                kode_unik: item.kode_unik,
                nama_barang: item.master_barang?.nama_barang,
                status: item.status_detail?.nama_status,
                tanggal: item.tanggal_masuk,
                penanggung_jawab: item.created_by?.name,
                workshop: item.workshop?.name,
                current_status: item.status_detail?.nama_status,
            };
        }
        return {
            kode_unik: item.stok_barang?.kode_unik,
            nama_barang: item.stok_barang?.master_barang?.nama_barang,
            status: item.status_detail?.nama_status,
            tanggal: item.event_date, // Tanggal kejadian adalah created_at dari history
            penanggung_jawab: item.related_user?.name,
            workshop: item.workshop?.name,
            current_status: item.stok_barang?.status_detail?.nama_status,
        };
    };

    const dateHeaders = {
        in: 'Tgl Masuk',
        out: 'Tgl Kejadian',
        available: 'Tgl Dibuat',
        accountability: 'Tgl Kejadian',
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header-report">
                <h1>{title}</h1>
            </div>

            <div className="filters-container report-filters">
                {/* Baris 1: Input Pencarian */}
                <input
                    type="text"
                    placeholder="Cari Kode Unik / Nama Barang..."
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
                {/*Destop view*/}
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Kode Unik</th>
                            <th>Nama Barang</th>
                            <th>Status Kejadian</th>
                            <th>{dateHeaders[type] || 'Tanggal'}</th>
                            <th>Penanggung Jawab</th>
                            <th>Workshop</th>
                            {(type === 'out' || type === 'accountability') && <th>Status Saat Ini</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : data.length > 0 ? data.map(item => {
                            const itemData = getItemData(item);
                            return (
                                <tr key={item.id}>
                                    <td>{itemData.kode_unik || '-'}</td>
                                    <td>{itemData.nama_barang || '-'}</td>
                                    <td>{itemData.status || '-'}</td>
                                    <td>{formatDate(itemData.tanggal)}</td>
                                    <td>{itemData.penanggung_jawab || '-'}</td>
                                    <td>{itemData.workshop || '-'}</td>
                                    {(type === 'out' || type === 'accountability') && (
                                        <td>
                                            {/* Beri warna agar mudah dibedakan */}
                                            <span className={`badge-status status-${itemData.current_status?.toLowerCase()}`}>
                                                {itemData.current_status || '-'}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada data untuk ditampilkan.</td></tr>
                        )}
                    </tbody>
                </table>
                {/* Mobile view */}
                <div className="job-list-mobile">
                    {/* Tampilkan pesan loading jika data sedang dimuat */}
                    {loading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Memuat data...</p>
                        </div>
                    ) : data.length > 0 ? data.map(item => {
                        // Ambil data yang sudah diproses dari fungsi getItemData
                        const itemData = getItemData(item);
                        return (
                            <div key={`mobile-detail-${item.id}`} className="ticket-card-mobile">
                                {/* Baris 1: Informasi Utama (Nama Barang) */}
                                <div className="card-row">
                                    <div className="data-group single">
                                        <span className="label">Nama Barang</span>
                                        <span className="value description">{itemData.nama_barang || '-'}</span>
                                    </div>
                                </div>

                                {/* Baris 2: Kode Unik & Status */}
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">Kode Unik</span>
                                        <span className="value">{itemData.kode_unik || '-'}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Status Kejadian</span>
                                        <span className="value">{itemData.status || '-'}</span>
                                    </div>
                                </div>

                                {/* Baris 3: Tanggal & Penanggung Jawab */}
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

                                {/* Baris 4: Workshop */}
                                <div className="card-row">
                                    <div className="data-group single">
                                        <span className="label">Workshop</span>
                                        <span className="value">{itemData.workshop || '-'}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">Status Saat Ini</span>
                                        <span className="value">{itemData.current_status || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        // Tampilkan pesan jika tidak ada data yang ditemukan
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada data untuk ditampilkan.</p>
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
        </div>
    );
}