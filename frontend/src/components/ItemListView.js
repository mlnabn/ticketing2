import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import SkuDetailModal from './SkuDetailModal';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import Select from 'react-select';

function useMediaQuery(query) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
}

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

const filterExpandVariants = {
    closed: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        marginTop: 0,
        marginBottom: 0
    },
    open: {
        height: 'auto',
        opacity: 1,
        overflow: 'visible',
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
        y: 0
    }
};
const filterExpandTransition = {
    type: "spring",
    stiffness: 150,
    damping: 25
};

function ItemListView({
    items, loading, onScroll, isLoadingMore,
    onAdd, onEdit, onDelete, onFilterChange,
    selectedIds, onSelectId, onSelectAll, onBulkDelete, expandedRows, detailItems,
    expandingId, onToggleExpand, totalItems,
    showArchived, onToggleArchived, onRestore, onBulkRestore, currentFilters
}) {
    const isPresent = useIsPresent();
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [selectedSubCategory, setSelectedSubCategory] = useState();
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const isInitialMount = useRef(true);
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

    const handleFilterChange = (name, selectedOption) => {
        const value = selectedOption ? selectedOption.value : '';

        if (name === 'category') {
            setSelectedCategory(value);
            if (value === '') {
                setSelectedSubCategory('');
            }
        } else if (name === 'subCategory') {
            setSelectedSubCategory(value);
        }
    };

    useEffect(() => {
        if (!isPresent) return;
        api.get('/inventory/categories').then(res => {
            const options = res.data.map(cat => ({
                value: cat.id_kategori,
                label: cat.nama_kategori
            }));
            const allOption = { value: '', label: 'Semua Kategori' };

            setCategoryOptions([allOption, ...options]);
            setSelectedCategory('');
        });
    }, [isPresent]);

    useEffect(() => {
        if (!isPresent) return;
        const categoryId = selectedCategory;

        if (categoryId) {
            api.get(`/inventory/sub-categories?id_kategori=${categoryId}`)
                .then(res => {
                    const options = res.data.map(sub => ({
                        value: sub.id_sub_kategori,
                        label: sub.nama_sub
                    }));
                    const allSubOption = { value: '', label: 'Semua Sub-Kategori' };
                    setSubCategoryOptions([allSubOption, ...options]);
                    setSelectedSubCategory('');
                });
        } else {
            const allSubOption = { value: '', label: 'Semua Sub-Kategori' };
            setSubCategoryOptions([allSubOption]);
            setSelectedSubCategory('');
        }
    }, [selectedCategory, isPresent]);

    useEffect(() => {
        if (!isPresent) return;
        if (currentFilters) {
            const newCat = currentFilters.id_kategori || '';
            const newSub = currentFilters.id_sub_kategori || '';

            setSelectedCategory(prev => (newCat !== prev ? newCat : prev));
            setSelectedSubCategory(prev => (newSub !== prev ? newSub : prev));
        }
    }, [currentFilters, isPresent]);

    useEffect(() => {
        if (!isMobile) {
            setIsMobileFilterOpen(true);
        }
        else {
            setIsMobileFilterOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!isPresent) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const filters = {};
        const categoryId = selectedCategory;
        const subCategoryId = selectedSubCategory;

        if (categoryId) filters.id_kategori = categoryId;
        if (subCategoryId) filters.id_sub_kategori = subCategoryId;

        onFilterChange(1, filters);
    }, [selectedCategory, selectedSubCategory, onFilterChange, isPresent]);

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
                <motion.div variants={staggerItem} className="sku-add-button-container">
                    {!showArchived && (
                        <button className="btn-primary" onClick={onAdd}>
                            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                            Tipe Barang
                        </button>
                    )}
                    <button
                        onClick={() => onToggleArchived(!showArchived)}
                        className={`btn-archive ${showArchived ? 'active' : ''}`}
                        title={showArchived ? 'Kembali ke daftar SKU aktif' : 'Lihat SKU yang diarsipkan'}
                    >
                        <i className={`fas ${showArchived ? 'fa-box' : 'fa-archive'}`} style={{ marginRight: '8px' }}></i>
                        {showArchived ? 'Tipe Barang Aktif' : 'Lihat Arsip'}
                    </button>
                </motion.div>

                <AnimatePresence>
                    {isMobile && (
                        <motion.div
                            key="toggle-filter-button"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.button
                                className="btn-toggle-filters"
                                onClick={() => setIsMobileFilterOpen(prev => !prev)}
                            >
                                <i className={`fas ${isMobileFilterOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '8px' }}></i>
                                {isMobileFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {isMobileFilterOpen && (
                        <motion.div
                            variants={staggerItem}
                            className="filters-container"
                        >
                            <motion.div
                                key="mobile-filters-content"
                                initial={isMobile ? {
                                    height: 0,
                                    opacity: 0,
                                    y: -20,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    overflow: 'hidden'
                                } : false}
                                animate="open"
                                exit="closed"
                                transition={filterExpandTransition}
                                variants={filterExpandVariants}
                                className="filters-content-wrapper"
                            >
                                <Select
                                    className='filter-select-inventory-item'
                                    classNamePrefix="filter-select-invent"
                                    value={categoryOptions.find(option => option.value === selectedCategory)}
                                    onChange={(option) => handleFilterChange('category', option)}
                                    options={categoryOptions}
                                    isClearable={true}
                                    isSearchable={true}
                                    placeholder="Semua Kategori"
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                                <Select
                                    className='filter-select-inventory-item'
                                    classNamePrefix="filter-select-invent"
                                    value={subCategoryOptions.find(option => option.value === selectedSubCategory)}
                                    onChange={(option) => handleFilterChange('subCategory', option)}
                                    options={subCategoryOptions}
                                    isClearable={true}
                                    isDisabled={!selectedCategory || subCategoryOptions.length <= 1}
                                    isSearchable={true}
                                    placeholder="Semua Sub-Kategori"
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {selectedIds.length > 0 && (
                    <div className="bulk-action-bar" >
                        {showArchived ? (
                            <button onClick={onBulkRestore} className="btn-clear" style={{ color: '#28a745', fontWeight: 'bold' }}>
                                <i className="fas fa-undo" style={{ marginRight: '5px' }}></i>
                                Pulihkan {selectedIds.length} SKU
                            </button>
                        ) : (
                            <button onClick={onBulkDelete} className="btn-clear">
                                <i className="fas fa-archive" style={{ marginRight: '5px' }}></i>
                                Arsipkan {selectedIds.length} SKU
                            </button>
                        )}
                    </div>
                )}

                <motion.div variants={staggerItem} className="job-list-container">
                    <div className="table-scroll-container">
                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>Kode Unik</th>
                                    <th>Kategori</th>
                                    <th>Sub-Kategori</th>
                                    <th>Jumlah Tipe Barang</th>
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
                                <tbody style={{ minHeight: loading ? '150px' : 'auto', display: 'table-row-group' }}>
                                    {loading && !isLoadingMore && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                            Memuat data barang...
                                        </td></tr>
                                    )}
                                    {!loading && !isLoadingMore && items.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                            {showArchived ? 'Tidak ada SKU yang diarsipkan.' : 'Belum ada tipe barang yang didaftarkan.'}
                                        </td></tr>
                                    )}
                                    {(!loading || isLoadingMore) && items.map(item => (
                                        <React.Fragment key={item.kode_barang}>
                                            <tr
                                                className={`summary-row hoverable-row ${expandedRows[item.kode_barang] ? 'expanded' : ''}`}
                                                onClick={() => onToggleExpand(item.kode_barang)}
                                            >
                                                <td>{item.kode_barang}</td>
                                                <td>{item.nama_kategori || '-'}</td>
                                                <td>{item.nama_sub || '-'}</td>
                                                <td>{item.variations_count} TIPE BARANG</td>
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
                                                                    <div className="detail-loading">Memuat Tipe Barang...</div>
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
                                                                            <div className="detail-cell header-kode" style={{ fontSize: '15px' }}>Tipe Barang</div>
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
                                                                                        {!showArchived && (
                                                                                            <button onClick={(e) => { e.stopPropagation(); onEdit(detail); }} className="btn-user-action btn-detail">
                                                                                                <i className="fas fa-edit" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                                            </button>
                                                                                        )}
                                                                                        {showArchived ? (
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); onRestore(detail); }}
                                                                                                className="btn-user-action btn-restore"
                                                                                                title="Pulihkan SKU ini"
                                                                                            >
                                                                                                <i className="fas fa-undo" style={{ fontSize: '20px', marginRight: '5px', color: '#28a745' }}></i>
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); onDelete(detail); }}
                                                                                                className="btn-user-action btn-dlt"
                                                                                                disabled={detail.total_active_stock > 0}
                                                                                                title={detail.total_active_stock > 0 ? 'SKU tidak bisa diarsipkan jika masih ada stok aktif (Tersedia, Dipinjam, dll)' : 'Arsipkan SKU ini'}
                                                                                            >
                                                                                                <i className="fas fa-archive" style={{ fontSize: '20px', marginRight: '5px' }}></i>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="detail-nodata">Tidak ada Tipe Barang untuk kode ini.</div>
                                                                )}
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                    {isLoadingMore && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>Memuat lebih banyak...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!loading && !isLoadingMore && items.length > 0 && (
                            <table className="job-table">
                                <tfoot>
                                    <tr className="subtotal-row">
                                        <td colSpan="3" style={{ textAlign: 'left', paddingLeft: '1.25rem', fontWeight: 'bold' }}>Total Kode Unik</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {totalItems} Item
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>

                    <div
                        className="job-list-mobile"
                        ref={mobileListRef}
                        onScroll={onScroll}
                        style={{ overflowY: 'auto', maxHeight: '65vh', minHeight: '150px' }}
                    >
                        {loading && !isLoadingMore && (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Memuat data barang...</p>
                        )}

                        {!loading && !isLoadingMore && items.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '20px' }}>
                                {showArchived ? 'Tidak ada SKU yang diarsipkan.' : 'Belum ada tipe barang yang didaftarkan.'}
                            </p>
                        )}

                        {(!loading || isLoadingMore) && items.map(item => (
                            <div
                                key={item.kode_barang}
                                className={`ticket-card-mobile summary-card hoverable-row ${expandedRows[item.kode_barang] ? 'expanded' : ''}`}
                                onClick={() => onToggleExpand(item.kode_barang)}
                            >
                                <div className="card-header">
                                    <h4>{item.kode_barang}</h4>
                                </div>
                                <div className="card-body">
                                    <div className="card-item-row">
                                        <span className="label">Kategori</span>
                                        <span className="value">{item.nama_kategori || '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Sub-Kategori</span>
                                        <span className="value">{item.nama_sub || '-'}</span>
                                    </div>
                                    <div className="card-separator"></div>
                                    <div className="card-item-row">
                                        <span className="label">Jumlah Tipe Barang</span>
                                        <span className="value">{item.variations_count}</span>
                                    </div>
                                </div>

                                <AnimatePresence initial={false}>
                                    {expandedRows[item.kode_barang] && (
                                        <motion.div
                                            key={`mobile-content-${item.kode_barang}`}
                                            className="detail-items-mobile-container"
                                            style={{ overflowY: 'auto', maxHeight: '300px' }}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={expandVariants}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {expandingId === item.kode_barang ? (
                                                <p className="detail-loading-mobile">Memuat Tipe Barang...</p>
                                            ) : detailItems[item.kode_barang]?.length > 0 ? (
                                                detailItems[item.kode_barang].map(detail => (
                                                    <div
                                                        key={detail.id_m_barang}
                                                        className="ticket-card-mobile detail-card hoverable-row"
                                                    >
                                                        <div className="card-select-col">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(detail.id_m_barang)}
                                                                onChange={() => onSelectId(detail.id_m_barang)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div
                                                            className="card-content-col hoverable-row"
                                                            onClick={(e) => {
                                                                if (e.target.tagName === 'BUTTON' || e.target.closest('.action-row') || e.target.closest('.card-select-col') || e.target.type === 'checkbox') {
                                                                    return;
                                                                }
                                                                handleRowClick(e, detail);
                                                            }}
                                                        >
                                                            <div className="card-row">
                                                                <div>
                                                                    <span className='value description'>{detail.nama_barang}</span>
                                                                </div>
                                                            </div>
                                                            <div className="card-row">
                                                                <div className="data-group horizontal">
                                                                    <span className="label" style={{ fontSize: '13px', fontWeight: '600' }}>Stok Tersedia</span>
                                                                    <span className="value">{detail.stok_tersedia_count}</span>
                                                                </div>
                                                            </div>
                                                            <div className="card-row action-row">
                                                                {!showArchived && (
                                                                    <button onClick={(e) => { e.stopPropagation(); onEdit(detail); }} className="btn-user-action btn-detail">Edit</button>
                                                                )}
                                                                {showArchived ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onRestore(detail); }}
                                                                        className="btn-user-action btn-restore"
                                                                        title="Pulihkan SKU ini"
                                                                        style={{ color: '#28a745', fontWeight: 'bold' }}
                                                                    >
                                                                        Pulihkan
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onDelete(detail); }}
                                                                        className="btn-user-action btn-dlt"
                                                                        disabled={detail.total_active_stock > 0}
                                                                        title={detail.total_active_stock > 0 ? 'SKU tidak bisa diarsipkan jika masih ada stok aktif' : 'Arsipkan SKU ini'}
                                                                    >
                                                                        Arsipkan
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="detail-nodata-mobile">Tidak ada Tipe Barang untuk kode ini.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {isLoadingMore && (
                            <p style={{ textAlign: 'center', padding: '10px' }}>Memuat lebih banyak...</p>
                        )}
                    </div>

                    {!loading && !isLoadingMore && items.length > 0 && (
                        <div className='job-list-mobile'>
                            <div className="subtotal-card-mobile"
                                style={{ marginTop: '1rem', marginBottom: '1rem' }}
                            >
                                <span className="subtotal-label"
                                    style={{ fontSize: '13px', fontWeight: 'bold' }}
                                >Total Kode Unik</span>
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