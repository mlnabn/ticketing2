import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

function SkuDetailModal({ show, item, onClose }) {
    const [stockBreakdown, setStockBreakdown] = useState([]);
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
                setStockBreakdown(response.data);
            })
            .catch(error => {
                console.error("Gagal mengambil rincian stok:", error);
                setStockBreakdown([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentItem]);

    const totalOverallStock = useMemo(() => {
        if (!stockBreakdown || stockBreakdown.length === 0) return 0;
        return stockBreakdown.reduce((sum, currentItem) => sum + currentItem.total_stock, 0);
    }, [stockBreakdown]);

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
                    <h3><strong>Detail Tipe Barang: </strong>{currentItem.master_kategori?.nama_kategori || currentItem.nama_barang}</h3>
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

                    {/* Tampilan baru untuk rincian stok */}
                    <div className="detail-item-full" data-span="2">
                        {/* <span className="label">Detail Stok Tersedia</span> */}
                        {isLoading ? (
                            <p className="value">Memuat data stok...</p>
                        ) : (
                            <div className="stock-detail-container">
                                <p className="value" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>
                                    Total Keseluruhan Stok Tersedia: {totalOverallStock} unit
                                </p>
                                {stockBreakdown.length > 0 ? (
                                    stockBreakdown.map((stockItem, index) => (
                                        <div key={index} className="stock-item-group">
                                            <h4><strong>{stockItem.item_name}</strong>: {stockItem.total_stock} unit</h4>
                                            <ul className="borrowed-items-list nested" style={{ marginBottom: '10px' }}>
                                                {stockItem.colors.map((color, colorIndex) => (
                                                    <li key={colorIndex}>
                                                        <span>{color.color_name}</span>
                                                        <span className="tool-quantity">({color.count} unit)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="value">Tidak ada rincian stok yang tersedia untuk SKU ini.</p>
                                )}
                            </div>
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