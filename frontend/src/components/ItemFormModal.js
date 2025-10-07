import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';

const initialFormState = {
    id_kategori: '', id_sub_kategori: '', nama_barang: '', 
    kondisi: 'Baru',
    jumlah: 1, 
    harga_beli: '',
    warna: '',
    tanggal_pembelian: '', serial_numbers: [''],
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
        const count = parseInt(formData.jumlah, 10) || 0;
        const existingSerials = formData.serial_numbers || [];
        const newSerials = Array(count).fill('');

        for (let i = 0; i < Math.min(count, existingSerials.length); i++) {
            newSerials[i] = existingSerials[i];
        }
        
        setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
    }, [formData.jumlah]);

    const handleSerialChange = (index, value) => {
        const newSerials = [...formData.serial_numbers];
        newSerials[index] = value;
        setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
    };

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
        const filledSerials = formData.serial_numbers.filter(sn => sn !== '');
        if (new Set(filledSerials).size !== filledSerials.length) {
            showToast('Serial number yang diinput tidak boleh ada yang sama.', 'warning');
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
                    <div className="form-row2">
                        <div className="form-group half1">
                            <label>Nama Barang</label>
                            <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Kondisi Barang</label> {/* Ubah label */}
                        <select name="kondisi" value={formData.kondisi} onChange={handleChange}> {/* Ubah name */}
                            <option value="Baru">Baru</option>
                            <option value="Bekas">Bekas</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Warna (Opsional)</label>
                        <input type="text" name="warna" value={formData.warna} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Jumlah Ditambahkan</label>
                            <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} required />
                        </div>
                        <div className="form-group half">
                            <label>Harga Beli (Rp)</label> {/* Ubah label */}
                            <input type="number" name="harga_beli" value={formData.harga_beli} onChange={handleChange} required /> {/* Ubah name */}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Serial Number (Opsional)</label>
                        <div className="serial-number-container">
                            {formData.serial_numbers.map((sn, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Serial Number #${index + 1}`}
                                    value={sn}
                                    onChange={(e) => handleSerialChange(index, e.target.value)}
                                    className="serial-number-input"
                                />
                            ))}
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