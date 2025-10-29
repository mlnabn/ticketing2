import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import SkuDetailModal from './SkuDetailModal';

function ItemListView({
    items, loading, onAdd, onEdit, onDelete, onFilterChange, onScroll, isLoadingMore,
    selectedIds, onSelectId, onSelectAll, onBulkDelete, totalItems
}) {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
    const isAllSelectedOnPage = items.length > 0 && selectedIds.length === items.length;

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
        const filters = {};
        if (selectedCategory) filters.id_kategori = selectedCategory;
        if (selectedSubCategory) filters.id_sub_kategori = selectedSubCategory;
        onFilterChange(1, filters);
    }, [selectedCategory, selectedSubCategory, onFilterChange]);

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) {
            return;
        }
        setSelectedItemForDetail(item);
    };

    return (
        <>
            <div className="user-management-header">
                <button className="btn-primary" onClick={onAdd}><i className="fas fa-plus" style={{ marginRight: '8px' }}></i>Daftarkan SKU Baru</button>
            </div>
            <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
                        <button onClick={onBulkDelete} className="btn-delete">
                            Hapus {selectedIds.length} SKU yang Dipilih
                        </button>
                    </div>
                )}
            </div>

            <div className="job-list-container">
                <div className="table-scroll-container">

                    <table className="job-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={onSelectAll}
                                        checked={isAllSelectedOnPage}
                                    />
                                </th>
                                <th>Kode</th>
                                <th>Nama Barang</th>
                                <th>Kategori</th>
                                <th>Sub-Kategori</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                    </table>
                    <div
                        className="table-body-scroll"
                        ref={desktopListRef}
                        onScroll={onScroll}
                    >
                        <table className="job-table">
                            <tbody>
                                {loading && items.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data barang...</td></tr>
                                )}

                                {!loading && items.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</td></tr>
                                )}

                                {items.map(item => (
                                    <tr
                                        key={item.id_m_barang}
                                        className="clickable-row"
                                        onClick={(e) => handleRowClick(e, item)}
                                    >
                                        <td style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id_m_barang)}
                                                onChange={() => onSelectId(item.id_m_barang)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td>{item.kode_barang}</td>
                                        <td>{item.nama_barang}</td>
                                        <td>{item.master_kategori?.nama_kategori || '-'}</td>
                                        <td>{item.sub_kategori?.nama_sub || '-'}</td>
                                        <td className="action-buttons-group">
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="btn-user-action btn-edit">Edit</button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="btn-user-action btn-delete">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                                {isLoadingMore && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
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
                                        {totalItems} Data
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {/* === TAMPILAN KARTU UNTUK MOBILE (DIMODIFIKASI) === */}
                <div
                    className="job-list-mobile"
                    ref={mobileListRef}
                    onScroll={onScroll}
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {loading && items.length === 0 && (
                        <p style={{ textAlign: 'center' }}>Memuat data barang...</p>
                    )}

                    {!loading && items.length === 0 && (
                        <p style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</p>
                    )}

                    {items.map(item => (
                        <div
                            key={item.id_m_barang}
                            className="ticket-card-mobile clickable-row"
                            onClick={(e) => handleRowClick(e, item)}
                        >
                            <div className="card-header">
                                <h4>{item.nama_barang}</h4>
                                <small>Kode: {item.kode_barang}</small>
                            </div>
                            <div className="card-body">
                                <div className="card-item-row">
                                    <span className="label">Kategori:</span>
                                    <span className="value">{item.master_kategori?.nama_kategori || '-'}</span>
                                </div>
                                <div className="card-separator"></div>
                                <div className="card-item-row">
                                    <span className="label">Sub-Kategori:</span>
                                    <span className="value">{item.sub_kategori?.nama_sub || '-'}</span>
                                </div>
                            </div>
                            <div className="card-separator"></div>
                            <div className="card-row action-row">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="action-buttons-group btn-edit">Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="action-buttons-group btn-delete">Hapus</button>
                            </div>
                        </div>
                    ))}
                    {isLoadingMore && (
                        <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                    )}
                    {!loading && !isLoadingMore && items.length > 0 && (
                        <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem' }}>
                            <span className="subtotal-label">Total SKU</span>
                            <span className="subtotal-value value-acquisition" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {totalItems} Data
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {selectedItemForDetail && (
                <SkuDetailModal
                    item={selectedItemForDetail}
                    onClose={() => setSelectedItemForDetail(null)}
                />
            )}
        </>
    );
}

export default ItemListView;