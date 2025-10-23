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

    // State utama untuk Master Barang (SKU)
    const [masterItems, setMasterItems] = useState([]);
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
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [colorOptions, setColorOptions] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');

    // State untuk modal
    const [detailItem, setDetailItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [qrModalItem, setQrModalItem] = useState(null);
    const [isAddStockOpen, setIsAddStockOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // State untuk expand/collapse
    const [expandedRows, setExpandedRows] = useState({});
    const [detailItems, setDetailItems] = useState({});
    const [expandingId, setExpandingId] = useState(null);

    // State untuk ID status 'Tersedia' (diambil dari API)
    const [tersediaStatusId, setTersediaStatusId] = useState(null);

    // Simpan filter saat ini
    const [currentFilters, setCurrentFilters] = useState({});

    // fetchData mengambil data summary
    const fetchData = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        setCurrentFilters(filters); // Simpan filter saat ini untuk refresh
        try {
            const params = { page, ...filters };
            const res = await api.get('/inventory/stock-summary', { params });
            setMasterItems(res.data.data);
            setPagination(res.data);
            setExpandedRows({});
            setDetailItems({});
        } catch (error) {
            showToast('Gagal memuat data ringkasan stok.', 'error');
            console.error("Fetch Stok Summary Error:", error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        api.get('/inventory/categories').then(res => setCategories(res.data));
        api.get('/statuses').then(res => {
            setStatusOptions(res.data);
            const tersedia = res.data.find(s => s.nama_status === 'Tersedia');
            if (tersedia) {
                setTersediaStatusId(tersedia.id);
            } else {
                console.error("Status 'Tersedia' tidak ditemukan di database!");
                showToast("Konfigurasi status 'Tersedia' tidak ditemukan.", "error");
            }
        });
        api.get('/colors').then(res => setColorOptions(res.data));
    }, [showToast, setTersediaStatusId]);

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
    const toggleExpand = async (masterBarangId) => {
        const isCurrentlyExpanded = !!expandedRows[masterBarangId];
        if (isCurrentlyExpanded) {
            setExpandedRows(prev => ({ ...prev, [masterBarangId]: false }));
            return;
        }
        setExpandedRows(prev => ({ ...prev, [masterBarangId]: true }));
        if (!detailItems[masterBarangId]) {
            setExpandingId(masterBarangId);
            try {
                let detailStatusId = (selectedStatus === "ALL") ? "" : selectedStatus;
                if (selectedStatus === "" && !tersediaStatusId) {
                    console.error("ID Status 'Tersedia' belum siap untuk fetch detail.");
                    showToast("Gagal memuat detail: Status default belum siap.", "error");
                    setExpandedRows(prev => ({ ...prev, [masterBarangId]: false }));
                    setExpandingId(null);
                    return;
                }

                const params = {
                    master_barang_id: masterBarangId,
                    status_id: detailStatusId,
                    id_warna: selectedColor,
                    search: debouncedSearchTerm
                };
                const res = await api.get('/inventory/stock-items', { params });
                const detailsArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setDetailItems(prev => ({ ...prev, [masterBarangId]: detailsArray }));
            } catch (error) {
                console.error("Fetch Detail Error:", error);
                showToast('Gagal memuat detail item.', 'error');
                setExpandedRows(prev => ({ ...prev, [masterBarangId]: false }));
            } finally {
                setExpandingId(null);
            }
        }
    };

    // Handler untuk membuka modal Edit dari modal Detail
    const handleOpenEditModal = (itemToEdit) => {
        setDetailItem(null);
        setEditItem(itemToEdit);
    };

    // Handler setelah sukses menyimpan dari modal Add/Edit/Detail (via update status)
    const handleSaveSuccess = () => {
        fetchData(pagination?.current_page || 1, currentFilters);
    };

    // --- Scan Handler ---
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
        handleScanSearch(decodedText); // <-- Panggil handleScanSearch
    };


    useEffect(() => {
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {

            const isModalActive = !!(detailItem || editItem || qrModalItem || isAddStockOpen || isScannerOpen);
            const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';

            if (isModalActive || isInputFocused) return;

            if (typeof e.key !== 'string') return;
            if (interval) clearInterval(interval);

            if (e.code === 'Enter' || e.key === 'Enter') {
                if (barcode.length > 3) {
                    const code = barcode.trim();
                    handleScanSearch(code); // <-- Panggil handleScanSearch
                }
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
    }, [handleScanSearch, detailItem, editItem, qrModalItem, isAddStockOpen, isScannerOpen]);
    const formatCurrency = (value) => {
        if (isNaN(value)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };
    const getNoDetailMessage = () => {
        let msg = "Tidak ada unit detail";
        if (selectedStatus && selectedStatus !== 'ALL') {
            const statusName = statusOptions.find(s => s.id === parseInt(selectedStatus))?.nama_status;
            if (statusName) msg += ` dengan status "${statusName}"`;
        } else if (selectedStatus === '') {
            msg += ` dengan status "Tersedia"`;
        }
        // Cek filter warna
        if (selectedColor) {
            const colorName = colorOptions.find(c => c.id_warna === parseInt(selectedColor))?.nama_warna;
            if (colorName) {
                const hasStatusFilter = (selectedStatus && selectedStatus !== 'ALL') || selectedStatus === '';
                msg += hasStatusFilter ? ` dan` : ` dengan`;
                msg += ` berwarna "${colorName}"`;
            }
        }
        msg += " untuk SKU ini.";
        return msg;
    }

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Daftar Stok Barang</h1>
                <div className="action-buttons-stok">
                    <button className="btn-primary" onClick={() => setIsAddStockOpen(true)}><i className="fas fa-plus" style={{ marginRight: '8px' }}></i>Tambah Stok</button>
                    <button className="btn-scan" onClick={() => setIsScannerOpen(true)}>
                        <span className="fa-stack" style={{ marginRight: '8px', fontSize: '0.8em' }}>
                            <i className="fas fa-qrcode fa-stack-2x"></i>
                            <i className="fas fa-expand fa-stack-1x fa-inverse"></i>
                        </span>
                        Scan QR
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="filter-select">
                    <option value="ALL">Semua Status</option>
                    {tersediaStatusId && (
                        <option value={tersediaStatusId}>Tersedia</option>
                    )}
                    {statusOptions
                        .filter(status => status.id !== tersediaStatusId) // Hapus 'Tersedia' jika ada
                        .map(status => (
                            <option key={status.id} value={status.id}>{status.nama_status}</option>
                        ))}
                </select>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="filter-select">
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (<option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>))}
                </select>
                <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory || subCategories.length === 0} className="filter-select">
                    <option value="">Semua Sub-Kategori</option>
                    {subCategories.map(sub => (<option key={sub.id_sub_kategori} value={sub.id_sub_kategori}>{sub.nama_sub}</option>))}
                </select>
                <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="filter-select">
                    <option value="">Semua Warna</option>
                    {colorOptions.map(color => (<option key={color.id_warna} value={color.id_warna}>{color.nama_warna}</option>))}
                </select>
            </div>

            <input
                type="text"
                placeholder="Cari Kode SKU / Nama Barang..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="filter-search-input"
            />
            <div className="job-list-container">
                {/* Tampilan Tabel Desktop */}
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Kode SKU</th>
                            <th>Nama Barang</th>
                            <th>Kategori</th>
                            <th>Sub-Kategori</th>
                            <th>Stok Tersedia</th>
                            <th>Total Unit</th>
                            <th>Ditambahkan Oleh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat data ringkasan...</td></tr>
                        ) : masterItems.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                Tidak ada barang cocok dengan filter.
                            </td></tr>
                        ) : (
                            masterItems.map(masterItem => (
                                <React.Fragment key={masterItem.id_m_barang}>
                                    <tr
                                        className={`summary-row hoverable-row ${expandedRows[masterItem.id_m_barang] ? 'expanded' : ''}`}
                                        onClick={() => toggleExpand(masterItem.id_m_barang)}
                                    >
                                        <td>{masterItem.kode_barang}</td>
                                        <td>{masterItem.nama_barang}</td>
                                        <td>{masterItem.master_kategori?.nama_kategori || '-'}</td>
                                        <td>{masterItem.sub_kategori?.nama_sub || '-'}</td>
                                        <td>{masterItem.available_stock_count}</td>
                                        <td>{masterItem.total_stock_count}</td>
                                        <td>{masterItem.created_by?.name || 'N/A'}</td>
                                    </tr>
                                    {expandedRows[masterItem.id_m_barang] && (
                                        <tr className="detail-rows-container">
                                            <td colSpan="7">
                                                {expandingId === masterItem.id_m_barang ? (
                                                    <div className="detail-loading">Memuat detail unit...</div>
                                                ) : detailItems[masterItem.id_m_barang]?.length > 0 ? (
                                                    <div className="detail-list-wrapper">
                                                        <div className="detail-list-header">
                                                            <div className="detail-cell header-kode">Kode Unik</div>
                                                            <div className="detail-cell header-sn">S/N</div>
                                                            <div className="detail-cell header-kondisi">Kondisi</div>
                                                            <div className="detail-cell header-status">Status</div>
                                                            <div className="detail-cell header-jumlah">Jumlah</div>
                                                            <div className="detail-cell header-warna">Warna</div>
                                                            <div className="detail-cell header-harga">Harga Beli</div>
                                                            <div className="detail-cell header-tglbeli">Tgl Beli</div>
                                                            <div className="detail-cell header-tanggal">Tgl Masuk</div>
                                                            <div className="detail-cell header-creator">Ditambahkan</div>
                                                            <div className="detail-cell header-aksi">Aksi</div>
                                                        </div>

                                                        <div className="detail-rows-list-container">
                                                            {detailItems[masterItem.id_m_barang].map(detail => (
                                                                <div
                                                                    key={detail.id}
                                                                    className="detail-row-div hoverable-row"
                                                                    onClick={(e) => {
                                                                        if (e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) return;
                                                                        setDetailItem(detail);
                                                                    }}
                                                                >
                                                                    <div className="detail-cell cell-kode">{detail.kode_unik}</div>
                                                                    <div className="detail-cell cell-sn">{detail.serial_number || '-'}</div>
                                                                    <div className="detail-cell cell-kondisi">{detail.kondisi}</div>
                                                                    <div className="detail-cell cell-status">
                                                                        <span className={`status-badge status-${(detail.status_detail?.nama_status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                            {detail.status_detail?.nama_status || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="detail-cell cell-jumlah">1</div>
                                                                    <div className="detail-cell cell-warna">
                                                                        {detail.color ? (
                                                                            <span title={detail.color.nama_warna} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                                                <span className="color-swatch" style={{ backgroundColor: detail.color.kode_hex }}></span>
                                                                            </span>
                                                                        ) : '-'}
                                                                    </div>
                                                                    <div className="detail-cell cell-harga">{formatCurrency(detail.harga_beli)}</div>
                                                                    <div className="detail-cell cell-tglbeli">{formatDate(detail.tanggal_pembelian)}</div>
                                                                    <div className="detail-cell cell-tanggal">{formatDate(detail.tanggal_masuk)}</div>
                                                                    <div className="detail-cell cell-creator">{detail.created_by?.name || '-'}</div>
                                                                    <div className="detail-cell cell-aksi action-buttons-group">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setDetailItem(detail); }}
                                                                            className="btn-user-action btn-detail"
                                                                        >
                                                                            <i className="fas fa-info-circle" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                        </button>

                                                                        {/* Button QR */}
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setQrModalItem(detail); }}
                                                                            className="btn-user-action btn-qr"
                                                                        >
                                                                            <i className="fas fa-qrcode" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="detail-nodata">{getNoDetailMessage()}</div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Tampilan Mobile */}
                <div className="job-list-mobile">
                    {loading ? (<p style={{ textAlign: 'center' }}>Memuat data...</p>)
                        : masterItems.length === 0 ? (<p style={{ textAlign: 'center', padding: '20px' }}>Tidak ada barang cocok filter.</p>)
                            : (
                                masterItems.map(masterItem => (
                                    <div
                                        key={masterItem.id_m_barang}
                                        onClick={() => toggleExpand(masterItem.id_m_barang)}
                                        className={`ticket-card-mobile summary-card hoverable-row ${expandedRows[masterItem.id_m_barang] ? 'expanded' : ''}`}
                                    >
                                        <div className="card-header">
                                            <h4>{masterItem.nama_barang} ({masterItem.kode_barang})</h4>
                                        </div>
                                        <div className="card-body">
                                            <div className="card-item-row">
                                                <span className="label">Kategori</span>
                                                <span className="value">{masterItem.master_kategori?.nama_kategori || '-'}</span>
                                            </div>
                                            <div className="card-separator"></div>
                                            <div className="card-item-row">
                                                <span className="label">Sub-Kategori</span>
                                                <span className="value">{masterItem.sub_kategori?.nama_sub || '-'}</span>
                                            </div>
                                            <div className="card-separator"></div>
                                            <div className="card-item-row">
                                                <span className="label">Stok Tersedia</span>
                                                <span className="value">{masterItem.available_stock_count}</span>
                                            </div>
                                            <div className="card-separator"></div>
                                            <div className="card-item-row">
                                                <span className="label">Total Unit</span>
                                                <span className="value">{masterItem.total_stock_count}</span>
                                            </div>
                                        </div>

                                        {expandedRows[masterItem.id_m_barang] && (
                                            <div className="detail-items-mobile-container">
                                                {expandingId === masterItem.id_m_barang ? (<p className="detail-loading-mobile">Memuat unit...</p>)
                                                    : detailItems[masterItem.id_m_barang]?.length > 0 ? (
                                                        detailItems[masterItem.id_m_barang].map(detail => (
                                                            <div key={detail.id} className="ticket-card-mobile detail-card">
                                                                <div className="card-header-detail">
                                                                    <span>{detail.kode_unik}</span>
                                                                    {detail.serial_number && <small>S/N: {detail.serial_number}</small>}
                                                                </div>
                                                                <div className="card-body">
                                                                    <div className="card-item-row">
                                                                        <span className="label">Kondisi</span><span className="value">{detail.kondisi}</span>
                                                                    </div>
                                                                    <div className="card-separator"></div>
                                                                    <div className="card-item-row">
                                                                        <span className="label">Status</span>
                                                                        <span className="value">
                                                                            <span className={`status-badge status-${(detail.status_detail?.nama_status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                {detail.status_detail?.nama_status || 'N/A'}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="card-separator"></div>
                                                                    <div className="card-item-row">
                                                                        <span className="label">Warna</span>
                                                                        <span className="value">{detail.color ? detail.color.nama_warna : '-'}</span>
                                                                    </div>
                                                                    <div className="card-separator"></div>
                                                                    <div className="card-item-row">
                                                                        <span className="label">Harga</span>
                                                                        <span className="value">{formatCurrency(detail.harga_beli)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="card-separator"></div>
                                                                <div className="card-row action-row">
                                                                    <button onClick={() => setDetailItem(detail)} className="btn-user-action btn-detail">Detail</button>
                                                                    <button onClick={() => setQrModalItem(detail)} className="btn-user-action btn-qr">QR</button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="detail-nodata-mobile">{getNoDetailMessage()}</p>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                </div>
            </div>
            {pagination && pagination.last_page > 1 && (
                <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    onPageChange={(page) => fetchData(page, currentFilters)}
                />
            )}

            {/* Modal */}
            {detailItem && (
                <ItemDetailModal
                    item={detailItem}
                    onClose={() => setDetailItem(null)}
                    onEditClick={handleOpenEditModal}
                    showToast={showToast}
                    onSaveSuccess={handleSaveSuccess}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                />
            )}
            {editItem && (
                <EditStokBarangModal
                    isOpen={!!editItem}
                    onClose={() => setEditItem(null)}
                    item={editItem}
                    showToast={showToast}
                    onSaveSuccess={handleSaveSuccess}
                    statusOptions={statusOptions}
                    colorOptions={colorOptions}
                    userOptions={[]}
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
                onSaveSuccess={() => fetchData(1, {})}
                showToast={showToast}
            />
        </>
    );
}

export default StokBarangView;