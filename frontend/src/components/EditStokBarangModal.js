import React, { useState, useEffect } from 'react';
import api from '../services/api';

const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === '') return '';
    return new Intl.NumberFormat('id-ID').format(angka);
};

const parseRupiah = (rupiah) => {
    if (typeof rupiah !== 'string') return rupiah;
    return parseInt(rupiah.replace(/\./g, ''), 10) || 0;
};

function EditStokBarangModal({ isOpen, onClose, item, onSaveSuccess, showToast }) {
    const [formData, setFormData] = useState({
        serial_number: '', 
        status_id: 'Tersedia', 
        tanggal_pembelian: '',
        tanggal_masuk: '',
        harga_beli: 0, 
        kondisi: 'Baru',
        warna: ''
    });
    const [displayHarga, setDisplayHarga] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        if (isOpen) {
            api.get('/statuses').then(res => setStatusOptions(res.data));
        }
    }, [isOpen]);

    useEffect(() => {
        if (item) {
            setFormData({
                serial_number: item.serial_number || '',
                status_id: item.status_id || 'Tersedia',
                tanggal_pembelian: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : '',
                harga_beli: item.harga_beli || 0,
                kondisi: item.kondisi || 'Baru',
                warna: item.warna || ''
            });
            setDisplayHarga(formatRupiah(item.harga_beli));
        }
    }, [item, isOpen]);

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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post(`/inventory/stock-items/${item.id}`, formData);
            showToast('Detail stok berhasil diubah.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal update stok:", error);
            showToast(error.response?.data?.message || 'Gagal menyimpan perubahan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content user-form-modal">
                <h3>Edit Detail Stok: {item.kode_unik}</h3>
                <p>{item.master_barang?.nama_barang}</p>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Serial Number</label>
                        <input name="serial_number" value={formData.serial_number} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Harga Beli (Rp)</label>
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
                    <div className="form-group">
                        <label>Warna</label>
                        <input type="text" name="warna" value={formData.warna} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Kondisi Barang</label>
                        <select name="kondisi" value={formData.kondisi} onChange={handleChange}>
                            <option value="Baru">Baru</option>
                            <option value="Bekas">Bekas</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status Stok</label>
                        <select name="status_id" value={formData.status_id} onChange={handleChange}>
                            <option value="">Pilih Status</option>
                            {statusOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.nama_status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group half1">
                            <label>Tanggal Pembelian</label>
                            <input type="date" name="tanggal_pembelian" value={formData.tanggal_pembelian} onChange={handleChange} />
                        </div>
                        <div className="form-group half">
                            <label>Tanggal Masuk</label>
                            <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} />
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

export default EditStokBarangModal;