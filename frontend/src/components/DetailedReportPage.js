import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
// import Pagination from './Pagination';
import { saveAs } from 'file-saver';
import InventoryDetailModal from './InventoryDetailModal';

// const PaginationSummary = ({ pagination }) => {
//     if (!pagination || pagination.total === 0) {
//         return null;
//     }
//     return (
//         <div className="pagination-summary">
//             Menampilkan <strong>{pagination.from}</strong> - <strong>{pagination.to}</strong> dari <strong>{pagination.total}</strong> data
//         </div>
//     );
// };

export default function DetailedReportPage({ type, title }) {
    const [data, setData] = useState([]);
    // const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { type, ...filters, search: debouncedSearchTerm, all: true };
            const res = await api.get('/reports/inventory/detailed', { params });
            setData(res.data);

        } catch (error) {
            console.error(`Gagal memuat laporan ${type}`, error);
        } finally {
            setLoading(false);
        }
    }, [type, filters, debouncedSearchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hapus duplikat useEffect
    // useEffect(() => {
    //     fetchData();
    // }, [fetchData]);

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

            // --- PERBAIKAN 1: Nama File Ekspor ---
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
            // --- AKHIR PERBAIKAN 1 ---

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
        // ... (Fungsi ini tidak diubah) ...
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

        const stokInfo = item.stok_barang || {};
        const masterInfo = stokInfo.master_barang || {};
        const historyDate = item.event_date || item.created_at;
        const triggeredBy = item.triggered_by_user?.name || '-';
        const workshopName = item.workshop?.name || stokInfo.workshop?.name || '-';
        const historyStatus = item.status_detail?.nama_status || 'N/A';
        const currentStatus = stokInfo.status_detail?.nama_status || 'N/A'; // Ambil dari relasi

        return {
            kode_unik: stokInfo.kode_unik || '-',
            serial_number: stokInfo.serial_number || '-',
            nama_barang: masterInfo.nama_barang || 'N/A',
            status: historyStatus,
            tanggal: historyDate,
            penanggung_jawab: triggeredBy,
            workshop: workshopName,
            current_status: currentStatus,
        };
    };

    const handleRowClick = (e, item) => {
        // ... (Fungsi ini tidak diubah) ...
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
        // ... (Tidak diubah) ...
        in: 'Tgl Masuk',
        out: 'Tgl Kejadian',
        available: 'Tgl Masuk',
        accountability: 'Tgl Kejadian',
        active_loans: 'Tgl Keluar'
    };

    return (
        <div className="user-management-container">
            {/* ... (Header dan Filter tidak diubah) ... */}
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
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Kode Unik</th>
                                <th>Serial Number</th>
                                <th>Nama Barang</th>
                                <th>Status Kejadian</th>
                                <th>{dateHeaders[type] || 'Tanggal'}</th>
                                <th>Penanggung Jawab</th>
                                <th>Workshop</th>
                                {(type === 'out' || type === 'accountability') && <th>Status Saat Ini</th>}
                            </tr>
                        </thead>
                    </table>

                    <div className="table-body-scroll">
                        <table className="job-table">
                            <tbody>
                                {/* --- PERBAIKAN 2: colSpan (dari 7:6 menjadi 8:7) --- */}
                                {loading ? (
                                    <tr><td colSpan={(type === 'out' || type === 'accountability') ? 8 : 7} style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                ) : data.length > 0 ? data.map(item => {
                                    const itemData = getItemData(item);
                                    return (
                                        <tr key={item.id} className="hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                            <td>{itemData.kode_unik || '-'}</td>
                                            <td>{itemData.serial_number || '-'}</td>
                                            <td>{itemData.nama_barang || '-'}</td>
                                            <td>{itemData.status || '-'}</td>
                                            <td>{formatDate(itemData.tanggal)}</td>
                                            <td>{itemData.penanggung_jawab || '-'}</td>
                                            <td>{itemData.workshop || '-'}</td>
                                            {(type === 'out' || type === 'accountability') && (
                                                <td>
                                                    <span className={`badge-status status-${(itemData.current_status || '-').toLowerCase()}`}>
                                                        {itemData.current_status || '-'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                }) : (
                                    <tr><td colSpan={(type === 'out' || type === 'accountability') ? 8 : 7} style={{ textAlign: 'center' }}>Tidak ada data untuk ditampilkan.</td></tr>
                                )}
                                {/* --- AKHIR PERBAIKAN 2 --- */}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Mobile view */}
                <div className="job-list-mobile">
                    {loading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Memuat data...</p></div>
                    ) : data.length > 0 ? data.map(item => {
                        const itemData = getItemData(item);
                        return (
                            <div key={`mobile-detail-${item.id}`} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                {/* ... (Baris 1, 2, 3 tidak diubah) ... */}
                                <div className="card-row">
                                    <div className="data-group single">
                                        <span className="label">Nama Barang</span>
                                        <span className="value description">{itemData.nama_barang || '-'}</span>
                                    </div>
                                </div>
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

                                {/* --- PERBAIKAN 3: Tampilan Mobile --- */}
                                <div className="card-row">
                                    <div className={`data-group ${!(type === 'out' || type === 'accountability') ? 'single' : ''}`}>
                                        <span className="label">Workshop</span>
                                        <span className="value">{itemData.workshop || '-'}</span>
                                    </div>
                                    {(type === 'out' || type === 'accountability') && (
                                        <div className="data-group">
                                            <span className="label">Status Saat Ini</span>
                                            <span className="value">{itemData.current_status || '-'}</span>
                                        </div>
                                    )}
                                </div>
                                {/* --- AKHIR PERBAIKAN 3 --- */}
                            </div>
                        );
                    }) : (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Tidak ada data untuk ditampilkan.</p></div>
                    )}
                </div>
            </div>

            {/* ... (Pagination dan Modal tidak diubah) ... */}
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