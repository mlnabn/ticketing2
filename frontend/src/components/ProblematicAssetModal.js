import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

function ProblematicAssetModal({ show, item, onClose, formatCurrency, formatDate }) {
    const [fullDetail, setFullDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item);
    const navigate = useNavigate();

    // Handle browser back button
    const handleClose = useModalBackHandler(show, onClose, 'problematic-asset');

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
        if (show && currentItem?.kode_unik) {
            setIsLoading(true);

            api.get(`/inventory/stock-items/by-serial/${currentItem.kode_unik}`)
                .then(res => {
                    setFullDetail(res.data);
                })
                .catch(err => {
                    console.error("Gagal mengambil detail aset bermasalah:", err);
                    setFullDetail(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [show, currentItem]);

    const handleCheckStockClick = () => {
        if (onClose) onClose();
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

    const getIncidentDetails = (detail) => {
        if (!detail) return { status: '-', date: '-', user: '-' };

        if (detail.status_detail?.nama_status === 'Rusak') {
            return {
                status: 'Rusak',
                date: formatDate(detail.tanggal_rusak),
                user: detail.user_perusak?.name || 'N/A'
            };
        }
        if (detail.status_detail?.nama_status === 'Hilang') {
            return {
                status: 'Hilang',
                date: formatDate(detail.tanggal_hilang),
                user: detail.user_penghilang?.name || 'N/A'
            };
        }

        return {
            status: detail.status_detail?.nama_status || '-',
            date: formatDate(detail.tanggal_rusak || detail.tanggal_hilang),
            user: detail.user_perusak?.name || detail.user_penghilang?.name || 'N/A'
        };
    };

    const incident = getIncidentDetails(fullDetail);

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div className={`modal-backdrop-detail ${animationClass}`}>
            <div className={`modal-content-detail ${animationClass}`}>
                <div className="modal-header-detail">
                    <h3><strong>Detail Kerugian: </strong>{currentItem.kode_unik}</h3>
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
                                    <span className="label">Serial Number (S/N)</span>
                                    <span className="value">{fullDetail.serial_number || '-'}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Aset Dibeli Tanggal</span>
                                    <span className="value">{formatDate(fullDetail.tanggal_pembelian)}</span>
                                </div>
                            </div>

                            <h4 className="detail-section-title">Informasi Kerugian</h4>
                            <div className="detail-grid-section">
                                <div className="detail-item-full">
                                    <span className="label">Status Kejadian</span>
                                    <span className="value">
                                        <span className={`status-badge status-${incident.status.toLowerCase()}`}>
                                            {incident.status}
                                        </span>
                                    </span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Nilai Kerugian (Harga Beli)</span>
                                    <span className="value" style={{ color: 'var(--red-color)', fontWeight: 'bold' }}>
                                        ({formatCurrency(parseFloat(fullDetail.harga_beli))})
                                    </span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">Tanggal Kejadian</span>
                                    <span className="value">{incident.date}</span>
                                </div>
                                <div className="detail-item-full">
                                    <span className="label">User Terkait Kejadian</span>
                                    <span className="value">{incident.user}</span>
                                </div>
                                <div className="detail-item-full" data-span="2">
                                    <span className="label">Keterangan / Kronologi</span>
                                    <p className="value" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {fullDetail.deskripsi || '(Tidak ada keterangan tambahan)'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-footer-user">
                    <button onClick={handleClose} className="btn-cancel" style={{ marginRight: '10px' }}>Tutup</button>
                    <button onClick={handleCheckStockClick} className="btn-confirm">Lihat di Stok</button>
                </div>
            </div>
        </div>
    );
}

export default ProblematicAssetModal;