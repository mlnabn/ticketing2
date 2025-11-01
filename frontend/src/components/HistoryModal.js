// src/components/HistoryModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function HistoryModal({ show, item, onClose, showToast, startDate, endDate }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item);

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
        if (show && currentItem?.id) {
            setIsLoading(true);
            const params = {
                start_date: startDate,
                end_date: endDate
            };

            api.get(`/inventory/stock-items/${currentItem.id}/history`, { params })
                .then(res => setHistory(res.data))
                .catch(err => showToast('Gagal memuat riwayat', 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [show, currentItem, showToast, startDate, endDate]);

    const formatLogTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    if (!shouldRender) return null;

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div className={`modal-backdrop-centered ${animationClass}`} onClick={handleCloseClick}>
            <div className={`modal-content-large ${animationClass}`} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={handleCloseClick} className="modal-close-btn">&times;</button>
                <h3>Riwayat Aset: {currentItem.master_barang?.nama_barang}</h3>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Kode Unik: <strong>{currentItem.kode_unik}</strong>
                </p>

                <div className="item-detail-bottom-section" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <p>Memuat riwayat...</p>
                    ) : history.length > 0 ? (
                        history.map(log => (
                            <div key={log.id} className="history-log-item">
                                <div className="info-row full-width" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #4A5568' }}>
                                    <span className="info-label" style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Dicatat pada: {formatLogTime(log.created_at)}</span>
                                </div>

                                {/* GRID DETAIL KEJADIAN */}
                                <div className="form-row2">
                                    <div className="info-row">
                                        <span className="info-label">Status</span>
                                        <span className="info-value-info" style={{ fontWeight: 'bold' }}>
                                            {log.status_detail?.nama_status || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Tanggal Kejadian</span>
                                        <span className="info-value-info">{formatEventDate(log.event_date)}</span>
                                    </div>
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
                    <button onClick={handleCloseClick} className="btn-cancel">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default HistoryModal;