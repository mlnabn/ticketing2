import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import Pagination from './Pagination';
import ItemDetailModal from './ItemDetailModal';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import EditStokBarangModal from './EditStokBarangModal';
import AddStockModal from './AddStockModal';
import QrScannerModal from './QrScannerModal';

function StokBarangView() {
    const { showToast } = useOutletContext();

    // State utama
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // State untuk filter
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [colorOptions, setColorOptions] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');

    // State untuk modal
    const [detailItem, setDetailItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [qrModalItem, setQrModalItem] = useState(null);
    const [isAddStockOpen, setIsAddStockOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const fetchData = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = { page, ...filters };
            const res = await api.get('/inventory/stock-items', { params });
            setItems(res.data.data);
            setPagination(res.data);
        } catch (error) {
            showToast('Gagal memuat data stok.', 'error');
            console.error("Fetch Stok Error:", error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        api.get('/inventory/categories').then(res => setCategories(res.data));
        api.get('/statuses').then(res => setStatusOptions(res.data));
        api.get('/colors').then(res => setColorOptions(res.data));
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            api.get(`/inventory/sub-categories?id_kategori=${selectedCategory}`).then(res => setSubCategories(res.data));
        } else {
            setSubCategories([]);
        }
        setSelectedSubCategory('');
    }, [selectedCategory]);

    useEffect(() => {
        const filters = {
            id_kategori: selectedCategory,
            id_sub_kategori: selectedSubCategory,
            status_id: selectedStatus,
            id_warna: selectedColor,
            search: debouncedSearchTerm,
        };
        fetchData(1, filters);
    }, [selectedCategory, selectedSubCategory, selectedStatus, selectedColor, debouncedSearchTerm, fetchData]);

    const handleOpenEditModal = (itemToEdit) => {
        setDetailItem(null);
        setEditItem(itemToEdit);
    };

    const handleScanSearch = useCallback(async (code) => {
        if (!code) return;
        showToast(`Mencari: ${code}`, 'info');
        try {
            const res = await api.get(`/inventory/stock-items/by-serial/${code}`);
            setDetailItem(res.data);
        } catch (error) {
            showToast(`Kode "${code}" tidak ditemukan.`, 'error');
        }
    }, [showToast]);

    const handleScanSuccess = (decodedText) => {
        setIsScannerOpen(false); 
        handleScanSearch(decodedText);
    };

    useEffect(() => {
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (typeof e.key !== 'string') return;
            if (interval) clearInterval(interval);
            if (e.code === 'Enter' || e.key === 'Enter') {
                if (barcode) handleScanSearch(barcode.trim());
                barcode = '';
                return;
            }
            if (e.key.length === 1) barcode += e.key;
            interval = setInterval(() => barcode = '', 50);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleScanSearch]);

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Daftar Stok Unit Barang</h1>
                <button className="btn-primary" onClick={() => setIsAddStockOpen(true)}>Tambah Stok</button>
                <button className="btn-secondary" onClick={() => setIsScannerOpen(true)}>
                        <i className="fas fa-qrcode" style={{marginRight: '8px'}}></i>
                        Scan QR
                    </button>
            </div>

            {/* --- Filter Section --- */}
            <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="filter-select">
                    <option value="">Semua Status</option>
                    {statusOptions.map(status => (
                        <option key={status.id} value={status.id}>{status.nama_status}</option>
                    ))}
                </select>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="filter-select">
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                        <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                    ))}
                </select>
                <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory || subCategories.length === 0} className="filter-select">
                    <option value="">Semua Sub-Kategori</option>
                    {subCategories.map(sub => (
                        <option key={sub.id_sub_kategori} value={sub.id_sub_kategori}>{sub.nama_sub}</option>
                    ))}
                </select>
                <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="filter-select">
                    <option value="">Semua Warna</option>
                    {colorOptions.map(color => (
                        <option key={color.id_warna} value={color.id_warna}>{color.nama_warna}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Cari apa saja..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="filter-search-input"
                />
            </div>
            <div className="job-list-container">
                {/* ======================================================= */}
                {/* ===    TAMPILAN TABEL UNTUK DESKTOP (TETAP SAMA)    === */}
                {/* ======================================================= */}
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Kode Unik</th>
                            <th>S/N</th>
                            <th>Nama Barang</th>
                            <th>Kondisi</th>
                            <th>Status Stok</th>
                            <th>Jumlah Stok</th>
                            <th>Warna</th>
                            <th>Harga Beli</th>
                            <th>Tgl Beli</th>
                            <th>Tgl Masuk</th>
                            <th>Ditambahkan Oleh</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="12" style={{ textAlign: 'center' }}>Memuat data stok...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                                Belum ada barang yang didaftarkan dalam stok.
                            </td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.kode_unik}</td>
                                    <td>{item.serial_number || '-'}</td>
                                    <td>{item.master_barang?.nama_barang}</td>
                                    <td>{item.kondisi}</td>
                                    <td>
                                        <span className={`status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {item.status_detail?.nama_status || 'Tanpa Status'}
                                        </span>
                                    </td>
                                    <td>{item.master_barang?.stok_barangs_count || 'N/A'}</td>
                                    <td>
                                        {item.color ? (
                                            <span
                                                title={item.color.nama_warna}
                                                style={{
                                                    display: 'inline-block',
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: item.color.kode_hex,
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px'
                                                }}
                                            ></span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>Rp {Number(item.harga_beli).toLocaleString('id-ID')}</td>
                                    <td>{item.tanggal_pembelian ? new Date(item.tanggal_pembelian).toLocaleDateString('id-ID') : '-'}</td>
                                    <td>{item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleDateString('id-ID') : '-'}</td>
                                    <td>{item.created_by?.name || 'N/A'}</td>
                                    <td className="action-buttons-group">
                                        <button onClick={() => setDetailItem(item)} className="btn-user-action btn-detail">Detail</button>
                                        <button onClick={() => setQrModalItem(item)} className="btn-user-action btn-edit">QR</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* ======================================================= */}
                {/* ===    TAMPILAN TABEL UNTUK DESKTOP (TETAP SAMA)    === */}
                {/* ======================================================= */}
                <div className="job-list-mobile">
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Memuat data stok...</p>
                    ) : items.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px' }}>
                            Belum ada barang yang didaftarkan dalam stok.
                        </p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="ticket-card-mobile clickable-row" onClick={() => setDetailItem(item)}>
                                <div className="card-header">
                                    <h4>{item.master_barang?.nama_barang}</h4>
                                    <small>Kode: {item.kode_unik}</small>
                                </div>
                                <div className="card-body">
                                    <div className="card-item-row">
                                        <span className="label">Status</span>
                                        <span className="value">
                                            <span className={`status-${(item.status_detail?.nama_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {item.status_detail?.nama_status || 'N/A'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">S/N</span>
                                        <span className="value">{item.serial_number || '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Kondisi</span>
                                        <span className="value">{item.kondisi}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Warna</span>
                                        <span className="value">
                                            {item.color ? (
                                                <span title={item.color.nama_warna} style={{
                                                    display: 'inline-block',
                                                    width: '20px', height: '20px',
                                                    backgroundColor: item.color.kode_hex,
                                                    border: '1px solid #ccc', borderRadius: '4px',
                                                    verticalAlign: 'middle'
                                                }}></span>
                                            ) : '-'}
                                        </span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Harga Beli</span>
                                        <span className="value">Rp {Number(item.harga_beli).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Tgl. Beli</span>
                                        <span className="value">{item.tanggal_pembelian ? new Date(item.tanggal_pembelian).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Tgl. Masuk</span>
                                        <span className="value">{item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Total Stok SKU</span>
                                        <span className="value">{item.master_barang?.stok_barangs_count || 'N/A'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Ditambahkan</span>
                                        <span className="value">{item.created_by?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="card-separator"></div>
                                <div className="card-row action-row">
                                    <button onClick={(e) => { e.stopPropagation(); setDetailItem(item); }} className="btn-user-action btn-detail">Detail</button>
                                    <button onClick={(e) => { e.stopPropagation(); setQrModalItem(item); }} className="btn-user-action btn-edit">QR</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {pagination && pagination.last_page > 1 && (
                <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    onPageChange={(page) => fetchData(page, {
                        id_kategori: selectedCategory,
                        id_sub_kategori: selectedSubCategory,
                        status_id: selectedStatus,
                        id_warna: selectedColor
                    })}
                />
            )}

            {detailItem && (
                <ItemDetailModal
                    item={detailItem}
                    onClose={() => setDetailItem(null)}
                    onEditClick={handleOpenEditModal}
                    showToast={showToast}
                    onSaveSuccess={() => fetchData(pagination?.current_page || 1)}
                />
            )}

            {editItem && (
                <EditStokBarangModal
                    isOpen={!!editItem}
                    onClose={() => setEditItem(null)}
                    item={editItem}
                    showToast={showToast}
                    onSaveSuccess={() => fetchData(pagination?.current_page || 1)}
                />
            )}

            {qrModalItem && (
                <div className="modal-backdrop" onClick={() => setQrModalItem(null)}>
                    <div className="modal-content-qr" onClick={e => e.stopPropagation()}>
                        <h3>QR Code untuk {qrModalItem.kode_unik}</h3>

                        <div className="qr-container">
                            <QRCode value={qrModalItem.kode_unik} size={256} level="H" />
                            <p className="item-name">{qrModalItem.master_barang?.nama_barang}</p>
                            <p className="item-serial">S/N: {qrModalItem.serial_number || 'N/A'}</p>
                        </div>

                    </div>
                </div>
            )}
            {isScannerOpen && (
                <QrScannerModal
                    onClose={() => setIsScannerOpen(false)}
                    onScanSuccess={handleScanSuccess}
                />
            )}
            <AddStockModal
                isOpen={isAddStockOpen}
                onClose={() => setIsAddStockOpen(false)}
                onSaveSuccess={() => fetchData(1)}
                showToast={showToast}
            />
        </>
    );
}

export default StokBarangView;