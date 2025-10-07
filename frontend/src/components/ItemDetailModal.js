// src/components/ItemDetailModal.js
import React from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

function ItemDetailModal({ item, onClose }) {
    if (!item) return null;

    const detailList = {
        "Kode Unik": item.kode_unik,
        "Serial Number": item.serial_number || "N/A",
        "Nama Barang": item.master_barang?.nama_barang,
        "Kategori": item.master_barang?.master_kategori?.nama_kategori,
        "Sub-Kategori": item.master_barang?.sub_kategori?.nama_sub,
        "Kondisi": item.kondisi,
        "Harga Beli": `Rp ${Number(item.harga_beli).toLocaleString('id-ID')}`,
        "Tanggal Pembelian": item.tanggal_pembelian ? new Date(item.tanggal_pembelian).toLocaleDateString('id-ID') : '-',
        "Tanggal Masuk Gudang": new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
        "Status Stok": item.status,
        "Tanggal Keluar": item.tanggal_keluar ? new Date(item.tanggal_keluar).toLocaleDateString('id-ID') : 'Masih di gudang',
    };

    return (
        <div className="modal-backdrop-centered" onClick={onClose}>
            <div className="modal-content-large" onClick={e => e.stopPropagation()}>
                <h3>Detail Aset: {item.master_barang?.nama_barang}</h3>
                <div className="item-detail-container">
                    <div className="item-detail-qr">
                        <QRCode value={item.kode_unik} size={180} level="H" />
                        <strong>{item.kode_unik}</strong>
                    </div>
                    <div className="item-detail-info">
                        {Object.entries(detailList).map(([label, value]) => (
                            <div key={label} className="info-row">
                                <span className="info-label">{label}</span>
                                <span className="info-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-confirm-centered">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default ItemDetailModal;