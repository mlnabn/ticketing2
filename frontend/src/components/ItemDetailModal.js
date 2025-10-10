import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import api from '../services/api';
import EditStokBarangModal from './EditStokBarangModal';

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
    tanggal_masuk: '',
    tanggal_masuk_pinjam: '',
};

function ItemDetailModal({ item, onClose, onSaveSuccess, showToast, onEditClick, fetchData, pagination, selectedCategory, selectedSubCategory }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [users, setUsers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

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
                tanggal_masuk: item.tanggal_masuk?.split(' ')[0] || '',
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

    const selectedStatusName = useMemo(() => {
        if (isEditing) {
            const selectedStatus = statusOptions.find(s => s.id == formData.status_id);
            return selectedStatus ? selectedStatus.nama_status : '';
        }
        return item.status_detail?.nama_status;
    }, [formData.status_id, statusOptions, isEditing, item.status_detail]);
    
    if (!item) return null;

    const handleShowStockByColor = async () => {
        try {
            const response = await api.get(`/inventory/items/${item.master_barang_id}/stock-by-color`);
            let message = `Rincian Stok untuk "${item.master_barang.nama_barang}":\n`;
            if (response.data.length > 0) {
                response.data.forEach(stock => {
                    message += `\n- ${stock.nama_warna || 'Tanpa Warna'}: ${stock.total} unit`;
                });
            } else {
                message = `Tidak ada rincian stok berdasarkan warna untuk "${item.master_barang.nama_barang}".`;
            }
            showToast(message, 'info', 10000); // Tampilkan toast lebih lama
        } catch (error) {
            showToast('Gagal mengambil rincian stok.', 'error');
        }
    };

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
            console.error(error.response?.data?.errors);
        } finally {
            setIsLoading(false);
        }
    };

    const renderConditionalInputs = () => {
        if (!isEditing) return null;

        switch (selectedStatusName) {
            case 'Digunakan':
                return (
                    <>
                        <div className="info-row"><span className="info-label">Digunakan Oleh</span><span className="info-value">
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </span></div>
                        <div className="info-row"><span className="info-label">Di Workshop</span><span className="info-value">
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </span></div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || getTodayDate()} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                        <div className="info-row full-width"><span className="info-label">Deskripsi Penggunaan</span>
                            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
                        </div>
                    </>
                );
            case 'Dipinjam':
                return (
                    <>
                        <div className="info-row"><span className="info-label">Dipinjam Oleh</span><span className="info-value">
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </span></div>
                         <div className="info-row"><span className="info-label">Di Workshop</span><span className="info-value">
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </span></div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || getTodayDate()} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                        <div className="info-row"><span className="info-label">Tanggal Masuk</span>
                            <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk_pinjam} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                    </>
                );
            case 'Perbaikan':
                return (
                     <>
                        <div className="info-row"><span className="info-label">Teknisi Perbaikan</span>
                            <select name="teknisi_perbaikan_id" value={formData.teknisi_perbaikan_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Teknisi</option>
                                {users.filter(u => u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Mulai</span>
                            <input type="date" name="tanggal_mulai_perbaikan" value={formData.tanggal_mulai_perbaikan || getTodayDate()} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                         <div className="info-row"><span className="info-label">Tgl Selesai</span>
                            <input type="date" name="tanggal_selesai_perbaikan" value={formData.tanggal_selesai_perbaikan} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                         <div className="info-row full-width"><span className="info-label">Deskripsi Perbaikan</span>
                             <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
                        </div>
                    </>
                );
            case 'Rusak':
                 return (
                     <>
                        <div className="info-row"><span className="info-label">Dilaporkan oleh</span>
                             <select name="user_perusak_id" value={formData.user_perusak_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                         <div className="info-row"><span className="info-label">Tgl Rusak</span>
                            <input type="date" name="tanggal_rusak" value={formData.tanggal_rusak || getTodayDate()} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                         <div className="info-row full-width"><span className="info-label">Deskripsi Kerusakan</span>
                             <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
                        </div>
                    </>
                );
             case 'Hilang':
                 return (
                     <>
                        <div className="info-row"><span className="info-label">Terakhir Diketahui oleh</span>
                             <select name="user_penghilang_id" value={formData.user_penghilang_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                         <div className="info-row"><span className="info-label">Tgl Hilang</span>
                            <input type="date" name="tanggal_hilang" value={formData.tanggal_hilang || getTodayDate()} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                         <div className="info-row"><span className="info-label">Tgl Ketemu</span>
                            <input type="date" name="tanggal_ketemu" value={formData.tanggal_ketemu} onChange={handleChange} className="detail-edit-input"/>
                        </div>
                         <div className="info-row full-width"><span className="info-label">Deskripsi Kehilangan</span>
                             <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
                        </div>
                    </>
                );
            default:
                return (
                    <div className="info-row full-width"><span className="info-label">Deskripsi</span>
                        <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="2" className="detail-edit-textarea" placeholder="Catatan tambahan..."></textarea>
                    </div>
                );
        }
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
                        <div className="info-row"><span className="info-label">Kondisi</span><span className="info-value">{item.kondisi}</span></div>
                        <div className="info-row"><span className="info-label">Harga Beli</span><span className="info-value">{`Rp ${Number(item.harga_beli).toLocaleString('id-ID')}`}</span></div>
                        <div className="info-row"><span className="info-label">Tanggal Pembelian</span><span className="info-value">{new Date(item.tanggal_pembelian).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>
                        <div className="info-row"><span className="info-label">Status Stok</span>
                             <span className="info-value">
                                {isEditing ? (
                                    <select name="status_id" value={formData.status_id} onChange={handleChange} className="detail-edit-select">
                                        <option value="">Pilih Status</option>
                                        {statusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nama_status}</option>)}
                                    </select>
                                ) : ( item.status_detail?.nama_status || 'N/A' )}
                            </span>
                        </div>
                        
                        {/* BAGIAN BARU: Menampilkan info detail sesuai status saat ini (mode read-only) */}
                        {!isEditing && (
                            <>
                                {(item.status_detail?.nama_status === 'Digunakan' || item.status_detail?.nama_status === 'Dipinjam') && (
                                    <>
                                        <div className="info-row"><span className="info-label">{item.status_detail.nama_status} Oleh</span><span className="info-value">{item.user_peminjam?.name || 'N/A'}</span></div>
                                        <div className="info-row"><span className="info-label">Di Workshop</span><span className="info-value">{item.workshop?.name || 'N/A'}</span></div>
                                        <div className="info-row"><span className="info-label">Tanggal Keluar</span><span className="info-value">{new Date(item.tanggal_keluar).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Perbaikan' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Teknisi</span><span className="info-value">{item.teknisi_perbaikan?.name || 'N/A'}</span></div>
                                        {item.tanggal_mulai_perbaikan && <div className="info-row"><span className="info-label">Tgl Mulai</span><span className="info-value">{new Date(item.tanggal_mulai_perbaikan).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>}
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Rusak' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Dilaporkan Oleh</span><span className="info-value">{item.user_perusak?.name || 'N/A'}</span></div>
                                        {item.tanggal_rusak && <div className="info-row"><span className="info-label">Tgl Rusak</span><span className="info-value">{new Date(item.tanggal_rusak).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>}
                                    </>
                                )}
                                {item.status_detail?.nama_status === 'Hilang' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Terakhir Oleh</span><span className="info-value">{item.user_penghilang?.name || 'N/A'}</span></div>
                                        {item.tanggal_hilang && <div className="info-row"><span className="info-label">Tgl Hilang</span><span className="info-value">{new Date(item.tanggal_hilang).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></div>}
                                    </>
                                )}
                                {item.deskripsi && (
                                    <div className="info-row full-width"><span className="info-label">Deskripsi</span><span className="info-value">{item.deskripsi}</span></div>
                                )}
                            </>
                        )}
                        
                        {/* Menampilkan form input kondisional saat mode edit */}
                        {renderConditionalInputs()}
                    </div>
                </div>
                <div className="modal-actions">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="btn-cancel-centered">Batal</button>
                            <button onClick={handleSave} className="btn-confirm-centered" disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* <button onClick={() => setEditItem(item)} className="btn-cancel-centered">Edit</button>
                            <button onClick={() => setIsEditing(true)} className="btn-confirm-centered">Ubah Status</button> */}
                            <button onClick={() => onEditClick(item)} className="btn-secondary-centered">Edit Detail</button>
                            
                            {/* BARU: Tombol "Detail Stok" */}
                            <button onClick={handleShowStockByColor} className="btn-secondary-centered">Detail Stok</button>
                            
                            <button onClick={() => setIsEditing(true)} className="btn-confirm-centered">Ubah Status</button>
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
                    onSaveSuccess={() => fetchData(pagination?.current_page || 1, {
                        id_kategori: selectedCategory,
                        id_sub_kategori: selectedSubCategory
                    })}
                />
            )}
        </div>
    );
}

export default ItemDetailModal;