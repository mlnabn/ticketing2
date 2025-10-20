import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function SkuDetailModal({ item, onClose }) {
    const [stockByColor, setStockByColor] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!item?.id_m_barang) return;
        setIsLoading(true);
        api.get(`/inventory/items/${item.id_m_barang}/stock-by-color`)
            .then(response => {
                setStockByColor(response.data);
            })
            .catch(error => {
                console.error("Gagal mengambil data stok per warna:", error);
                setStockByColor([]);
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [item]);
    const totalStock = useMemo(() => {
        if (!stockByColor || stockByColor.length === 0) return 0;
        return stockByColor.reduce((sum, current) => sum + current.total, 0);
    }, [stockByColor]);


    if (!item) return null;

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Detail SKU: </strong>{item.nama_barang || 'N/A'}</h3>
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
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Didaftarkan Oleh</span>
                            <span className="value">{item.created_by?.name || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="detail-item-full" data-span="2">
                        <span className="label">Detail Stok Tersedia</span>
                        {isLoading ? (
                            <p className="value">Memuat data stok...</p>
                        ) : (
                            <div className="stock-detail-container">
                                <p className="value" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>
                                    Total Stok Tersedia: {totalStock} unit
                                </p>
                                {stockByColor.length > 0 ? (
                                    <ul className="borrowed-items-list">
                                        {stockByColor.map((variant, index) => (
                                            <li key={index}>
                                                <span className="tool-name">{variant.nama_warna}</span>
                                                <span className="tool-quantity">({variant.total} unit)</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="value">Tidak ada rincian stok per warna yang tersedia.</p>
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