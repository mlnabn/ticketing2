import React, { useState, useEffect } from 'react';
import api from '../services/api';

function EditNamaBarangModal({ show, onClose, item, onSaveSuccess, showToast }) {
    const [namaBarang, setNamaBarang] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [currentItem, setCurrentItem] = useState(item);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    useEffect(() => {
        if (show) {
            setCurrentItem(item); 
            setShouldRender(true);
            setIsClosing(false); 
        } else if (shouldRender && !isClosing) {
            setIsClosing(true); 
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false); 
            }, 300); 
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, item, shouldRender]);

    useEffect(() => {
        if (currentItem) {
            setNamaBarang(currentItem.nama_barang || '');
        }
    }, [currentItem]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!namaBarang.trim()) {
            showToast('Nama barang tidak boleh kosong.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.post(`/inventory/items/${currentItem.id_m_barang}`, { nama_barang: namaBarang });
            showToast('Nama barang berhasil diubah.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal update nama barang:", error);
            showToast(error.response?.data?.message || 'Gagal menyimpan perubahan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    if (!shouldRender) return null;
    
    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`modal-overlay ${animationClass}`}
            onClick={handleCloseClick}
        >
            <div 
                className={`modal-content ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
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
                        <button type="button" onClick={handleCloseClick} className="btn-cancel">Batal</button>
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