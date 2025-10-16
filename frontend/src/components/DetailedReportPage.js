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
            };
        }
        return {
            kode_unik: item.stok_barang?.kode_unik,
            nama_barang: item.stok_barang?.master_barang?.nama_barang,
            status: item.status_detail?.nama_status,
            tanggal: item.created_at, // Tanggal kejadian adalah created_at dari history
            penanggung_jawab: item.related_user?.name,
            workshop: item.workshop?.name,
        };
    };

    const dateHeaders = {
        in: 'Tgl Masuk',
        out: 'Tgl Laporan',
        available: 'Tgl Dibuat',
        accountability: 'Tgl Laporan',
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
                <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-cal" />
                <span>-</span>
                <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-cal" />
                {/* <button onClick={() => fetchData(1)} className="btn-primary">Terapkan Filter</button> */}
                <button onClick={() => handleExport('excel')} className="btn-download excel" disabled={exportingExcel}>
                    <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                    {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExport('pdf')} className="btn-download pdf" disabled={exportingPdf}>
                    <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                    {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                </button>
            </div>

            <div className="job-list-container">
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Kode Unik</th>
                            <th>Nama Barang</th>
                            <th>Status</th>
                            <th>{dateHeaders[type] || 'Tanggal'}</th>
                            <th>Penanggung Jawab</th>
                            <th>Workshop</th>
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
                                </tr>
                            )
                        }) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada data untuk ditampilkan.</td></tr>
                        )}
                    </tbody>
                </table>
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