import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Select from 'react-select'; // Gunakan react-select standar untuk ini

const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === '') return '';
    return new Intl.NumberFormat('id-ID').format(angka);
};

const parseRupiah = (rupiah) => {
    if (typeof rupiah !== 'string') return rupiah;
    return parseInt(rupiah.replace(/\./g, ''), 10) || 0;
};

const initialFormState = {
    master_barang_id: null,
    jumlah: 1,
    harga_beli: '',
    kondisi: 'Baru',
    warna: '',
    tanggal_pembelian: '',
    tanggal_masuk: '',
    serial_numbers: [''],
};

function AddStockModal({ isOpen, onClose, onSaveSuccess, showToast }) {
    const [formData, setFormData] = useState(initialFormState);
    const [displayHarga, setDisplayHarga] = useState('');
    const [masterBarangOptions, setMasterBarangOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Ambil semua master barang untuk dropdown
            api.get('/inventory/items?all=true').then(res => { // Tambahkan param `all=true` di backend jika perlu
                const options = res.data.data.map(item => ({
                    value: item.id_m_barang,
                    label: `${item.nama_barang} (${item.kode_barang})`
                }));
                setMasterBarangOptions(options);
            });
            setDisplayHarga('');
        }
    }, [isOpen]);

    useEffect(() => {
        const count = parseInt(formData.jumlah, 10) || 0;
        const existingSerials = formData.serial_numbers || [];
        const newSerials = Array(count).fill('');
        for (let i = 0; i < Math.min(count, existingSerials.length); i++) {
            newSerials[i] = existingSerials[i];
        }
        setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
    }, [formData.jumlah]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'harga_beli') {
            const numericValue = parseRupiah(value);
            setFormData(prev => ({ ...prev, harga_beli: numericValue }));
            setDisplayHarga(formatRupiah(numericValue));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, master_barang_id: selectedOption ? selectedOption.value : null }));
    };

    const handleSerialChange = (index, value) => {
        const newSerials = [...formData.serial_numbers];
        newSerials[index] = value;
        setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/inventory/stock-items', formData);
            showToast('Stok baru berhasil ditambahkan.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menambah stok.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content user-form-modal large">
                <h3>Tambah Stok Barang</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Pilih Barang (SKU)</label>
                        <Select
                            options={masterBarangOptions}
                            onChange={handleSelectChange}
                            placeholder="Cari nama atau kode barang..."
                            isClearable
                        />
                    </div>
                    {/* Sisanya adalah form detail seperti di ItemFormModal */}
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Jumlah</label>
                            <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} min="1" required />
                        </div>
                        <div className="form-group half">
                            <label>Harga Beli Satuan (Rp)</label>
                            {/* 5. UBAH INPUT HARGA BELI */}
                            <input
                                type="text"
                                name="harga_beli"
                                value={displayHarga}
                                onChange={handleChange}
                                placeholder="Contoh: 1500000"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Kondisi</label>
                            <select name="kondisi" value={formData.kondisi} onChange={handleChange}>
                                <option value="Baru">Baru</option>
                                <option value="Bekas">Bekas</option>
                            </select>
                        </div>
                        <div className="form-group half">
                            <label>Warna</label>
                            <input type="text" name="warna" value={formData.warna} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Tanggal Pembelian</label>
                            <input type="date" name="tanggal_pembelian" value={formData.tanggal_pembelian} onChange={handleChange} />
                        </div>
                        <div className="form-group half">
                            <label>Tanggal Masuk</label>
                            <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Serial Number (Opsional)</label>
                        <div className="serial-number-container">
                            {formData.serial_numbers.map((sn, index) => (
                                <input key={index} type="text" placeholder={`S/N #${index + 1}`} value={sn} onChange={(e) => handleSerialChange(index, e.target.value)} className="serial-number-input" />
                            ))}
                        </div>
                    </div>
                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading}>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStockModal;