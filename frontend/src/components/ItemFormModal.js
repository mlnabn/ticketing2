import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';

const initialFormState = {
    id_kategori: '',
    id_sub_kategori: '',
    nama_barang: '',
    merk: '',
    model_barang: '',
    tanggal_pembelian: '',
    tanggal_masuk: '',
    digunakan_untuk: '',
    stok: 0,
    harga_barang: '',
    warna: '',
};

function ItemFormModal({ isOpen, onClose, onSave, itemToEdit, showToast }) {
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch master data untuk dropdown
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
                // Jika edit, pre-fill data
                setFormData({
                    id_kategori: itemToEdit.id_kategori || '',
                    id_sub_kategori: itemToEdit.id_sub_kategori || '',
                    nama_barang: itemToEdit.nama_barang || '',
                    merk: itemToEdit.merk || '',
                    model_barang: itemToEdit.model_barang || '',
                    tanggal_pembelian: itemToEdit.tanggal_pembelian || '',
                    tanggal_masuk: itemToEdit.tanggal_masuk || '',
                    digunakan_untuk: itemToEdit.digunakan_untuk || '',
                    stok: itemToEdit.stok || 0,
                    harga_barang: itemToEdit.harga_barang || '',
                    warna: itemToEdit.warna || '',
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [itemToEdit, isOpen, fetchCategories]);

    // Fetch sub-kategori ketika kategori berubah
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

    const handleCreateOption = async (inputValue, type) => {
        setIsLoading(true);
        try {
            if (type === 'category') {
                const res = await api.post('/inventory/categories', { nama_kategori: inputValue, kode_kategori: inputValue.substring(0, 3).toUpperCase() });
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (newValue, actionMeta) => {
        setFormData(prev => ({ ...prev, [actionMeta.name]: newValue ? newValue.value : '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama_barang || !formData.id_kategori || !formData.id_sub_kategori) {
            showToast('Nama Barang, Kategori, dan Sub-Kategori wajib diisi.', 'warning');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content user-form-modal large">
                <h3>{itemToEdit ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                <form onSubmit={handleSubmit}>

                    <div className="form-row2">
                        <div className="form-group half">
                            <label>Kategori</label>
                            <CreatableSelect
                                classNamePrefix="creatable-select" // <-- TAMBAHKAN INI
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
                                classNamePrefix="creatable-select" // <-- TAMBAHKAN INI JUGA
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
                    {/* Baris 2: Nama & Merk */}
                    <div className="form-row2">
                        <div className="form-group half1">
                            <label>Nama Barang</label>
                            <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} required />
                        </div>
                        <div className="form-group half">
                            <label>Merk</label>
                            <input name="merk" value={formData.merk} onChange={handleChange} />
                        </div>
                    </div>
                    {/* Baris 3: Stok & Harga */}
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Stok</label>
                            <input type="number" name="stok" value={formData.stok} onChange={handleChange} required />
                        </div>
                        <div className="form-group half">
                            <label>Harga Barang (Rp)</label>
                            <input type="number" name="harga_barang" value={formData.harga_barang} onChange={handleChange} />
                        </div>
                    </div>
                    {/* ... tambahkan input lain sesuai kebutuhan (tanggal, warna, dll) ... */}
                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading}>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemFormModal;