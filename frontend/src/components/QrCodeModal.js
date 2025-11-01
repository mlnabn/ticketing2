import React, { useState, useEffect } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const formatCurrency = (value) => {
    if (isNaN(value) || value === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

function QrCodeModal({ show, item, onClose }) {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item);

    useEffect(() => {
        if (show) {
            setCurrentItem(item);
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, item, shouldRender]);

    if (!shouldRender) return null;
    if (!currentItem) return null; 

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`modal-backdrop ${animationClass}`}
            onClick={onClose}
        >
            <div 
                className={`modal-content-qr ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <h3>QR Code untuk {currentItem.kode_unik}</h3>
                <div className="qr-container">
                    <QRCode value={currentItem.kode_unik} size={256} level="H" />
                    <p className="item-name">{currentItem.master_barang?.nama_barang}</p>
                    <p className="item-serial">S/N: {currentItem.serial_number || 'N/A'}</p>
                    <p className="item-warna" style={{ marginTop: '10px' }}>
                        Warna: {currentItem.color?.nama_warna || '-'}
                    </p>
                    <p className="item-harga">
                        Harga Beli: {formatCurrency(currentItem.harga_beli)}
                    </p>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default QrCodeModal;