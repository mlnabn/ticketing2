import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NON_AKTIF_STATUS_ID = 7; 

export default function DeleteStockItemModal({ show, item, onClose, onSaveSuccess, showToast, statusOptions }) {
    const [alasan, setAlasan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    useEffect(() => {
        if (show) {
            setShouldRender(true);
            setIsClosing(false);
            setAlasan('');
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
            }, 300); // Durasi animasi CSS
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, shouldRender]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!alasan) {
            showToast('Alasan penghapusan (Non-Aktif) wajib diisi.', 'warning');
            return;
        }
        setIsLoading(true);

        const statusNonAktif = statusOptions.find(s => s.id === NON_AKTIF_STATUS_ID);
        if (!statusNonAktif) {
             showToast('Error: Status "Non-Aktif" tidak ditemukan. Hubungi administrator.', 'error');
             setIsLoading(false);
             return;
        }

        try {
            await api.post(`/inventory/stock-items/${item.id}/update-status`, {
                status_id: NON_AKTIF_STATUS_ID,
                deskripsi: alasan,
            });
            showToast(`Barang ${item.kode_unik} berhasil di-nonaktifkan.`, 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menonaktifkan barang.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!shouldRender || !item) return null;
    const animationClass = isClosing ? 'closing' : '';

    return (
        <div className={`confirmation-modal-backdrop ${animationClass}`} onClick={onClose}>
            <div className={`modal-content-large user-form-modal ${animationClass}`} onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3>Non-Aktifkan Barang</h3>
                    <p>Anda akan menonaktifkan barang: <strong>{item.master_barang.nama_barang} ({item.kode_unik})</strong>. Stok ini tidak akan dihitung sebagai aset aktif. Tindakan ini akan dicatat dalam riwayat.</p>
                    
                    <div className="form-group-recover" style={{textAlign: 'left'}}>
                        <label htmlFor="alasan">Alasan Penghapusan (Wajib)</label>
                        <textarea
                            id="alasan"
                            rows="4"
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            placeholder="Contoh: Barang rusak berat dan tidak bisa diperbaiki, dihapus dari aset."
                        />
                    </div>
                    
                    <div className="confirmation-modal-actions">
                        <button type_button="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
                            Batal
                        </button>
                        <button type="submit" className="btn-confirm" disabled={isLoading || !alasan}>
                            {isLoading ? 'Menyimpan...' : 'Ya, Non-Aktifkan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}