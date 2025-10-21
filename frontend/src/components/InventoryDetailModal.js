import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Pastikan path ini benar

// Ambil helper format dari komponen induk
function InventoryDetailModal({ kodeUnik, onClose, formatDate, formatCurrency }) {
    const [fullDetail, setFullDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (kodeUnik) {
            setIsLoading(true);
            api.get(`/inventory/stock-items/by-serial/${kodeUnik}`)
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
    }, [kodeUnik]);

    // Helper untuk menampilkan warna
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

    // Helper untuk menampilkan info dinamis berdasarkan status
    const renderDynamicInfo = (detail) => {
        const status = detail.status_detail?.nama_status;

        switch (status) {
            case 'Dipinjam':
            case 'Digunakan':
                return (
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Status Saat Ini</span>
                            <span className="value">
                                <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
                            </span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Peminjam</span>
                            <span className="value">{detail.user_peminjam?.name || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Lokasi/Workshop</span>
                            <span className="value">{detail.workshop?.name || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Tanggal Keluar</span>
                            <span className="value">{formatDate(detail.tanggal_keluar)}</span>
                        </div>
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Keperluan / Deskripsi</span>
                            <p className="value">{detail.deskripsi || '-'}</p>
                        </div>
                    </div>
                );
            case 'Rusak':
                return (
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Status Saat Ini</span>
                            <span className="value">
                                <span className={`status-badge status-rusak`}>Rusak</span>
                            </span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">User Terkait</span>
                            <span className="value">{detail.user_perusak?.name || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Tanggal Rusak</span>
                            <span className="value">{formatDate(detail.tanggal_rusak)}</span>
                        </div>
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Keterangan</span>
                            <p className="value">{detail.deskripsi || '-'}</p>
                        </div>
                    </div>
                );
            case 'Hilang':
                return (
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Status Saat Ini</span>
                            <span className="value">
                                <span className={`status-badge status-hilang`}>Hilang</span>
                            </span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">User Terkait</span>
                            <span className="value">{detail.user_penghilang?.name || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Tanggal Hilang</span>
                            <span className="value">{formatDate(detail.tanggal_hilang)}</span>
                        </div>
                        <div className="detail-item-full" data-span="2">
                            <span className="label">Keterangan</span>
                            <p className="value">{detail.deskripsi || '-'}</p>
                        </div>
                    </div>
                );
            case 'Tersedia':
            default:
                return (
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Status Saat Ini</span>
                            <span className="value">
                                <span className={`status-badge status-tersedia`}>Tersedia</span>
                            </span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Tanggal Masuk Stok</span>
                            <span className="value">{formatDate(detail.tanggal_masuk)}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Dicatat oleh</span>
                            <span className="value">{detail.created_by?.name || '-'}</span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Detail Aset: </strong>{kodeUnik}</h3>
                </div>

                <div className="modal-body-detail">
                    {isLoading ? (
                        <p className="value">Memuat detail aset...</p>
                    ) : !fullDetail ? (
                        <p className="value">Gagal memuat detail aset.</p>
                    ) : (
                        <>
                            {/* Bagian 1: Info Umum (Selalu tampil) */}
                            <h4 className="detail-section-title">Informasi Umum Aset</h4>
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
                                    <span className="label">Serial Number (S/N)</span>
                                    <span className="value">{fullDetail.serial_number || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Warna</span>
                                    <span className="value">{renderWarna(fullDetail.color)}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Harga Beli</span>
                                    <span className="value">{formatCurrency(parseFloat(fullDetail.harga_beli))}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Pembelian</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_pembelian)}</span>
                                </div>
                            </div>

                            {/* Bagian 2: Info Status (Dinamis) */}
                            <h4 className="detail-section-title">Informasi Status Terkini</h4>
                            {renderDynamicInfo(fullDetail)}
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

export default InventoryDetailModal;