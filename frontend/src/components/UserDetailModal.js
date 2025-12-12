import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../services/api';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

const formatSimpleDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return format(new Date(dateTimeString), 'dd MMMM yyyy', { locale: id });
};

function UserDetailModal({ show, user, onClose, onEditRequest }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(user);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    // Handle browser back button
    const handleClose = useModalBackHandler(show, onClose, 'user-detail');

    useEffect(() => {
        if (show) {
            setCurrentUser(user);
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
    }, [show, user, shouldRender]);

    useEffect(() => {
        if (show && user?.id) {
            setIsLoading(true);
            api.get(`/users/${user.id}/stats`)
                .then(response => {
                    setStats(response.data);
                })
                .catch(error => {
                    console.error("Gagal mengambil statistik user:", error);
                    setStats(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [show, user]);

    if (!shouldRender) return null;
    if (!currentUser) return null;

    const handleWhatsAppChat = () => {
        const phone = currentUser.phone;
        if (!phone) return;

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }

        const url = `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-backdrop-detail ${animationClass}`}
            onClick={handleClose}
        >
            <div
                className={`modal-content-detail ${animationClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header-detail">
                    <h3><strong>Profil Pengguna: </strong>{currentUser.name}</h3>
                </div>

                <div className="modal-body-detail">
                    <h4 className="detail-section-title">Informasi Dasar</h4>
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Nama Lengkap</span>
                            <span className="value">{currentUser.name}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Email</span>
                            <span className="value">{currentUser.email}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Nomor Telepon</span>
                            <span className="value">{currentUser.phone || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Peran</span>
                            <span className="value" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Statistik Aktivitas</h4>
                    {isLoading ? (
                        <p className="value">Memuat statistik...</p>
                    ) : stats ? (
                        <div className="detail-grid-section">
                            <div className="detail-item-full">
                                <span className="label">Terdaftar Sejak</span>
                                <span className="value">{formatSimpleDate(currentUser.created_at)}</span>
                            </div>
                            <div className="detail-item-full">
                                <span className="label">Total Tiket Dibuat</span>
                                <span className="value">{stats?.total_tickets_created ?? '0'} Tiket</span>
                            </div>
                            <div className="detail-item-full">
                                <span className="label">Aset Sedang Dipinjam</span>
                                <span className="value">{stats?.assets_currently_borrowed ?? '0'} Aset</span>
                            </div>
                            {currentUser.role === 'admin' && (
                                <>
                                    <div className="detail-item-full">
                                        <span className="label">Total Tiket Diselesaikan</span>
                                        <span className="value">{stats?.total_tickets_completed ?? '0'} Tiket</span>
                                    </div>
                                    <div className="detail-item-full">
                                        <span className="label">Tiket Sedang Aktif</span>
                                        <span className="value">{stats?.total_tickets_in_progress ?? '0'} Tiket</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="value">Gagal memuat statistik.</p>
                    )}

                </div>
                <div className="modal-footer-user" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handleClose} className="btn-cancel">Tutup</button>
                    <button onClick={() => onEditRequest && onEditRequest(currentUser)} className="btn-confirm">
                        <i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
                        Edit
                    </button>
                    {currentUser.phone && (
                        <button onClick={handleWhatsAppChat} className="btn-history">
                            <i className="fab fa-whatsapp" style={{ marginRight: '8px' }}></i>
                            Chat
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDetailModal;