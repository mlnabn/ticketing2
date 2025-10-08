import React, { useState, useEffect } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import api from '../services/api';

function ItemDetailModal({ item, onClose, onSaveSuccess, showToast }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ status_id: '' });
    const [users, setUsers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        if (item) {
            setFormData({
                status_id: item.status_id || '',
                user_peminjam_id: item.user_peminjam_id || '',
                workshop_id: item.workshop_id || '',
            });
        }
    }, [item]);

    useEffect(() => {
        if (isEditing) {
            api.get('/statuses').then(res => setStatusOptions(res.data));
            api.get('/users/all').then(res => setUsers(res.data));
            api.get('/workshops').then(res => setWorkshops(res.data.data || res.data));
        }
    }, [isEditing]);

    if (!item) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        const selectedStatus = statusOptions.find(s => s.id == value);
        
        if (name === 'status_id' && selectedStatus?.nama_status !== 'Digunakan') {
            newFormData.user_peminjam_id = '';
            newFormData.workshop_id = '';
        }
        setFormData(newFormData);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.post(`/inventory/stock-items/${item.id}/checkout`, formData);
            showToast('Status barang berhasil diupdate.', 'success');
            onSaveSuccess(); // Untuk refresh data di tabel
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menyimpan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const isDigunakan = item.status_detail?.nama_status === 'Digunakan';
    const isEditingAndDigunakan = isEditing && statusOptions.find(s => s.id == formData.status_id)?.nama_status === 'Digunakan';
    
    const detailList = {
        "Kode Unik": item.kode_unik,
        "Serial Number": item.serial_number || "N/A",
        "Nama Barang": item.master_barang?.nama_barang,
        "Kondisi": item.kondisi,
        "Harga Beli": `Rp ${Number(item.harga_beli).toLocaleString('id-ID')}`,
        "Status Stok": isEditing ? (
            <select name="status_id" value={formData.status_id} onChange={handleChange} className="detail-edit-select">
                {statusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nama_status}</option>)}
            </select>
        ) : (
            item.status_detail?.nama_status || 'N/A'
        ),
    };
    
    if (isDigunakan) {
        detailList["Digunakan Oleh"] = item.user_peminjam?.name || 'N/A';
        detailList["Di Workshop"] = item.workshop?.name || 'N/A';
        detailList["Tanggal Keluar"] = new Date(item.tanggal_keluar).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    return (
        <div className="modal-backdrop-centered">
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
                        
                        {isEditingAndDigunakan && (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Gunakan Oleh</span>
                                    <span className="info-value">
                                        <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                            <option value="">Pilih Pengguna</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Di Workshop</span>
                                    <span className="info-value">
                                         <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                             <option value="">Pilih Workshop</option>
                                             {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                         </select>
                                    </span>
                                </div>
                            </>
                        )}
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
                            <button onClick={onClose} className="btn-cancel-centered">Tutup</button>
                            <button onClick={() => setIsEditing(true)} className="btn-confirm-centered">Ubah Status</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetailModal;