import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScannerModal({ onClose, onScanSuccess }) {
    const { showToast } = useOutletContext();

    useEffect(() => {
        // Inisialisasi scanner
        const scanner = new Html5QrcodeScanner(
            "qr-reader", 
            {
                fps: 10,  
                qrbox: { width: 250, height: 250 },
            },
            false 
        );

        const handleSuccess = (decodedText, decodedResult) => {
            scanner.clear(); 
            onScanSuccess(decodedText);
        };

        const handleError = (error) => {
            showToast(`Error scanning QR Code: ${error}`, 'error');
        };

        scanner.render(handleSuccess, handleError);

        return () => {
            if (scanner && scanner.getState() !== 1) { 
                 scanner.clear().catch(err => console.error("Gagal membersihkan scanner", err));
            }
        };
    }, [onScanSuccess, showToast]);

    return (
        <div className="modal-backdrop-centered" onClick={onClose}>
            <div className="modal-content-large qr-scanner-modal" onClick={e => e.stopPropagation()}>
                <h3>Arahkan QR Code ke Kamera</h3>
                <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">Batal</button>
                </div>
            </div>
        </div>
    );
}

export default QrScannerModal;