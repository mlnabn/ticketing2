import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import SkuDetailModal from './SkuDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};
const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

const expandVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3, ease: "easeInOut" }
    }
};


function ItemListView({
    items, loading, onScroll, isLoadingMore,
    mobileItems, isMobileLoading, onMobileScroll, isLoadingMoreMobile,
    onAdd, onEdit, onDelete, onFilterChange,
    selectedIds, onSelectId, onSelectAll, onBulkDelete, expandedRows, detailItems,
    expandingId, onToggleExpand, totalItems
}) {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);
    const isInitialMount = useRef(true);
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

    useEffect(() => {
        api.get('/inventory/categories').then(res => setCategories(res.data));
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            api.get(`/inventory/sub-categories?id_kategori=${selectedCategory}`)
                .then(res => setSubCategories(res.data));
        } else {
            setSubCategories([]);
        }
        setSelectedSubCategory('');
    }, [selectedCategory]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const filters = {};
        if (selectedCategory) filters.id_kategori = selectedCategory;
        if (selectedSubCategory) filters.id_sub_kategori = selectedSubCategory;
        onFilterChange(1, filters);
    }, [selectedCategory, selectedSubCategory, onFilterChange]);

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group') || e.target.type === 'checkbox') {
            return;
        }
        setSelectedItemForDetail(item);
    };

    return (
        <>
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={staggerItem} className="user-management-container">
                    <button className="btn-primary" onClick={onAdd}><i className="fas fa-plus" style={{ marginRight: '8px' }}></i>Daftarkan SKU Baru</button>
                </motion.div>
                <motion.div variants={staggerItem} className="filters-container" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="filter-select-invent"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(cat => (
                            <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                        ))}
                    </select>
                    <select
                        value={selectedSubCategory}
                        onChange={e => setSelectedSubCategory(e.target.value)}
                        disabled={!selectedCategory || subCategories.length === 0}
                        className="filter-select-invent"
                    >
                        <option value="">Semua Sub-Kategori</option>
                        {subCategories.map(sub => (
                            <option key={sub.id_sub_kategori} value={sub.id_sub_kategori}>{sub.nama_sub}</option>
                        ))}
                    </select>
                    {selectedIds.length > 0 && (
                        <div className="bulk-action-bar" >
                            <button onClick={onBulkDelete} className="btn-clear">
                                Hapus {selectedIds.length} SKU yang Dipilih
                            </button>
                        </div>
                    )}
                </motion.div>

                <motion.div variants={staggerItem} className="job-list-container">
                    <div className="table-scroll-container">

                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Kategori</th>
                                    <th>Sub-Kategori</th>
                                    <th>Jumlah Variasi</th>
                                </tr>
                            </thead>
                        </table>
                        <div
                            className="table-body-scroll"
                            ref={desktopListRef}
                            onScroll={onScroll}
                            style={{ overflowY: 'auto', maxHeight: '65vh' }}
                        >
                            <table className="job-table">
                                <tbody>
                                    {loading && items.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data barang...</td></tr>
                                    )}

                                    {!loading && items.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</td></tr>
                                    )}

                                    {items.map(item => (
                                        <React.Fragment key={item.kode_barang}>
                                            <tr
                                                className={`summary-row hoverable-row ${expandedRows[item.kode_barang] ? 'expanded' : ''}`}
                                                onClick={() => onToggleExpand(item.kode_barang)}
                                            >
                                                <td>{item.kode_barang}</td>
                                                <td>{item.nama_kategori || '-'}</td>
                                                <td>{item.nama_sub || '-'}</td>
                                                <td>{item.variations_count} VARIASI</td>
                                            </tr>
                                            <AnimatePresence initial={false}>
                                                {expandedRows[item.kode_barang] && (
                                                    <tr className="detail-rows-container-wrapper">
                                                        <td colSpan="4" style={{ padding: '0', overflow: 'hidden' }}>
                                                            <motion.div
                                                                key={`content-${item.kode_barang}`}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="hidden"
                                                                variants={expandVariants}
                                                            >
                                                                {expandingId === item.kode_barang ? (
                                                                    <div className="detail-loading">Memuat variasi SKU...</div>
                                                                ) : detailItems[item.kode_barang]?.length > 0 ? (
                                                                    <div className="sku-detail-list-wrapper" style={{ padding: '0 20px' }}>
                                                                        <div className="sku-detail-list-header">
                                                                            <div className="detail-cell header-select">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    title="Pilih Semua di grup ini"
                                                                                    checked={detailItems[item.kode_barang].every(child => selectedIds.includes(child.id_m_barang))}
                                                                                    onChange={(e) => onSelectAll(e, item.kode_barang)}
                                                                                />
                                                                            </div>
                                                                            <div className="detail-cell header-kode" style={{ fontSize: '15px' }}>Nama Barang (Variasi)</div>
                                                                            <div className="detail-cell header-stok" style={{ fontSize: '15px' }}>Stok Tersedia</div>
                                                                            <div className="detail-cell header-aksi" style={{ fontSize: '15px' }}>Aksi</div>
                                                                        </div>
                                                                        <div
                                                                            className="detail-rows-list-container"
                                                                            style={{ overflowY: 'auto', maxHeight: '300px' }}
                                                                        >
                                                                            {detailItems[item.kode_barang].map(detail => (
                                                                                <div
                                                                                    key={detail.id_m_barang}
                                                                                    className={`sku-detail-row-div hoverable-row ${selectedIds.includes(detail.id_m_barang) ? 'selected-row' : ''}`}
                                                                                    onClick={(e) => {
                                                                                        handleRowClick(e, detail);
                                                                                    }}
                                                                                >
                                                                                    <div className="detail-cell cell-select">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedIds.includes(detail.id_m_barang)}
                                                                                            onChange={() => onSelectId(detail.id_m_barang)}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="detail-cell cell-kode">{detail.nama_barang}</div>
                                                                                    <div className="detail-cell cell-stok">{detail.stok_tersedia_count}</div>
                                                                                    <div className="detail-cell cell-aksi action-buttons-group">
                                                                                        <button onClick={(e) => { e.stopPropagation(); onEdit(detail); }} className="btn-user-action btn-detail">
                                                                                            <i className="fas fa-edit" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                                        </button>
                                                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(detail); }} className="btn-user-action btn-dlt">
                                                                                            <i className="fas fa-trash-alt" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="detail-nodata">Tidak ada variasi SKU untuk kode ini.</div>
                                                                )}
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>

                                        </React.Fragment>
                                    ))}
                                    {isLoadingMore && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                        {!loading && !isLoadingMore && items.length > 0 && (
                            <table className="job-table">
                                <tfoot>
                                    <tr className="subtotal-row">
                                        <td colSpan="5" style={{ textAlign: 'left', paddingLeft: '1.25rem', fontWeight: 'bold' }}>Total SKU</td>
                                        <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                            {totalItems} Item
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>

                    {/* === TAMPILAN KARTU UNTUK MOBILE === */}
                    <div
                        className="job-list-mobile"
                        ref={mobileListRef}
                        onScroll={onMobileScroll}
                        style={{ overflowY: 'auto', maxHeight: '65vh' }}
                    >
                        {isMobileLoading && mobileItems.length === 0 && (
                            <p style={{ textAlign: 'center' }}>Memuat data barang...</p>
                        )}
                        {!isMobileLoading && mobileItems.length === 0 && (
                            <p style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</p>
                        )}

                        {mobileItems.map(item => (
                            <div
                                key={item.id_m_barang}
                                className="ticket-card-mobile clickable-row"
                                onClick={(e) => handleRowClick(e, item)}
                            >
                                <div className="card-header">
                                    <h4>{item.nama_barang}</h4>
                                    <small>Kode: {item.kode_barang}</small>
                                </div>
                                {/* <div className="card-body">
                                    <div className="card-item-row">
                                        <span className="label">Kategori:</span>
                                        <span className="value">{item.master_kategori?.nama_kategori || '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Sub-Kategori:</span>
                                        <span className="value">{item.sub_kategori?.nama_sub || '-'}</span>
                                    </div>
                                </div> */}
                                {/* <div className="card-separator"></div> */}
                                <div className="card-row action-row">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="action-buttons-group btn-edit">Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="action-buttons-group btn-delete">Hapus</button>
                                </div>
                            </div>
                        ))}

                    </div>
                    {!loading && !isLoadingMore && items.length > 0 && (
                        <div className='job-list-mobile'>

                            <div className="subtotal-card-mobile"
                                style={{ marginTop: '1rem', marginBottom: '1rem' }}
                            >
                                <span className="subtotal-label"
                                    style={{ fontSize: '13px', fontWeight: 'bold' }}
                                >Total SKU</span>
                                <span className="subtotal-value"
                                    style={{ fontSize: '13px', fontWeight: 'bold' }}
                                >
                                    {totalItems} Item
                                </span>
                            </div>

                        </div>
                    )}
                </motion.div>

            </motion.div>


            <SkuDetailModal
                show={Boolean(selectedItemForDetail)}
                item={selectedItemForDetail}
                onClose={() => setSelectedItemForDetail(null)}
            />
        </>
    );
}

export default ItemListView;