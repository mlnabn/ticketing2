import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';
import { useDebounce } from 'use-debounce';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

const initialFormState = {
    id_kategori: '',
    id_sub_kategori: '',
    nama_barang: '',
};

function ItemFormModal({ show, isOpen, onClose, onSaveRequest, itemToEdit, showToast, initialData = {} }) {
    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    const [debouncedNama] = useDebounce(formData.nama_barang, 500);
    const [debouncedSubKategori] = useDebounce(formData.id_sub_kategori, 500);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const initialDataString = JSON.stringify(initialData);

    // Handle browser back button
    const handleClose = useModalBackHandler(show, onClose, 'item-form');

    useEffect(() => {
        if (show) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
                setFormData(initialFormState);
                setIsExisting(false);
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, shouldRender]);

    const fetchCategories = useCallback(() => {
        api.get('/inventory/categories').then(res => {
            const options = res.data.map(c => ({ value: c.id_kategori, label: c.nama_kategori }));
            setCategories(options);
        });
    }, []);

    useEffect(() => {
        if (show) {
            fetchCategories();
            if (itemToEdit) {
                setFormData({
                    ...initialFormState,
                    ...itemToEdit,
                });
            } else {
                setFormData({ ...initialFormState, ...initialData });
                setIsExisting(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemToEdit, show, fetchCategories, initialDataString]);

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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (newValue, actionMeta) => {
        setFormData(prev => ({ ...prev, [actionMeta.name]: newValue ? newValue.value : '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSaveRequest) {
            onSaveRequest(formData, 'save');
        }
    };



    if (!shouldRender) return null;

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-backdrop-centered ${animationClass}`}
            onClick={handleClose}
        >
            <div
                className={`modal-content-large ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <h3>{itemToEdit ? 'Edit Tipe Barang' : 'Daftarkan Tipe Barang Baru'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-row-split">
                        <div className="form-group">
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
                                placeholder="Pilih / ketik kategori..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Sub-Kategori / Merk</label>
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
                                placeholder="Pilih / ketik sub-kategori / merk..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nama Barang</label>
                        <input
                            name="nama_barang"
                            value={formData.nama_barang}
                            onChange={handleChange}
                            required
                            disabled={!!itemToEdit}
                            placeholder="Contoh: Laptop Asus ROG"
                        />
                    </div>

                    {isExisting && !itemToEdit && (
                        <div className="info-box warning">
                            Barang ini sudah terdaftar. Anda tidak bisa mendaftarkannya lagi.
                        </div>
                    )}

                    <div className="modal-footer-user" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button type="button" onClick={handleClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading || (isExisting && !itemToEdit)}>
                            {isExisting && !itemToEdit ? 'Sudah Terdaftar' : 'Simpan'}
                        </button>
                        {!itemToEdit && (
                            <button
                                type="button"
                                onClick={() => onSaveRequest(formData, 'saveAndAddStock')}
                                className="btn-history"
                                disabled={isLoading || (isExisting && !itemToEdit)}
                            >
                                Tambah Stok
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemFormModal;