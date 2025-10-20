import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function SkuDetailModal({ item, onClose }) {
    const [stockBreakdown, setStockBreakdown] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!item?.id_m_barang) return;
        setIsLoading(true);

        api.get(`/inventory/items/${item.id_m_barang}/stock-breakdown`)
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
    }, [item]);

    const totalOverallStock = useMemo(() => {
        if (!stockBreakdown || stockBreakdown.length === 0) return 0;
        return stockBreakdown.reduce((sum, currentItem) => sum + currentItem.total_stock, 0);
    }, [stockBreakdown]);

    if (!item) return null;

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Detail SKU: </strong>{item.master_kategori?.nama_kategori || item.nama_barang}</h3>
                </div>

                <div className="modal-body-detail">
                    <div className="detail-grid-section">
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Kode Barang (SKU)</span>
                            <span className="value">{item.kode_barang}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Kategori</span>
                            <span className="value">{item.master_kategori?.nama_kategori || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Sub-Kategori</span>
                            <span className="value">{item.sub_kategori?.nama_sub || '-'}</span>
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
                    <button onClick={onClose} className="btn-cancel">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default SkuDetailModal;