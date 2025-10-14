import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import api from '../services/api';
import EditStokBarangModal from './EditStokBarangModal';
import HistoryModal from './HistoryModal';

// --- State Awal (Tidak Berubah) ---
const initialFormData = {
    status_id: '',
    deskripsi: '',
    user_peminjam_id: '',
    workshop_id: '',
    teknisi_perbaikan_id: '',
    tanggal_mulai_perbaikan: '',
    tanggal_selesai_perbaikan: '',
    user_perusak_id: '',
    tanggal_rusak: '',
    user_penghilang_id: '',
    tanggal_hilang: '',
    tanggal_ketemu: '',
    tanggal_keluar: '',
    tanggal_masuk_pinjam: '',
};

// --- Komponen Utama ---
function ItemDetailModal({ item, onClose, onSaveSuccess, showToast, onEditClick, fetchData, pagination, selectedCategory, selectedSubCategory }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [users, setUsers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [stockByColor, setStockByColor] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // --- Efek untuk mengisi form & mengambil data ---
    useEffect(() => {
        if (item) {
            setFormData({
                status_id: item.status_id || '',
                deskripsi: item.deskripsi || '',
                user_peminjam_id: item.user_peminjam_id || '',
                workshop_id: item.workshop_id || '',
                teknisi_perbaikan_id: item.teknisi_perbaikan_id || '',
                tanggal_mulai_perbaikan: item.tanggal_mulai_perbaikan?.split(' ')[0] || '',
                tanggal_selesai_perbaikan: item.tanggal_selesai_perbaikan?.split(' ')[0] || '',
                user_perusak_id: item.user_perusak_id || '',
                tanggal_rusak: item.tanggal_rusak?.split(' ')[0] || '',
                user_penghilang_id: item.user_penghilang_id || '',
                tanggal_hilang: item.tanggal_hilang?.split(' ')[0] || '',
                tanggal_ketemu: item.tanggal_ketemu?.split(' ')[0] || '',
                tanggal_keluar: item.tanggal_keluar?.split(' ')[0] || '',
                tanggal_masuk_pinjam: item.tanggal_masuk_pinjam?.split(' ')[0] || '',
            });
        }
    }, [item, isEditing]);

    useEffect(() => {
        if (isEditing) {
            api.get('/statuses').then(res => setStatusOptions(res.data));
            api.get('/users?all=true').then(res => setUsers(res.data));
            api.get('/workshops').then(res => setWorkshops(res.data.data || res.data));
        }
    }, [isEditing]);

    useEffect(() => {
        if (item?.master_barang_id) {
            const fetchStockByColor = async () => {
                try {
                    const response = await api.get(`/inventory/items/${item.master_barang_id}/stock-by-color`);
                    setStockByColor(response.data);
                } catch (error) {
                    console.error("Gagal mengambil rincian stok warna:", error);
                }
            };
            fetchStockByColor();
        }
    }, [item]);

    const selectedStatusName = useMemo(() => {
        if (isEditing) {
            const selectedStatus = statusOptions.find(s => s.id === Number(formData.status_id));
            return selectedStatus ? selectedStatus.nama_status : '';
        }
        return item?.status_detail?.nama_status;
    }, [formData.status_id, statusOptions, isEditing, item]);

    if (!item) return null;

    // --- Handlers ---
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.post(`/inventory/stock-items/${item.id}/update-status`, formData);
            showToast('Status barang berhasil diupdate.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan.';
            showToast(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Function untuk Form Kondisional (Lengkap) ---
    const renderConditionalInputs = () => {
        if (!isEditing) return null;

        const commonDescription = (label) => (
            <div className="info-row full-width">
                <span className="info-label">{label}</span>
                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
            </div>
        );

        switch (selectedStatusName) {
            case 'Digunakan':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Digunakan Oleh</span>
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Di Workshop</span>
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || getTodayDate()} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Penggunaan')}
                    </div>
                );
            case 'Dipinjam':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Dipinjam Oleh</span>
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Di Workshop</span>
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || getTodayDate()} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        <div className="info-row"><span className="info-label">Estimasi Tanggal Masuk</span>
                            <input type="date" name="tanggal_masuk_pinjam" value={formData.tanggal_masuk_pinjam} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Peminjaman')}
                    </div>
                );
            case 'Perbaikan':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Teknisi Perbaikan</span>
                            <select name="teknisi_perbaikan_id" value={formData.teknisi_perbaikan_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Teknisi</option>
                                {users.filter(u => u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Mulai</span>
                            <input type="date" name="tanggal_mulai_perbaikan" value={formData.tanggal_mulai_perbaikan || getTodayDate()} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Selesai</span>
                            <input type="date" name="tanggal_selesai_perbaikan" value={formData.tanggal_selesai_perbaikan} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Perbaikan')}
                    </div>
                );
            case 'Rusak':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Dilaporkan oleh</span>
                            <select name="user_perusak_id" value={formData.user_perusak_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Rusak</span>
                            <input type="date" name="tanggal_rusak" value={formData.tanggal_rusak || getTodayDate()} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Kerusakan')}
                    </div>
                );
            case 'Hilang':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Terakhir Diketahui oleh</span>
                            <select name="user_penghilang_id" value={formData.user_penghilang_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Hilang</span>
                            <input type="date" name="tanggal_hilang" value={formData.tanggal_hilang || getTodayDate()} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Ketemu</span>
                            <input type="date" name="tanggal_ketemu" value={formData.tanggal_ketemu} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Kehilangan')}
                    </div>
                );
            default:
                return commonDescription('Deskripsi');
        }
    };

    return (
        <div className="modal-backdrop-centered" onClick={onClose}>
            <div className="modal-content-large" onClick={e => e.stopPropagation()}>

                <button type="button" onClick={onClose} className="modal-close-btn">&times;</button>
                <h3>Detail Aset: {item.master_barang?.nama_barang}</h3>

                <div className="item-detail-qr-top">
                    <QRCode value={item.kode_unik} size={160} level="H" />
                    <strong>{item.kode_unik}</strong>
                </div>

                <div className="item-detail-bottom-section">
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Kondisi</span><span className="info-value-info">{item.kondisi}</span></div>
                        <div className="info-row"><span className="info-label">Harga Beli</span><span className="info-value-info">{`Rp ${Number(item.harga_beli).toLocaleString('id-ID')}`}</span></div>
                        <div className="info-row"><span className="info-label">Tanggal Pembelian</span><span className="info-value-info">{new Date(item.tanggal_pembelian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>

                        <div className="info-row">
                            <span className="info-label">Status Stok</span>
                            <span className="info-value-info">
                                {isEditing ? (
                                    <select name="status_id" value={formData.status_id} onChange={handleChange} className="detail-edit-select">
                                        <option value="">Pilih Status</option>
                                        {statusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nama_status}</option>)}
                                    </select>
                                ) : (item.status_detail?.nama_status || 'N/A')}
                            </span>
                        </div>

                        {stockByColor.length > 0 && (
                            <div className="info-row full-width stock-detail-info">
                                <span className="info-label">Rincian Stok per Warna</span>
                                <div className="stock-color-list">
                                    {stockByColor.map((stock, index) => (
                                        <div key={index} className="stock-item">
                                            <span className="stock-color-name">{stock.nama_warna || 'Tanpa Warna'}</span>
                                            <span className="stock-color-qty">{stock.total} unit</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isEditing && (
                            <>
                                {(item.status_detail?.nama_status === 'Digunakan' || item.status_detail?.nama_status === 'Dipinjam') && (
                                    <>
                                        <div className="info-row"><span className="info-label">{item.status_detail.nama_status} Oleh</span><span className="info-value-info">{item.user_peminjam?.name || 'N/A'}</span></div>
                                        <div className="info-row"><span className="info-label">Di Workshop</span><span className="info-value-info">{item.workshop?.name || 'N/A'}</span></div>
                                        {item.tanggal_keluar && <div className="info-row"><span className="info-label">Tanggal Keluar</span><span className="info-value-info">{new Date(item.tanggal_keluar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                        {item.tanggal_masuk_pinjam && <div className="info-row"><span className="info-label">Estimasi Tgl Masuk</span><span className="info-value-info">{new Date(item.tanggal_masuk_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Perbaikan' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Teknisi</span><span className="info-value-info">{item.teknisi_perbaikan?.name || 'N/A'}</span></div>
                                        {item.tanggal_mulai_perbaikan && <div className="info-row"><span className="info-label">Tgl Mulai</span><span className="info-value-info">{new Date(item.tanggal_mulai_perbaikan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Rusak' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Dilaporkan Oleh</span><span className="info-value-info">{item.user_perusak?.name || 'N/A'}</span></div>
                                        {item.tanggal_rusak && <div className="info-row"><span className="info-label">Tgl Rusak</span><span className="info-value-info">{new Date(item.tanggal_rusak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Hilang' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Terakhir Oleh</span><span className="info-value-info">{item.user_penghilang?.name || 'N/A'}</span></div>
                                        {item.tanggal_hilang && <div className="info-row"><span className="info-label">Tgl Hilang</span><span className="info-value-info">{new Date(item.tanggal_hilang).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {item.deskripsi && (
                                    <div className="info-row full-width"><span className="info-label">Deskripsi</span><span className="info-value-info">{item.deskripsi}</span></div>
                                )}
                            </>
                        )}

                        {renderConditionalInputs()}
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="btn-secondary" /* Sesuaikan class jika perlu */
                        style={{ marginRight: 'auto' }}
                    >
                        Riwayat Barang
                    </button>
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="btn-cancel">Batal</button>
                            <button onClick={handleSave} className="btn-confirm" disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onEditClick(item)} className="btn-cancel">Edit Detail</button>
                            <button onClick={() => setIsEditing(true)} className="btn-confirm">Ubah Status</button>
                        </>
                    )}
                </div>
            </div>

            {editItem && (
                <EditStokBarangModal
                    isOpen={!!editItem}
                    onClose={() => setEditItem(null)}
                    item={editItem}
                    showToast={showToast}
                    onSaveSuccess={() => {
                        setEditItem(null);
                        fetchData(pagination?.current_page || 1, {
                            id_kategori: selectedCategory,
                            id_sub_kategori: selectedSubCategory
                        });
                    }}
                />
            )}

            {showHistory && (
                <HistoryModal
                    item={item}
                    onClose={() => setShowHistory(false)}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

export default ItemDetailModal;

