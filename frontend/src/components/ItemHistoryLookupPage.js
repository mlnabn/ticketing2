import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
// import Pagination from '../components/Pagination';
import HistoryModal from '../components/HistoryModal';
// import { saveAs } from 'file-saver';
import QrScannerModal from './QrScannerModal';


function ItemHistoryLookupPage() {
    const { showToast } = useOutletContext();
    const [items, setItems] = useState([]);
    // const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [historyItem, setHistoryItem] = useState(null);
    // const [exportingExcel, setExportingExcel] = useState(false);
    // const [exportingPdf, setExportingPdf] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                all: true,
                search: debouncedSearchTerm,
                has_history: true,
                start_date: startDate,
                end_date: endDate
            };
            const res = await api.get('/inventory/stock-items', { params });
            setItems(res.data);
            // setPagination(res.data);
        } catch (error) {
            showToast('Gagal memuat data stok.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, debouncedSearchTerm, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getRelevantDate = (item) => {
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

    const getResponsiblePerson = (item) => {
        switch (item.status_detail?.nama_status) {
            case 'Digunakan':
            case 'Dipinjam':
                return item.user_peminjam?.name || item.workshop?.name || '-';
            case 'Rusak':
                return item.user_perusak?.name || '-';
            case 'Hilang':
                return item.user_penghilang?.name || '-';
            case 'Perbaikan':
                return item.teknisi_perbaikan?.name || '-';
            default:
                return '-';
        }
    };

    // const handleExport = async (exportType) => {
    //     if (exportType === 'excel') setExportingExcel(true);
    //     else setExportingPdf(true);

    //     const type = 'all_stock';

    //     try {
    //         const params = {
    //             type,
    //             search: searchTerm,
    //             export_type: exportType,
    //             start_date: startDate,
    //             end_date: endDate
    //         };

    //         const response = await api.get('/reports/inventory/export', {
    //             params,
    //             responseType: 'blob',
    //         });

    //         const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
    //         const fileName = `Laporan_Riwayat_Aset_${new Date().toISOString().split('T')[0]}.${extension}`;
    //         saveAs(response.data, fileName);

    //     } catch (err) {
    //         console.error(`Gagal mengunduh file ${exportType}:`, err);
    //         showToast('Gagal mengunduh file. Mohon coba lagi.', 'error');
    //     } finally {
    //         if (exportType === 'excel') setExportingExcel(false);
    //         else setExportingPdf(false);
    //     }
    // };
    const handleSearchAndShowHistory = useCallback(async (code) => {
        if (!code) return;
        showToast(`Mencari riwayat untuk: ${code}`, 'info');
        try {
            const res = await api.get(`/inventory/stock-items/by-serial/${code}`);
            setHistoryItem(res.data);
        } catch (error) {
            showToast(`Aset dengan kode "${code}" tidak ditemukan.`, 'error');
        }
    }, [showToast]);

    const handleScanSuccess = (decodedText) => {
        setIsScannerOpen(false); // 1. Tutup modal scanner
        handleSearchAndShowHistory(decodedText); // 2. Panggil fungsi pencarian yang sudah ada
    };
    useEffect(() => {
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {
            const isModalOpen = !!historyItem || isScannerOpen;
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
    }, [handleSearchAndShowHistory, historyItem, isScannerOpen]);


    return (
        <>
            <div className="user-management-container">
                <h1>Lacak Riwayat Aset</h1>
                <p>Gunakan pencarian, klik item dari daftar, atau scan QR/Barcode untuk melihat riwayat lengkap sebuah aset.</p>
                <div className="filters-container report-filters" style={{ marginTop: '1rem', paddingBottom: '0' }}>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan Kode Unik, S/N, atau Nama Barang..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="filter-search-input"
                    />
                    <div className="filter-row-bottom">
                        <div className="date-filters">
                            <input
                                type="date"
                                className="filter-select-cal"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <span style={{ margin: '0 0.5rem', alignSelf: 'center' }}>-</span>
                            <input
                                type="date"
                                className="filter-select-cal"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                min={startDate} // Mencegah tanggal akhir sebelum tanggal mulai
                            />
                        </div>
                        <div className="download-buttons">
                            <button onClick={() => setIsScannerOpen(true)} className="btn-scan">
                                <span className="fa-stack" style={{ marginRight: '8px', fontSize: '0.8em' }}>
                                    <i className="fas fa-qrcode fa-stack-2x"></i>
                                    <i className="fas fa-expand fa-stack-1x fa-inverse"></i>
                                </span>
                                Scan QR
                            </button>
                            {/* <button onClick={() => handleExport('excel')} className="btn-download excel" disabled={exportingExcel}>
                                <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                                {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                            </button>
                            <button onClick={() => handleExport('pdf')} className="btn-download pdf" disabled={exportingPdf}>
                                <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                                {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                            </button> */}
                        </div>
                    </div>
                </div>

                <div className="job-list-container">
                    {/* Desktop View */}
                    <div className="table-scroll-container"> {/* DITAMBAHKAN */}
                        {/* TABEL 1: KHUSUS HEADER */}
                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>Kode Unik</th>
                                    <th>Nama Barang</th>
                                    <th>Status Saat Ini</th>
                                    <th>Tgl Status Terakhir</th>
                                    <th>Penanggung Jawab/Pengguna Terakhir</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="table-body-scroll">
                            <table className="job-table">
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                    ) : items.length > 0 ? items.map(item => (
                                        <tr key={item.id} onClick={() => setHistoryItem(item)} style={{ cursor: 'pointer' }} className="hoverable-row">
                                            <td>{item.kode_unik}</td>
                                            <td>{item.master_barang?.nama_barang || 'N/A'}</td>
                                            <td>
                                                <span className={`status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {item.status_detail?.nama_status || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{formatDate(getRelevantDate(item))}</td>
                                            <td>{getResponsiblePerson(item)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Tidak ada data.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile View */}
                    <div className="job-list-mobile">
                        {loading ? (
                            <p style={{ textAlign: 'center' }}>Memuat data...</p>
                        ) : items.length > 0 ? (
                            items.map(item => (
                                <div key={item.id} className="ticket-card-mobile clickable-row" onClick={() => setHistoryItem(item)}>
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
                                            <span className="label">Tgl Status Terakhir</span>
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
                        ) : (
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <p>Tidak ada data.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* {pagination && pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page) => fetchData(page)}
                    />
                )} */}
            </div>
            {historyItem && (
                <HistoryModal
                    item={historyItem}
                    onClose={() => setHistoryItem(null)}
                    showToast={showToast}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}

            {isScannerOpen && (
                <QrScannerModal
                    onClose={() => setIsScannerOpen(false)}
                    onScanSuccess={handleScanSuccess}
                />
            )}
        </>
    );
}

export default ItemHistoryLookupPage;