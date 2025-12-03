import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QrPrintSheet = React.forwardRef(({ items }, ref) => {
    if (!items || items.length === 0) {
        return null; 
    }

    return (
        <div ref={ref} id="print-area" className="print-sheet">
            {items.map(item => (
                <div key={item.id} className="qr-print-item">
                    <QRCodeSVG value={item.kode_unik} size={80} level="H" />
                    <div className="qr-print-details">
                        <span className="item-name">{item.master_barang.nama_barang}</span>
                        <span className="item-code">{item.kode_unik}</span>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default QrPrintSheet;