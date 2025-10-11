import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EditNamaBarangModal({ isOpen, onClose, item, onSaveSuccess, showToast }) {
    const [namaBarang, setNamaBarang] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setNamaBarang(item.nama_barang || '');
        }
    }, [item]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!namaBarang.trim()) {
            showToast('Nama barang tidak boleh kosong.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.post(`/inventory/items/${item.id_m_barang}`, { nama_barang: namaBarang });
            showToast('Nama barang berhasil diubah.', 'success');
            onSaveSuccess(); // Trigger refresh data
            onClose();
        } catch (error) {
            console.error("Gagal update nama barang:", error);
            showToast(error.response?.data?.message || 'Gagal menyimpan perubahan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Edit Nama Barang</h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="nama_barang">Nama Barang</label>
                        <input
                            id="nama_barang"
                            type="text"
                            value={namaBarang}
                            onChange={(e) => setNamaBarang(e.target.value)}
                            required
                        />
                    </div>
                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditNamaBarangModal;