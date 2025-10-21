import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../services/api';

const formatSimpleDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return format(new Date(dateTimeString), 'dd MMMM yyyy', { locale: id });
};

function UserDetailModal({ user, onClose }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (user?.id) {
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
    }, [user]);

    if (!user) return null;
    const handleWhatsAppChat = () => {
        const phone = user.phone;
        if (!phone) return;

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }

        const url = `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="modal-backdrop-detail">
            <div className="modal-content-detail">
                <div className="modal-header-detail">
                    <h3><strong>Profil Pengguna: </strong>{user.name}</h3>
                </div>

                <div className="modal-body-detail">
                    <h4 className="detail-section-title">Informasi Dasar</h4>
                    <div className="detail-grid-section">
                        <div className="detail-item-full">
                            <span className="label">Nama Lengkap</span>
                            <span className="value">{user.name}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Email</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Nomor Telepon</span>
                            <span className="value">{user.phone || '-'}</span>
                        </div>
                        <div className="detail-item-full">
                            <span className="label">Peran</span>
                            <span className="value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Statistik Aktivitas</h4>
                    {isLoading ? (
                        <p className="value">Memuat statistik...</p>
                    ) : stats ? ( 
                        <div className="detail-grid-section">
                            <div className="detail-item-full">
                                <span className="label">Terdaftar Sejak</span>
                                <span className="value">{formatSimpleDate(user.created_at)}</span>
                            </div>
                            <div className="detail-item-full">
                                <span className="label">Total Tiket Dibuat</span>
                                <span className="value">{stats?.total_tickets_created ?? '0'} Tiket</span>
                            </div>
                            <div className="detail-item-full">
                                <span className="label">Aset Sedang Dipinjam</span>
                                <span className="value">{stats?.assets_currently_borrowed ?? '0'} Aset</span>
                            </div>
                            {user.role === 'admin' && (
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
                <div className="modal-footer-user" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={onClose} className="btn-cancel">Tutup</button>
                    {user.phone && (
                        <button onClick={handleWhatsAppChat} className="btn-history">
                            <i className="fab fa-whatsapp" style={{ marginRight: '8px' }}></i>
                            Chat Pengguna
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDetailModal;