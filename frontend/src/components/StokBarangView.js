import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import ItemDetailModal from './ItemDetailModal';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import EditStokBarangModal from './EditStokBarangModal';
import AddStockModal from './AddStockModal';
import QrScannerModal from './QrScannerModal';
import { createPortal } from 'react-dom';
import QrPrintSheet from './QrPrintSheet';

function StokBarangView() {
    const { showToast } = useOutletContext();
    const printRef = useRef();
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
    const [tersediaStatusId, setTersediaStatusId] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({});

    // --- State untuk Print QR ---
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [itemsToPrint, setItemsToPrint] = useState([]);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);
    const [isLoadingMoreDetail, setIsLoadingMoreDetail] = useState(null);

    // fetchData mengambil data summary
    const fetchData = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        setCurrentFilters(filters);
        if (page === 1) {
            setMasterItems([]);
            setPagination(null);
        }
        try {
            const params = { page, ...filters };
            const res = await api.get('/inventory/stock-summary', { params });
            if (page > 1) {
                setMasterItems(prev => [...prev, ...res.data.data]);
            } else {
                setMasterItems(res.data.data);
            }

            setPagination(res.data);
            if (page === 1) {
                setExpandedRows({});
                setDetailItems({});
                setSelectedItems(new Set());
            }

        } catch (error) {
            showToast('Gagal memuat data ringkasan stok.', 'error');
            console.error("Fetch Stok Summary Error:", error);
        } finally {
            setLoading(false);
        }
    }, [showToast, setSelectedItems]); // dependensi tetap

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

    const loadMoreItems = async () => {
        if (isLoadingMore || !pagination || pagination.current_page >= pagination.last_page) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pagination.current_page + 1;
            const params = { page: nextPage, ...currentFilters };
            const res = await api.get('/inventory/stock-summary', { params });

            setMasterItems(prev => [...prev, ...res.data.data]); // Tambahkan data baru
            setPagination(res.data);
        } catch (error) {
            showToast('Gagal memuat data tambahan.', 'error');
            console.error("Fetch More Stok Summary Error:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && !loading && !isLoadingMore && pagination && pagination.current_page < pagination.last_page) {
            loadMoreItems();
        }
    };

    const loadMoreDetailItems = async (masterBarangId) => {
        const detailState = detailItems[masterBarangId];
        if (!detailState || isLoadingMoreDetail === masterBarangId || detailState.pagination.currentPage >= detailState.pagination.totalPages) {
            return;
        }

        setIsLoadingMoreDetail(masterBarangId);
        try {
            const nextPage = detailState.pagination.currentPage + 1;
            const params = {
                master_barang_id: masterBarangId,
                status_id: (selectedStatus === "ALL") ? "" : selectedStatus,
                id_warna: selectedColor,
                search: debouncedSearchTerm,
                page: nextPage
            };
            const res = await api.get('/inventory/stock-items', { params });

            setDetailItems(prev => ({
                ...prev,
                [masterBarangId]: {
                    ...prev[masterBarangId],
                    items: [...prev[masterBarangId].items, ...res.data.data],
                    pagination: {
                        ...prev[masterBarangId].pagination,
                        currentPage: res.data.current_page,
                        totalPages: res.data.last_page
                    }
                }
            }));
        } catch (error) {
            showToast('Gagal memuat detail item tambahan.', 'error');
        } finally {
            setIsLoadingMoreDetail(null);
        }
    };

    const handleDetailScroll = (e, masterBarangId) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

        const detailState = detailItems[masterBarangId];
        if (!detailState) return;

        if (nearBottom && isLoadingMoreDetail !== masterBarangId && detailState.pagination.currentPage < detailState.pagination.totalPages) {
            loadMoreDetailItems(masterBarangId);
        }
    };

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
                if (selectedStatus === "" && !tersediaStatusId) {
                    console.error("ID Status 'Tersedia' belum siap untuk fetch detail.");
                    showToast("Gagal memuat detail: Status default belum siap.", "error");
                    setExpandedRows(prev => ({ ...prev, [masterBarangId]: false }));
                    setExpandingId(null);
                    return;
                }

                const params = {
                    master_barang_id: masterBarangId,
                    status_id: (selectedStatus === "ALL") ? "" : selectedStatus,
                    id_warna: selectedColor,
                    search: debouncedSearchTerm,
                    page: 1
                };
                const res = await api.get('/inventory/stock-items', { params });
                setDetailItems(prev => ({
                    ...prev,
                    [masterBarangId]: {
                        items: res.data.data,
                        pagination: {
                            currentPage: res.data.current_page,
                            totalPages: res.data.last_page,
                            total: res.data.total
                        }
                    }
                }));
            } catch (error) {
                console.error("Fetch Detail Error:", error);
                showToast('Gagal memuat detail item.', 'error');
                setExpandedRows(prev => ({ ...prev, [masterBarangId]: false }));
            } finally {
                setExpandingId(null);
            }
        }
    };

    const handleOpenEditModal = (itemToEdit) => {
        setDetailItem(null);
        setEditItem(itemToEdit);
    };

    const handleSaveSuccess = () => {
        fetchData(pagination?.current_page || 1, currentFilters);
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

    const handleSelectItem = (id, isChecked) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    const handleSelectAllMaster = (masterBarangId, isChecked) => {
        const itemIds = detailItems[masterBarangId]?.items?.map(item => item.id) || [];
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                itemIds.forEach(id => newSet.add(id));
            } else {
                itemIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };

    
    const isAllMasterSelected = (masterBarangId) => {
        const itemIds = detailItems[masterBarangId]?.items?.map(item => item.id) || [];
        if (itemIds.length === 0) return false;
        return itemIds.every(id => selectedItems.has(id));
    };

    const handlePreparePrint = () => {
        const itemsToPrintData = [];
        Object.values(detailItems).forEach(detailState => {
            detailState.items.forEach(item => {
                if (selectedItems.has(item.id)) {
                    if (item.kode_unik && item.master_barang) {
                        itemsToPrintData.push(item);
                    }
                }
            });
        });

        if (itemsToPrintData.length === 0) {
            showToast('Tidak ada item terpilih untuk di-print.', 'warning');
            return;
        }

        setItemsToPrint(itemsToPrintData);
    };

    useEffect(() => {
        if (itemsToPrint.length > 0) {
            const timer = setTimeout(() => {
                window.print();
                setItemsToPrint([]);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [itemsToPrint]);

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
                    handleScanSearch(code);
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

    const handleClearSelection = () => {
        setSelectedItems(new Set());
    };

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Daftar Stok Barang</h1>
                <div className="action-buttons-stok">
                    <button className="btn-primary" onClick={() => setIsAddStockOpen(true)}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}>
                        </i>Tambah Stok
                    </button>

                    <button className="btn-scan" onClick={() => setIsScannerOpen(true)}>
                        <span className="fa-stack" style={{ marginRight: '8px', fontSize: '0.8em' }}>
                            <i className="fas fa-qrcode fa-stack-2x"></i>
                            <i className="fas fa-expand fa-stack-1x fa-inverse"></i>
                        </span>
                        Scan QR
                    </button>
                    <button
                        className="btn-primary-outline"
                        onClick={handlePreparePrint}
                        disabled={selectedItems.size === 0}
                    >
                        <i className="fas fa-print" style={{ marginRight: '8px' }}></i>
                        Print QR ({selectedItems.size})
                    </button>
                    {selectedItems.size > 0 && (
                        <button
                            className="btn-soft-grey"
                            onClick={handleClearSelection}
                            title="Hilangkan semua pilihan"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
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
                <div className="table-scroll-container">
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
                    </table>
                    <div
                        className="table-body-scroll"
                        ref={desktopListRef}
                        onScroll={handleScroll}
                        style={{ overflowY: 'auto', maxHeight: '65vh' }}
                    >
                        <table className="job-table">
                            <tbody>
                                {loading && masterItems.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat data ringkasan...</td></tr>
                                )}
                                {!loading && masterItems.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        Tidak ada barang cocok dengan filter.
                                    </td></tr>
                                )}
                                {!loading && masterItems.map(masterItem => (
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
                                                    ) : detailItems[masterItem.id_m_barang]?.items?.length > 0 ? (
                                                        <div className="detail-list-wrapper">
                                                            <div className="detail-list-header">
                                                                <div className="detail-cell header-select">
                                                                    <input
                                                                        type="checkbox"
                                                                        title="Pilih Semua di grup ini"
                                                                        checked={isAllMasterSelected(masterItem.id_m_barang)}
                                                                        onChange={(e) => handleSelectAllMaster(masterItem.id_m_barang, e.target.checked)}
                                                                    />
                                                                </div>
                                                                <div className="detail-cell header-kode">Kode Unik</div>
                                                                <div className="detail-cell header-sn">S/N</div>
                                                                <div className="detail-cell header-kondisi">Kondisi</div>
                                                                <div className="detail-cell header-status">Status</div>
                                                                <div className="detail-cell header-warna">Warna</div>
                                                                <div className="detail-cell header-harga">Harga Beli</div>
                                                                <div className="detail-cell header-tglbeli">Tgl Beli</div>
                                                                <div className="detail-cell header-tanggal">Tgl Masuk</div>
                                                                <div className="detail-cell header-creator">Ditambahkan</div>
                                                                <div className="detail-cell header-aksi">Aksi</div>
                                                            </div>

                                                            <div
                                                                className="detail-rows-list-container"
                                                                style={{ overflowY: 'auto', maxHeight: '300px' }}
                                                                onScroll={(e) => handleDetailScroll(e, masterItem.id_m_barang)}
                                                            >
                                                                {detailItems[masterItem.id_m_barang].items.map(detail => (
                                                                    <div
                                                                        key={detail.id}
                                                                        className="detail-row-div hoverable-row"
                                                                        onClick={(e) => {
                                                                            if (e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) return;
                                                                            setDetailItem(detail);
                                                                        }}
                                                                    >
                                                                        <div className="detail-cell cell-select">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedItems.has(detail.id)}
                                                                                onChange={(e) => handleSelectItem(detail.id, e.target.checked)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                        </div>
                                                                        <div className="detail-cell cell-kode">{detail.kode_unik}</div>
                                                                        <div className="detail-cell cell-sn">{detail.serial_number || '-'}</div>
                                                                        <div className="detail-cell cell-kondisi">{detail.kondisi}</div>
                                                                        <div className="detail-cell cell-status">
                                                                            <span className={`status-badge status-${(detail.status_detail?.nama_status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                {detail.status_detail?.nama_status || 'N/A'}
                                                                            </span>
                                                                        </div>
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
                                                            {isLoadingMoreDetail === masterItem.id_m_barang && (
                                                                <div className="detail-loading" style={{ padding: '10px 0' }}>Memuat unit lainnya...</div>
                                                            )}
                                                            {!loading && !isLoadingMoreDetail && detailItems[masterItem.id_m_barang] && (
                                                                <div className="detail-list-header" >
                                                                    <div className="detail-cell" style={{ flex: 1, fontWeight: 'bold' }}>
                                                                        Total Unit (SKU Ini)
                                                                    </div>
                                                                    <div className="detail-cell header-aksi" style={{ justifyContent: 'flex-end', fontWeight: 'bold' }}>
                                                                        {detailItems[masterItem.id_m_barang].pagination.total} Data
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="detail-nodata">{getNoDetailMessage()}</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {isLoadingMore && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && masterItems.length > 0 && pagination && (
                        <table className="job-table">
                            <tfoot>
                                <tr className="subtotal-row">
                                    <td colSpan={6}>Total Tipe Barang</td>
                                    <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                        {pagination.total} Tipe Barang
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
                {/* Tampilan Mobile */}
                <div
                    className="job-list-mobile"
                    ref={mobileListRef}
                    onScroll={handleScroll}
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {(loading && masterItems.length === 0) ? (<p style={{ textAlign: 'center' }}>Memuat data...</p>)
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
                                            <div
                                                className="detail-items-mobile-container"
                                                style={{ overflowY: 'auto', maxHeight: '300px' }}
                                                onScroll={(e) => handleDetailScroll(e, masterItem.id_m_barang)}
                                            >
                                                {expandingId === masterItem.id_m_barang ? (<p className="detail-loading-mobile">Memuat unit...</p>)
                                                    : detailItems[masterItem.id_m_barang]?.items?.length > 0 ? (
                                                        detailItems[masterItem.id_m_barang].items.map(detail => (
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
                                                {isLoadingMoreDetail === masterItem.id_m_barang && (
                                                    <p className="detail-loading-mobile" style={{ padding: '10px 0' }}>Memuat unit lainnya...</p>
                                                )}
                                                {!loading && !isLoadingMoreDetail && detailItems[masterItem.id_m_barang] && detailItems[masterItem.id_m_barang].items.length > 0 && (
                                                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ margin: '10px 0 5px 0', padding: '10px', backgroundColor: '#2D3748' }}>
                                                        <span className="subtotal-label">Total Unit (SKU Ini)</span>
                                                        <span className="subtotal-value value-acquisition" style={{ fontSize: '1.0rem', fontWeight: 'bold' }}>
                                                            {detailItems[masterItem.id_m_barang].pagination.total} Data
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                    {!loading && !isLoadingMore && masterItems.length > 0 && pagination && (
                        <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            <span className="subtotal-label">Total Tipe Barang (SKU)</span>
                            <span className="subtotal-value value-acquisition" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {pagination.total} Data
                            </span>
                        </div>
                    )}

                    {isLoadingMore && (
                        <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                    )}
                </div>
            </div>
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
            {createPortal(
                <QrPrintSheet ref={printRef} items={itemsToPrint} />,
                document.getElementById('print-portal')
            )}
        </>
    );
}

export default StokBarangView;