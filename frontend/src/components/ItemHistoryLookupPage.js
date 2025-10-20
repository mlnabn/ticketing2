import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import Pagination from '../components/Pagination';
import HistoryModal from '../components/HistoryModal'; // Impor modal riwayat

function ItemHistoryLookupPage() {
    const { showToast } = useOutletContext();

    // State untuk daftar barang
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);

    // State untuk pencarian & scanner
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // State untuk item yang akan dilihat riwayatnya
    const [historyItem, setHistoryItem] = useState(null);

    // Mengambil daftar semua stok barang (mirip StokBarangView)
    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, search: debouncedSearchTerm };
            const res = await api.get('/inventory/stock-items', { params });
            setItems(res.data.data);
            setPagination(res.data);
        } catch (error) {
            showToast('Gagal memuat data stok.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, debouncedSearchTerm]);

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    // Fungsi untuk mencari item berdasarkan kode & menampilkan modal riwayat
    const handleSearchAndShowHistory = useCallback(async (code) => {
        if (!code) return;
        showToast(`Mencari riwayat untuk: ${code}`, 'info');
        try {
            // Kita panggil API untuk mendapatkan detail item lengkap
            const res = await api.get(`/inventory/stock-items/by-serial/${code}`);
            // Set state untuk membuka HistoryModal dengan data item yang ditemukan
            setHistoryItem(res.data);
        } catch (error) {
            showToast(`Aset dengan kode "${code}" tidak ditemukan.`, 'error');
        }
    }, [showToast]);

    // LOGIKA PASIF SCANNER (diambil dari StokBarangView)
    useEffect(() => {
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {
            // Abaikan input jika fokus pada elemen input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (typeof e.key !== 'string') return;

            if (interval) clearInterval(interval);

            if (e.code === 'Enter' || e.key === 'Enter') {
                if (barcode) handleSearchAndShowHistory(barcode.trim());
                barcode = ''; // Reset barcode setelah Enter
                return;
            }

            if (e.key.length === 1) {
                barcode += e.key;
            }
            // Reset barcode jika ada jeda input
            interval = setInterval(() => barcode = '', 50);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSearchAndShowHistory]);


    return (
        <>
            <div className="user-management-container">
                <h1>Lacak Riwayat Aset</h1>
                <p>Gunakan pencarian, klik item dari daftar, atau scan QR/Barcode untuk melihat riwayat lengkap sebuah aset.</p>

                <input
                    type="text"
                    placeholder="Cari berdasarkan Kode Unik, S/N, atau Nama Barang..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="filter-search-input"
                    style={{ marginTop: '1rem' }}
                />

                <div className="job-list-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Kode Unik</th>
                                <th>Nama Barang</th>
                                <th>Status Saat Ini</th>
                                <th>Lokasi/Pengguna Terakhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                            ) : items.length > 0 ? items.map(item => (
                                <tr key={item.id} onClick={() => setHistoryItem(item)} style={{ cursor: 'pointer' }} className="hoverable-row">
                                    <td>{item.kode_unik}</td>
                                    <td>{item.master_barang?.nama_barang || 'N/A'}</td>
                                    <td>
                                        <span className={`status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {item.status_detail?.nama_status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{item.user_peminjam?.name || item.workshop?.name || '-'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada data.</td></tr>
                            )}
                        </tbody>
                    </table>
                    {/* Mobile View */}
                    <div className="job-list-mobile">
                        {loading ? (
                            <p style={{ textAlign: 'center' }}>Memuat data...</p>
                        ) : items.length > 0 ? (
                            items.map(item => (
                                <div key={item.id} className="ticket-card-mobile clickable-row" onClick={() => setHistoryItem(item)}>
                                    {/* Baris 1: Nama Barang */}
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Nama Barang</span>
                                            <span className="value description">{item.master_barang?.nama_barang || 'N/A'}</span>
                                        </div>
                                    </div>
                                    {/* Baris 2: Kode Unik & Status */}
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
                                    {/* Baris 3: Lokasi/Pengguna */}
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Lokasi/Pengguna Terakhir</span>
                                            <span className="value">{item.user_peminjam?.name || item.workshop?.name || '-'}</span>
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

                {pagination && pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page) => fetchData(page)}
                    />
                )}
            </div>

            {/* Modal akan muncul jika historyItem memiliki data */}
            {historyItem && (
                <HistoryModal
                    item={historyItem}
                    onClose={() => setHistoryItem(null)}
                    showToast={showToast}
                />
            )}
        </>
    );
}

export default ItemHistoryLookupPage;