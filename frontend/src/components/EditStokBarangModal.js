import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EditStokBarangModal({ isOpen, onClose, item, onSaveSuccess, showToast }) {
    const [formData, setFormData] = useState({
        serial_number: '', status: 'Tersedia', tanggal_pembelian: '',
        harga_beli: 0, kondisi: 'Baru', warna: '' 
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                serial_number: item.serial_number || '',
                status: item.status || 'Tersedia',
                tanggal_pembelian: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : '',
                harga_beli: item.harga_beli || 0,
                kondisi: item.kondisi || 'Baru',
                warna: item.warna || '' 
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                        <input type="number" name="harga_beli" value={formData.harga_beli} onChange={handleChange} required />
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
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Tersedia">Tersedia</option>
                            <option value="Dipinjam">Dipinjam</option>
                            <option value="Perbaikan">Perbaikan</option>
                            <option value="Rusak">Rusak</option>
                            <option value="Hilang">Hilang</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Tanggal Pembelian</label>
                        <input type="date" name="tanggal_pembelian" value={formData.tanggal_pembelian} onChange={handleChange} />
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