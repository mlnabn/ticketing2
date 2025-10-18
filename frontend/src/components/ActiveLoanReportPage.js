import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { saveAs } from 'file-saver';

// Komponen PaginationSummary tetap sama
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
    
    // State untuk ekspor bisa ditambahkan nanti jika diperlukan

    const type = 'active_loans'; // Tipe laporan spesifik untuk halaman ini
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    // Fungsi BARU untuk menghitung durasi
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

    // Style untuk durasi berdasarkan lama peminjaman
    const getDurationStyle = (days) => {
        if (days > 30) return { color: '#ef4444', fontWeight: 'bold' }; // Merah
        if (days > 7) return { color: '#f97316' }; // Oranye
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
                    {/* Tombol ekspor bisa ditambahkan di sini nanti */}
                </div>
            </div>

            <div className="job-list-container">
                {/* Tampilan Desktop */}
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
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : data.length > 0 ? data.map(item => {
                            const duration = calculateDuration(item.tanggal_keluar);
                            return (
                                <tr key={item.id}>
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
                {/* Tampilan Mobile bisa ditambahkan dengan struktur serupa jika perlu */}
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