import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from './Pagination';

function ItemListView({ items, pagination, loading, onBack, onAdd, onEdit, onDelete, onPageChange, onFilterChange }) {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');

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

    return (
        <>
            <div className="user-management-header">
                <button className="btn-primary" onClick={onAdd}>Daftarkan Barang Baru</button>
            </div>

            {/* --- Filter Section --- */}
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
            </div>

            <div className="job-list-container">
                {/* ======================================================= */}
                {/* ===    TAMPILAN TABEL UNTUK DESKTOP (TETAP SAMA)    === */}
                {/* ======================================================= */}
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Nama Barang</th>
                            <th>Kategori</th>
                            <th>Sub-Kategori</th>
                            <th>Didaftarkan Oleh</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data barang...</td></tr>
                        ) : items.length > 0 ? items.map(item => (
                            <tr key={item.id_m_barang}>
                                <td>{item.kode_barang}</td>
                                <td>{item.nama_barang}</td>
                                <td>{item.master_kategori?.nama_kategori || '-'}</td>
                                <td>{item.sub_kategori?.nama_sub || '-'}</td>
                                <td>{item.created_by?.name || 'N/A'}</td>
                                <td className="action-buttons-group">
                                    <button onClick={() => onEdit(item)} className="btn-user-action btn-edit">Edit</button>
                                    <button onClick={() => onDelete(item)} className="btn-user-action btn-delete">Hapus</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* ======================================================= */}
                {/* === TAMPILAN KARTU UNTUK MOBILE (TETAP SAMA) === */}
                {/* ======================================================= */}
                <div className="job-list-mobile">
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Memuat data barang...</p>
                    ) : items.length > 0 ? items.map(item => (
                        <div key={item.id_m_barang} className="ticket-card-mobile clickable-row">
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
                                <div className="card-separator"></div>
                                <div className="card-item-row">
                                    <span className="label">Didaftarkan Oleh:</span>
                                    <span className="value">{item.created_by?.name || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="card-separator"></div>
                            <div className="card-row action-row">
                                <button onClick={() => onEdit(item)} className="action-buttons-group btn-edit">Edit</button>
                                <button onClick={() => onDelete(item)} className="action-buttons-group btn-delete">Hapus</button>
                            </div>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center' }}>Belum ada tipe barang yang didaftarkan.</p>
                    )}
                </div>
            </div>
            {pagination && <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={(page) => onPageChange(page, { id_kategori: selectedCategory, id_sub_kategori: selectedSubCategory })}
            />}
        </>
    );
}

export default ItemListView;