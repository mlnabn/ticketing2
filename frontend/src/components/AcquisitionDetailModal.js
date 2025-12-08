import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AcquisitionDetailModal({ show, item, onClose, formatCurrency, formatDate }) {
    const [fullDetail, setFullDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item); 
    const navigate = useNavigate();

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

    const handleCheckStockClick = () => {
        onClose();
        const searchTerm = currentItem?.kode_unik || fullDetail?.kode_unik;

        if (searchTerm) {
            navigate('/admin/stock', {
                state: {
                    initialSearchTerm: searchTerm
                },
            });
        }
    };

    if (!shouldRender) return null;

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

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div className={`modal-backdrop-detail ${animationClass}`}>
            <div className={`modal-content-detail ${animationClass}`}>
                <div className="modal-header-detail">
                    <h3><strong>Detail Aset: </strong>{currentItem.kode_unik}</h3>
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
                                    <span className="label">Kondisi Saat Beli</span>
                                    <span className="value">{fullDetail.kondisi}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Pembelian</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_pembelian)}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Masuk Stok</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_masuk)}</span>
                                </div>
                            </div>
                            <h4 className="detail-section-title">Informasi Sistem</h4>
                            <div className="detail-item-full">
                                <span className="label">Dicatat oleh Admin</span>
                                <span className="value">{fullDetail.created_by?.name || 'N/A'}</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer-user">
                    <button onClick={onClose} className="btn-cancel" style={{ marginRight: '10px' }}>Tutup</button>
                    <button onClick={handleCheckStockClick} className="btn-confirm">Lihat di Stok</button>
                </div>
            </div>
        </div>
    );
}

export default AcquisitionDetailModal;