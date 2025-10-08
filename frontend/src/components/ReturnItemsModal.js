import React, { useState, useEffect } from 'react';

function ReturnItemsModal({ ticket, onSave, onClose, showToast }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (ticket && ticket.master_barangs) {
            const initialItems = ticket.master_barangs.map(barang => ({
                master_barang_id: barang.id_m_barang, 
                name: barang.nama_barang,
                quantity_borrowed: barang.pivot.quantity_used || 0,
                quantity_returned: barang.pivot.quantity_used || 0,
                quantity_lost: 0,
                keterangan: '',
            }));
            setItems(initialItems);
        }
    }, [ticket]);

    const handleKeteranganChange = (itemId, value) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.master_barang_id === itemId ? { ...item, keterangan: value } : item
            )
        );
    };

    const handleQuantityChange = (itemId, field, value) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.master_barang_id === itemId) {
                    const updatedItem = { ...item };
                    const borrowed = item.quantity_borrowed;

                    if (value === "") {
                        updatedItem[field] = "";
                        const otherField = field === 'quantity_returned' ? 'quantity_lost' : 'quantity_returned';
                        updatedItem[otherField] = borrowed;
                        return updatedItem;
                    }

                    const numValue = parseInt(value, 10);
                    if (isNaN(numValue) || numValue < 0) return item;
                    
                    const newQuantity = Math.min(numValue, borrowed);

                    if (field === 'quantity_returned') {
                        updatedItem.quantity_returned = newQuantity;
                        updatedItem.quantity_lost = borrowed - newQuantity;
                    } else {
                        updatedItem.quantity_lost = newQuantity;
                        updatedItem.quantity_returned = borrowed - newQuantity;
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleSubmit = () => {
        for (const item of items) {
            const returned = parseInt(item.quantity_returned, 10) || 0;
            const lost = parseInt(item.quantity_lost, 10) || 0;

            if (returned + lost !== item.quantity_borrowed) {
                showToast(`Harap alokasikan semua item untuk "${item.name}" (kembali atau hilang).`, 'warning');
                return;
            }
            if (lost > 0 && !item.keterangan) {
                showToast(`Keterangan untuk "${item.name}" yang hilang wajib diisi.`, 'warning');
                return;
            }
        }

        const itemsToSave = items.map(item => ({
            master_barang_id: item.master_barang_id,
            quantity_returned: parseInt(item.quantity_returned, 10) || 0,
            quantity_lost: parseInt(item.quantity_lost, 10) || 0,
            keterangan: item.keterangan,
        }));

        onSave(ticket.id, itemsToSave);
    };

    if (!ticket) return null;

    return (
        <div className="modal-backdrop-centered">
            <div className="modal-content-large">
                <h3>Form Pengembalian & Penyelesaian</h3>
                <p>Tiket: "{ticket.title}"</p>

                <div className="items-to-return-list">
                    {items.map(item => (
                        <div key={item.master_barang_id} className="return-item-row">
                            <div style={{ marginBottom: '5px' }}>
                                <strong>{item.name}</strong> (Dipinjam: {item.quantity_borrowed})
                            </div>
                            
                            <div className="form-group-inline2">
                                <div className="input-group2">
                                    <label>Jml Kembali:</label>
                                    <input
                                        type="number"
                                        value={item.quantity_returned}
                                        onChange={(e) => handleQuantityChange(item.master_barang_id, 'quantity_returned', e.target.value)}
                                        min="0"
                                        max={item.quantity_borrowed}
                                    />
                                </div>
                                <div className="input-group2">
                                    <label>Jml Hilang:</label>
                                    <input
                                        type="number"
                                        value={item.quantity_lost}
                                        onChange={(e) => handleQuantityChange(item.master_barang_id, 'quantity_lost', e.target.value)}
                                        min="0"
                                        max={item.quantity_borrowed}
                                    />
                                </div>
                            </div>
                            
                            {item.quantity_lost > 0 && (
                                <div className="form-group2">
                                    <label>Keterangan Hilang:</label>
                                    <textarea
                                        value={item.keterangan}
                                        onChange={(e) => handleKeteranganChange(item.master_barang_id, e.target.value)}
                                        placeholder={`Cth: Terjatuh di lokasi, rusak, dll.`}
                                        rows="2"
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel-centered">Batal</button>
                    <button onClick={handleSubmit} className="btn-confirm-centered">Selesaikan Tiket</button>
                </div>
            </div>
        </div>
    );
}

export default ReturnItemsModal;