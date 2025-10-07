import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';
import { useDebounce } from 'use-debounce';

const initialFormState = {
    id_kategori: '',
    id_sub_kategori: '',
    nama_barang: '',
    harga_barang: '', // Harga standar/awal untuk master barang
};

function ItemFormModal({ isOpen, onClose, onSave, itemToEdit, showToast }) {
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    // Debounce a pengecekan untuk menghindari panggilan API berlebihan
    const [debouncedNama] = useDebounce(formData.nama_barang, 500);
    const [debouncedSubKategori] = useDebounce(formData.id_sub_kategori, 500);


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
                setFormData({
                    ...initialFormState,
                    ...itemToEdit,
                    jumlah: itemToEdit.stok_tersedia || 0,
                    serial_numbers: [], // Pastikan serial_numbers adalah array kosong dalam mode edit
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

    useEffect(() => {
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
    }, [debouncedNama, debouncedSubKategori, showToast]);

    useEffect(() => {
        const count = parseInt(formData.jumlah, 10) || 0;
        const existingSerials = formData.serial_numbers || [];
        const newSerials = Array(count).fill('');

        for (let i = 0; i < Math.min(count, existingSerials.length); i++) {
            newSerials[i] = existingSerials[i];
        }
        
        setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
    }, [formData.jumlah]);

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
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                <h3>Daftarkan Tipe Barang Baru</h3>
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
                    <div className="form-group">
                        <label>Nama Barang</label>
                        <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} required />
                    </div>

                    {isExisting && (
                        <div className="info-box warning">
                            Barang ini sudah terdaftar. Anda tidak bisa mendaftarkannya lagi. 
                            Untuk menambah jumlahnya, gunakan fitur "Tambah Stok" di halaman Stok Barang.
                        </div>
                    )}

                    <div className="form-group">
                        <label>Harga Standar/Awal (Rp)</label>
                        <input type="number" name="harga_barang" value={formData.harga_barang} onChange={handleChange} 
                               disabled={isExisting} // <-- Dinonaktifkan jika sudah ada
                               required />
                    </div>

                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading || isExisting}>
                            {isExisting ? 'Sudah Terdaftar' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemFormModal;