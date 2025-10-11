import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ReturnItemsModal({ ticket, onSave, onClose, showToast }) {
    const [items, setItems] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Ambil data barang spesifik yang dipinjam & daftar status dari API
    useEffect(() => {
        if (ticket && ticket.master_barangs) {
            setIsLoading(true);
            Promise.all([
                // Endpoint baru yang sudah kita buat sebelumnya
                api.get(`/tickets/${ticket.id}/borrowed-items`),
                api.get('/statuses')
            ]).then(([itemsRes, statusesRes]) => {

                const tersediaStatus = statusesRes.data.find(s => s.nama_status === 'Tersedia');
                const tersediaStatusId = tersediaStatus ? tersediaStatus.id : '';
                
                const initialItems = itemsRes.data.map(item => ({
                    stok_barang_id: item.id,
                    name: item.master_barang.nama_barang,
                    kode_unik: item.kode_unik,
                    status_id: tersediaStatusId,
                    keterangan: ''
                }));
                setItems(initialItems);

                setStatusOptions(statusesRes.data.filter(s => 
                    ['Tersedia', 'Digunakan', 'Rusak', 'Hilang'].includes(s.nama_status)
                ));

            }).catch(err => {
                console.error("Gagal memuat data pengembalian", err);
                showToast("Gagal memuat data barang yang dipinjam.", "error");
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [ticket, showToast]);

    // Handler untuk mengubah state item saat dropdown atau textarea diubah
    const handleItemChange = (stokId, field, value) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.stok_barang_id === stokId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = () => {
        // Buat payload sesuai yang diharapkan backend
        const payload = {
            items: items.map(item => ({
                stok_barang_id: item.stok_barang_id,
                status_id: item.status_id,
                keterangan: item.keterangan,
            }))
        };
        // Panggil fungsi onSave dari AdminDashboard
        onSave(ticket.id, payload.items);
    };

    if (!ticket) return null;

    return (
        <div className="modal-backdrop-centered">
            <div className="modal-content-large">
                <h3>Form Pengembalian & Penyelesaian</h3>
                <p>Tiket: "{ticket.title}"</p>

                {isLoading ? <p>Memuat barang yang dipinjam...</p> : (
                    <div className="items-to-return-list">
                        {items.length > 0 ? items.map(item => (
                            <div key={item.stok_barang_id} className="return-item-row">
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
                                    
                                    <div className="form-group2">
                                        <label>Keterangan (jika perlu):</label>
                                        <textarea
                                            value={item.keterangan}
                                            onChange={(e) => handleItemChange(item.stok_barang_id, 'keterangan', e.target.value)}
                                            rows="2"
                                            placeholder="Cth: Dipasang di workshop, hilang, dll."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )) : <p>Tidak ada barang yang tercatat dipinjam untuk tiket ini.</p>}
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