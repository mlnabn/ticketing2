import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Komponen ini menggunakan forwardRef agar bisa ditarget oleh CSS print
const QrPrintSheet = React.forwardRef(({ items }, ref) => {
    if (!items || items.length === 0) {
        return null; // Jangan render apa-apa jika tidak ada item
    }

    return (
        <div ref={ref} id="print-area" className="print-sheet">
            {items.map(item => (
                <div key={item.id} className="qr-print-item">
                    {/* Pastikan value adalah kode unik untuk QR */}
                    <QRCodeSVG value={item.kode_unik} size={80} level="H" />
                    <div className="qr-print-details">
                        {/* Pastikan Anda mengakses nama barang dari relasi */}
                        <span className="item-name">{item.master_barang.nama_barang}</span>
                        <span className="item-code">{item.kode_unik}</span>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default QrPrintSheet;