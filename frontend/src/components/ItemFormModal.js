import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';
import { useDebounce } from 'use-debounce';

// Helper functions (letakkan di luar komponen)
const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === '') return '';
    return new Intl.NumberFormat('id-ID').format(angka);
};

const parseRupiah = (rupiah) => {
    if (typeof rupiah !== 'string') return rupiah;
    return parseInt(rupiah.replace(/\./g, ''), 10) || 0;
};

const initialFormState = {
    id_kategori: '',
    id_sub_kategori: '',
    nama_barang: '',
    harga_barang: '', // Hanya menggunakan harga_barang
};

function ItemFormModal({ isOpen, onClose, onSave, itemToEdit, showToast }) {
    const [formData, setFormData] = useState(initialFormState);
    // HANYA state display untuk harga_barang
    const [displayHargaBarang, setDisplayHargaBarang] = useState('');
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    const [debouncedNama] = useDebounce(formData.nama_barang, 500);
    const [debouncedSubKategori] = useDebounce(formData.id_sub_kategori, 500);

    const fetchCategories = useCallback(() => {
        api.get('/inventory/categories').then(res => {
            const options = res.data.map(c => ({ value: c.id_kategori, label: c.nama_kategori }));
            setCategories(options);
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (itemToEdit) {
                setFormData({
                    ...initialFormState,
                    ...itemToEdit,
                });
                // Sesuaikan untuk mengisi displayHargaBarang dari itemToEdit
                setDisplayHargaBarang(formatRupiah(itemToEdit.harga_barang));
            } else {
                // Reset semua state saat form tambah baru
                setFormData(initialFormState);
                setDisplayHargaBarang('');
                setIsExisting(false);
            }
        }
    }, [itemToEdit, isOpen, fetchCategories]);

    useEffect(() => {
        if (formData.id_kategori) {
            api.get(`/inventory/sub-categories?id_kategori=${formData.id_kategori}`).then(res => {
                const options = res.data.map(s => ({ value: s.id_sub_kategori, label: s.nama_sub }));
                setSubCategories(options);
            });
        } else {
            setSubCategories([]);
        }
    }, [formData.id_kategori]);

    useEffect(() => {
        // Jangan cek jika sedang mode edit
        if (itemToEdit) return;

        if (debouncedNama && debouncedSubKategori) {
            api.post('/inventory/items/check-exists', {
                nama_barang: debouncedNama,
                id_sub_kategori: debouncedSubKategori,
            }).then(res => {
                setIsExisting(res.data.exists);
                if (res.data.exists) {
                    showToast('Tipe barang ini sudah terdaftar.', 'info');
                }
            });
        } else {
            setIsExisting(false);
        }
    }, [debouncedNama, debouncedSubKategori, showToast, itemToEdit]);

    const handleCreateOption = async (inputValue, type) => {
        // ... (Fungsi ini tidak perlu diubah)
        setIsLoading(true);
        try {
            if (type === 'category') {
                const res = await api.post('/inventory/categories', { nama_kategori: inputValue });
                const newOption = { value: res.data.id_kategori, label: res.data.nama_kategori };
                setCategories(prev => [...prev, newOption]);
                setFormData(prev => ({ ...prev, id_kategori: res.data.id_kategori }));
            } else if (type === 'subcategory') {
                if (!formData.id_kategori) {
                    showToast('Pilih kategori terlebih dahulu!', 'warning');
                    return;
                }
                const res = await api.post('/inventory/sub-categories', { nama_sub: inputValue, id_kategori: formData.id_kategori });
                const newOption = { value: res.data.id_sub_kategori, label: res.data.nama_sub };
                setSubCategories(prev => [...prev, newOption]);
                setFormData(prev => ({ ...prev, id_sub_kategori: res.data.id_sub_kategori }));
            }
        } catch (error) {
            showToast('Gagal membuat entri baru.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Logika disederhanakan hanya untuk harga_barang
        if (name === 'harga_barang') {
            const numericValue = parseRupiah(value);
            setFormData(prev => ({ ...prev, harga_barang: numericValue }));
            setDisplayHargaBarang(formatRupiah(numericValue));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (newValue, actionMeta) => {
        setFormData(prev => ({ ...prev, [actionMeta.name]: newValue ? newValue.value : '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content user-form-modal">
                <h3>{itemToEdit ? 'Edit Tipe Barang' : 'Daftarkan Tipe Barang Baru'}</h3>
                <form onSubmit={handleSubmit}>
                    {/* ... (Input Kategori & Sub-Kategori tetap sama) ... */}
                    <div className="form-row2">
                        <div className="form-group half">
                            <label>Kategori</label>
                            <CreatableSelect
                                classNamePrefix="creatable-select"
                                isClearable
                                isDisabled={isLoading}
                                isLoading={isLoading}
                                options={categories}
                                value={categories.find(c => c.value === formData.id_kategori)}
                                onChange={handleSelectChange}
                                onCreateOption={(val) => handleCreateOption(val, 'category')}
                                name="id_kategori"
                                placeholder="Pilih atau ketik kategori baru..."
                            />

                            <label>Sub-Kategori</label>
                            <CreatableSelect
                                classNamePrefix="creatable-select"
                                isClearable
                                isDisabled={isLoading || !formData.id_kategori}
                                isLoading={isLoading}
                                options={subCategories}
                                value={subCategories.find(s => s.value === formData.id_sub_kategori)}
                                onChange={handleSelectChange}
                                onCreateOption={(val) => handleCreateOption(val, 'subcategory')}
                                name="id_sub_kategori"
                                placeholder="Pilih atau ketik sub-kategori..."
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nama Barang</label>
                        <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} required disabled={!!itemToEdit} />
                    </div>

                    {isExisting && !itemToEdit && (
                        <div className="info-box warning">
                            Barang ini sudah terdaftar. Anda tidak bisa mendaftarkannya lagi. Tambahkan di Menu Stok Barang.
                        </div>
                    )}

                    <div className="form-group">
                        <label>Harga Standar/Awal (Rp)</label>
                        <input
                            type="text"
                            name="harga_barang"
                            value={displayHargaBarang}
                            onChange={handleChange}
                            disabled={isExisting}
                            required
                            placeholder="Contoh: 2500000"
                        />
                    </div>

                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading || (isExisting && !itemToEdit)}>
                            {isExisting && !itemToEdit ? 'Sudah Terdaftar' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemFormModal;