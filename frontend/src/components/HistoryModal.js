// src/components/HistoryModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function HistoryModal({ item, onClose, showToast }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (item) {
            api.get(`/inventory/stock-items/${item.id}/history`)
                .then(res => setHistory(res.data))
                .catch(err => {
                    console.error("Gagal mengambil riwayat:", err);
                    showToast("Gagal memuat riwayat aset.", "error");
                })
                .finally(() => setIsLoading(false));
        }
    }, [item, showToast]);

    // Helper untuk format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="modal-backdrop-centered" onClick={onClose}>
            <div className="modal-content-large" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={onClose} className="modal-close-btn">&times;</button>
                <h3>Riwayat Aset: {item.master_barang?.nama_barang}</h3>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Kode Unik: <strong>{item.kode_unik}</strong>
                </p>

                <div className="item-detail-bottom-section" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <p>Memuat riwayat...</p>
                    ) : history.length > 0 ? (
                        history.map(log => (
                            <div key={log.id} className="history-log-item">
                                <div className="info-row full-width">
                                    <span className="info-label">{formatDate(log.created_at)}</span>
                                    <span className="info-value-info" style={{ fontWeight: 'bold', color: '#fff' }}>
                                        Status: {log.status_detail?.nama_status || 'N/A'}
                                    </span>
                                </div>
                                <div className="form-row2" style={{ marginTop: '10px' }}>
                                    <div className="info-row">
                                        <span className="info-label">Aksi oleh</span>
                                        <span className="info-value-info">{log.triggered_by_user?.name || 'Sistem'}</span>
                                    </div>
                                    {log.related_user && (
                                        <div className="info-row">
                                            <span className="info-label">Terkait</span>
                                            <span className="info-value-info">{log.related_user.name}</span>
                                        </div>
                                    )}
                                    {log.workshop && (
                                        <div className="info-row">
                                            <span className="info-label">Lokasi</span>
                                            <span className="info-value-info">{log.workshop.name}</span>
                                        </div>
                                    )}
                                    {log.deskripsi && (
                                        <div className="info-row full-width">
                                            <span className="info-label">Catatan</span>
                                            <span className="info-value-info" style={{ whiteSpace: 'pre-wrap' }}>{log.deskripsi}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Tidak ada riwayat untuk aset ini.</p>
                    )}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-confirm">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default HistoryModal;