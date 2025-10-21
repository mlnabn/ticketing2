import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AcquisitionDetailModal({ item, onClose, formatCurrency, formatDate }) {
    const [fullDetail, setFullDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (item?.kode_unik) {
            setIsLoading(true);
            api.get(`/inventory/stock-items/by-serial/${item.kode_unik}`)
                .then(res => {
                    setFullDetail(res.data);
                })
                .catch(err => {
                    console.error("Gagal mengambil detail aset:", err);
                    setFullDetail(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [item]);

    const renderWarna = (color) => {
        if (!color) return '-';
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: color.kode_hex,
                    border: '1px solid #ccc',
                    borderRadius: '3px'
                }}></span>
                {color.nama_warna}
            </span>
        );
    };

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Detail Aset: </strong>{item.kode_unik}</h3>
                </div>

                <div className="modal-body-detail">
                    {isLoading ? (
                        <p className="value">Memuat detail aset...</p>
                    ) : !fullDetail ? (
                        <p className="value">Gagal memuat detail aset.</p>
                    ) : (
                        <>
                            <h4 className="detail-section-title">Informasi Aset</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Nama Barang</span>
                                    <span className="value">{fullDetail.master_barang?.nama_barang}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Kategori</span>
                                    <span className="value">{fullDetail.master_barang?.master_kategori?.nama_kategori || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Sub-Kategori</span>
                                    <span className="value">{fullDetail.master_barang?.sub_kategori?.nama_sub || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Serial Number (S/N)</span>
                                    <span className="value">{fullDetail.serial_number || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Warna</span>
                                    <span className="value">{renderWarna(fullDetail.color)}</span>
                                </div>
                            </div>
                            <h4 className="detail-section-title">Informasi Pembelian</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Nilai (Harga Beli)</span>
                                    <span className="value">{formatCurrency(parseFloat(fullDetail.harga_beli))}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Pembelian</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_pembelian)}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Kondisi Saat Beli</span>
                                    <span className="value">{fullDetail.kondisi}</span>
                                </div>
                            </div>
                            <h4 className="detail-section-title">Informasi Sistem</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Dicatat oleh Admin</span>
                                    <span className="value">{fullDetail.created_by?.name || 'N/A'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Masuk Stok</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_masuk)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer-user">
                    <button onClick={onClose} className="btn-cancel">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default AcquisitionDetailModal;