import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ActiveLoanDetailModal({ show, item, onClose, formatDate, calculateDuration }) {
    const [fullDetail, setFullDetail] = useState(null);
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
        if (show && item?.kode_unik) {
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
    }, [show, item]);

    if (!shouldRender) return null;
    if (!currentItem) return null;
    const animationClass = isClosing ? 'closing' : '';
    const duration = calculateDuration(currentItem.tanggal_keluar);

    return (
        <div 
            className={`modal-backdrop-detail ${animationClass}`}
            onClick={onClose}
        >
            <div 
                className={`modal-content-detail ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-detail">
                    <h3><strong>Detail Peminjaman: </strong>{currentItem.kode_unik}</h3>
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
                                    <span className="value">{fullDetail.status_detail?.nama_status || '-'}</span>
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
                                    <span className="value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {fullDetail.deskripsi || '(Tidak ada keterangan)'}
                                    </span>
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