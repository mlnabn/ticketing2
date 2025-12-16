import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

function SkuDetailModal({ show, item, onClose }) {
    const [stockData, setStockData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item);
    const navigate = useNavigate();

    // Handle browser back button
    const handleClose = useModalBackHandler(show, onClose, 'sku-detail');

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
        if (!currentItem?.id_m_barang) return;
        setIsLoading(true);

        api.get(`/inventory/items/${currentItem.id_m_barang}/stock-breakdown`)
            .then(response => {
                setStockData(response.data);
            })
            .catch(error => {
                console.error("Gagal mengambil rincian stok:", error);
                setStockData(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentItem]);

    const handleCheckStockClick = () => {
        if (onClose) onClose();
        if (item) {
            navigate('/admin/stock', {
                state: {
                    initialSearchTerm: item.nama_barang
                },
            });
        }
    };

    // Helper function to get status badge class based on badge color
    const getStatusBadgeClass = (badgeColor) => {
        const colorMap = {
            'green': 'status-tersedia',
            'blue': 'status-digunakan',
            'purple': 'status-dipinjam',
            'orange': 'status-perbaikan',
            'red': 'status-rusak',
            'black': 'status-hilang',
        };
        return colorMap[badgeColor] || 'status-default';
    };

    // Render a status section with color breakdown
    const renderStatusSection = (statusData) => {
        return (
            <div key={statusData.status_name} className="status-breakdown-item">
                <div className="status-header-row">
                    <span className={`status-badge ${getStatusBadgeClass(statusData.status_badge)}`}>
                        {statusData.status_name}
                    </span>
                    <span className="status-total">{statusData.total} unit</span>
                </div>
                {statusData.colors && statusData.colors.length > 0 && (
                    <ul className="borrowed-items-list nested" style={{ marginTop: '8px', marginBottom: '0' }}>
                        {statusData.colors.map((color, colorIndex) => (
                            <li key={colorIndex}>
                                <span>{color.color_name}</span>
                                <span className="tool-quantity">({color.count} unit)</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    if (!shouldRender) return null;
    if (!currentItem) return null;

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-backdrop-detail ${animationClass}`}
            onClick={handleClose}
        >
            <div
                className={`modal-content-detail ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-detail">
                    <h3><strong>Detail Tipe Barang: </strong>{currentItem.nama_barang}</h3>
                </div>

                <div className="modal-body-detail">
                    <div className="detail-grid-section">
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Kode Unik</span>
                            <span className="value">{currentItem.kode_barang}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Kategori</span>
                            <span className="value">{currentItem.master_kategori?.nama_kategori || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Sub-Kategori/Merk</span>
                            <span className="value">{currentItem.sub_kategori?.nama_sub || '-'}</span>
                        </div>
                    </div>

                    {/* Rincian Stok berdasarkan Status */}
                    <div className="detail-item-full" data-span="2">
                        {isLoading ? (
                            <p className="value">Memuat data stok...</p>
                        ) : stockData ? (
                            <div className="stock-detail-container">
                                {/* Summary Section */}
                                <div className="stock-summary-section" style={{ marginBottom: '16px' }}>
                                    <p className="value" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                                        Total Keseluruhan Unit: {stockData.total_all} unit
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            <strong style={{ color: '#22c55e' }}>Aktif:</strong> {stockData.total_active} unit
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            <strong style={{ color: '#ef4444' }}>Non-Aktif:</strong> {stockData.total_inactive} unit
                                        </span>
                                    </div>
                                </div>

                                {/* Active Statuses Section */}
                                {stockData.active_statuses && stockData.active_statuses.length > 0 && (
                                    <div className="status-section" style={{ marginBottom: '16px' }}>
                                        <h4 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            marginBottom: '12px',
                                            color: '#22c55e',
                                            borderBottom: '1px solid var(--border-color)',
                                            paddingBottom: '8px'
                                        }}>
                                            Barang Aktif
                                        </h4>
                                        <div className="status-breakdown-list">
                                            {stockData.active_statuses.map(renderStatusSection)}
                                        </div>
                                    </div>
                                )}

                                {/* Inactive Statuses Section */}
                                {stockData.inactive_statuses && stockData.inactive_statuses.length > 0 && (
                                    <div className="status-section">
                                        <h4 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            marginBottom: '12px',
                                            color: '#ef4444',
                                            borderBottom: '1px solid var(--border-color)',
                                            paddingBottom: '8px'
                                        }}>
                                            Barang Non-Aktif
                                        </h4>
                                        <div className="status-breakdown-list">
                                            {stockData.inactive_statuses.map(renderStatusSection)}
                                        </div>
                                    </div>
                                )}

                                {/* No data message */}
                                {(!stockData.active_statuses || stockData.active_statuses.length === 0) &&
                                    (!stockData.inactive_statuses || stockData.inactive_statuses.length === 0) && (
                                        <p className="value">Tidak ada data stok untuk SKU ini.</p>
                                    )}
                            </div>
                        ) : (
                            <p className="value">Tidak ada rincian stok yang tersedia untuk SKU ini.</p>
                        )}
                    </div>
                </div>

                <div className="modal-footer-user">
                    <button onClick={handleClose} className="btn-cancel" style={{ marginRight: '10px' }}>Tutup</button>
                    <button onClick={handleCheckStockClick} className="btn-confirm">Detail Unit</button>
                </div>
            </div>
        </div>
    );
}

export default SkuDetailModal;