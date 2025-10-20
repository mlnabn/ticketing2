import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ConditionalUserInput = ({ item, statusName, users, onChange }) => {
    // ... (Komponen ini tidak perlu diubah)
    switch (statusName) {
        case 'Digunakan':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Pengguna:</label>
                    <select
                        value={item.user_digunakan_id}
                        onChange={(e) => onChange(item.stok_barang_id, 'user_digunakan_id', e.target.value)}
                    >
                        <option value="">Pilih Pengguna (default: Anda)</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            );
        case 'Rusak':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Dilaporkan oleh:</label>
                    <select
                        value={item.user_rusak_id}
                        onChange={(e) => onChange(item.stok_barang_id, 'user_rusak_id', e.target.value)}
                    >
                        <option value="">Pilih Penanggung Jawab (default: Anda)</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            );
        case 'Hilang':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Terakhir diketahui:</label>
                    <select
                        value={item.user_hilang_id}
                        onChange={(e) => onChange(item.stok_barang_id, 'user_hilang_id', e.target.value)}
                    >
                        <option value="">Pilih Penanggung Jawab (default: Anda)</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            );
        default:
            return null;
    }
};

function ReturnItemsModal({ ticket, onSave, onClose, showToast }) {
    const [items, setItems] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (ticket && ticket.id) {
            setIsLoading(true);
            Promise.all([
                api.get(`/tickets/${ticket.id}/borrowed-items`),
                api.get('/statuses'),
                api.get('/users/all')
            ]).then(([itemsRes, statusesRes, usersRes]) => {
                const tersediaStatus = statusesRes.data.find(s => s.nama_status === 'Tersedia');
                const tersediaStatusId = tersediaStatus ? tersediaStatus.id : '';
                
                const initialItems = itemsRes.data.map(item => ({
                    stok_barang_id: item.id,
                    name: item.master_barang.nama_barang,
                    kode_unik: item.kode_unik,
                    status_id: tersediaStatusId,
                    keterangan: '',
                    user_digunakan_id: '',
                    user_rusak_id: '',
                    user_hilang_id: '',
                }));
                setItems(initialItems);

                setStatusOptions(statusesRes.data.filter(s => 
                    ['Tersedia', 'Digunakan', 'Rusak', 'Hilang'].includes(s.nama_status)
                ));
                setAllUsers(usersRes.data);

            }).catch(err => {
                console.error("Gagal memuat data pengembalian", err);
                showToast("Gagal memuat data barang yang dipinjam.", "error");
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [ticket, showToast]);

    const handleItemChange = (stokId, field, value) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.stok_barang_id === stokId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = () => {
        const payload = {
            items: items.map(item => ({
                stok_barang_id: item.stok_barang_id,
                status_id: item.status_id,
                keterangan: item.keterangan,
                user_digunakan_id: item.user_digunakan_id,
                user_rusak_id: item.user_rusak_id,
                user_hilang_id: item.user_hilang_id,
            }))
        };
        onSave(ticket.id, payload.items);
    };

    if (!ticket) return null;

    return (
        <div className="modal-backdrop-centered">
            <div className="modal-content-large">
                <h3>Form Pengembalian & Penyelesaian</h3>
                <p>Tiket: "{ticket.title}"</p>

                {isLoading ? <p>Memuat...</p> : (
                    <div className="items-to-return-list">
                        {items.length > 0 ? items.map(item => {
                            // === PERBAIKAN UTAMA ADA DI SINI ===
                            // Mengubah string menjadi number sebelum membandingkan
                            const selectedStatus = statusOptions.find(s => s.id === Number(item.status_id));
                            return (
                                <div key={item.stok_barang_id} className="return-item-row">
                                    {/* ... sisa kode tidak berubah ... */}
                                    <div className="item-info">
                                        <strong>{item.name}</strong>
                                        <small>({item.kode_unik})</small>
                                    </div>
                                    
                                    <div className="item-controls">
                                        <div className="form-group-inline2">
                                            <label>Status Akhir:</label>
                                            <select
                                                value={item.status_id}
                                                onChange={(e) => handleItemChange(item.stok_barang_id, 'status_id', e.target.value)}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{opt.nama_status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <ConditionalUserInput 
                                            item={item}
                                            statusName={selectedStatus?.nama_status}
                                            users={allUsers}
                                            onChange={handleItemChange}
                                        />
                                        
                                        <div className="form-group2">
                                            <label>Keterangan (jika perlu):</label>
                                            <textarea
                                                value={item.keterangan}
                                                onChange={(e) => handleItemChange(item.stok_barang_id, 'keterangan', e.target.value)}
                                                rows="2"
                                                placeholder="Cth: Dipasang permanen di workshop, jatuh, dll."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : <p>Tidak ada barang yang tercatat dipinjam untuk tiket ini.</p>}
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Batal</button>
                    <button onClick={handleSubmit} className="btn-confirm" disabled={isLoading}>
                        Selesaikan Tiket
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReturnItemsModal;