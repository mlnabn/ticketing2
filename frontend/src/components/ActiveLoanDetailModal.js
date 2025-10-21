import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ActiveLoanDetailModal({ item, onClose, formatDate, calculateDuration }) {
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
    const duration = calculateDuration(item.tanggal_keluar);

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Detail Peminjaman: </strong>{item.kode_unik}</h3>
                </div>

                <div className="modal-body-detail">
                    {isLoading ? (
                        <p className="value">Memuat detail peminjaman...</p>
                    ) : !fullDetail ? (
                        <p className="value">Gagal memuat detail.</p>
                    ) : (
                        <>
                            <h4 className="detail-section-title">Informasi Aset</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Nama Barang</span>
                                    <span className="value">{fullDetail.master_barang?.nama_barang}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Serial Number (S/N)</span>
                                    <span className="value">{fullDetail.serial_number || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Kategori</span>
                                    <span className="value">{fullDetail.master_barang?.master_kategori?.nama_kategori || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tgl Beli Aset</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_pembelian)}</span>
                                </div>
                            </div>
                            <h4 className="detail-section-title">Informasi Peminjaman</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Status</span>
                                    <span className="value">
                                        <span className={`status-badge status-${fullDetail.status_detail?.nama_status.toLowerCase()}`}>
                                            {fullDetail.status_detail?.nama_status}
                                        </span>
                                    </span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Peminjam</span>
                                    <span className="value">{fullDetail.user_peminjam?.name || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Lokasi/Workshop</span>
                                    <span className="value">{fullDetail.workshop?.name || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Pinjam</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_keluar)}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Durasi Peminjaman</span>
                                    <span className="value" style={{ fontWeight: 'bold' }}>{duration.text}</span>
                                </div>
                                {/* <div className="detail-item-full">
                                    <span className="label">Terkait Tiket No.</span>
                                    <span className="value">{fullDetail.ticket_id || '-'}</span>
                                </div> */}
                                <div className="detail-item-full" data-span="2">
                                    <span className="label">Keperluan / Deskripsi</span>
                                    <p className="value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {fullDetail.deskripsi || '(Tidak ada keterangan)'}
                                    </p>
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

export default ActiveLoanDetailModal;