import React, { useState, useEffect } from 'react';

function RecoverStockModal({ tool, ticket, onClose, onSave, showToast }) {
  const [quantity, setQuantity] = useState(1);
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (ticket) {
      setQuantity(ticket.quantity_lost || 1);
    }
  }, [ticket]);

  const handleQuantityChange = (value) => {
    const numValue = parseInt(value, 10);

    if (isNaN(numValue)) {
      setQuantity(''); 
      return;
    }

    if (numValue > ticket.quantity_lost) {
      setQuantity(ticket.quantity_lost);
    } else if (numValue < 1) {
      setQuantity(1);
    } else {
      setQuantity(numValue);
    }
  };

  const handleSubmit = () => {
    if (!keterangan) {
      showToast('Keterangan pemulihan wajib diisi.', 'warning');
      return;
    }
    // Pastikan quantity yang dikirim adalah angka
    const finalQuantity = parseInt(quantity, 10) || 1;
    onSave(tool.id, ticket.ticket_id, finalQuantity, keterangan);
  };

  if (!tool || !ticket) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content user-form-modal">
        <h3>Pulihkan Stok: {tool.name}</h3>
        <p>Dari Tiket: "{ticket.ticket_title}"</p>
        <div className="form-group">
          <label>Jumlah Dipulihkan (Maks: {ticket.quantity_lost})</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            min="1"
            max={ticket.quantity_lost}
          />
        </div>
        <div className="form-group">
          <label>Keterangan Pemulihan</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Cth: Barang ketemu, diganti dengan yang baru, dll."
            rows="3"
            required
          ></textarea>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm">Simpan & Pulihkan</button>
        </div>
      </div>
    </div>
  );
}

export default RecoverStockModal;