import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Pagination from './Pagination';
import { saveAs } from 'file-saver'; // [BARU] Import library file-saver

// Komponen kecil untuk ringkasan paginasi (tidak berubah)
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
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, type, ...filters, search: searchTerm };
            const res = await api.get('/reports/inventory/detailed', { params });
            setData(res.data.data);
            setPagination(res.data);
        } catch (error) {
            console.error(`Gagal memuat laporan ${type}`, error);
        } finally {
            setLoading(false);
        }
    }, [type, filters, searchTerm]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleApplyFilterAndSearch = () => {
        fetchData(1);
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

    return (
        <div className="user-management-container">
            <div className="user-management-header-report">
                <h1>{title}</h1>
            </div>

            <div className="filters-container report-filters">
                <input
                    type="text"
                    placeholder="Cari Kode Unik / Nama Barang..."
                    className="search-form"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyFilterAndSearch()}
                />
                <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-invent" />
                <span>-</span>
                <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-invent" />
                {/* <button onClick={handleApplyFilterAndSearch} className="btn-primary">Terapkan</button> */}
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
                            <th>{type === 'in' ? 'Tgl Masuk' : 'Tgl Keluar'}</th>
                            <th>Penanggung Jawab</th>
                            <th>Workshop</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : data.length > 0 ? data.map(item => (
                            <tr key={item.id}>
                                <td>{item.kode_unik}</td>
                                <td>{item.master_barang?.nama_barang || '-'}</td>
                                <td>{item.status_detail?.nama_status || '-'}</td>
                                <td>{formatDate(type === 'in' ? item.tanggal_masuk : item.tanggal_keluar)}</td>
                                <td>
                                    {type === 'in' && (item.created_by?.name || '-')}
                                    {type === 'out' && (item.user_peminjam?.name || item.user_perusak?.name || item.user_penghilang?.name || '-')}
                                </td>
                                <td>{item.workshop?.name || '-'}</td>
                            </tr>
                        )) : (
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