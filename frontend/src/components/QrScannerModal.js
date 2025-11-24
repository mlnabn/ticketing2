import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScannerModal({ show, onClose, onScanSuccess }) {
    const { showToast } = useOutletContext();
    const [scannerInstance, setScannerInstance] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    useEffect(() => {
        if (show) {
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
    }, [show, shouldRender]);

    useEffect(() => {
        if (show && !scannerInstance && shouldRender) {
            const scanner = new Html5QrcodeScanner(
                "qr-reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false 
            );

            const handleSuccess = (decodedText, decodedResult) => {
                scanner.clear().catch(err => {
                    console.error("Gagal membersihkan scanner setelah sukses scan:", err);
                });
                setScannerInstance(null); 
                onScanSuccess(decodedText);
            };

            const handleError = (error) => {
                if (error.includes("NotFoundException")) {
                    return;
                }
                showToast(`Error scanning QR Code: ${error}`, 'error');
            };

            scanner.render(handleSuccess, handleError);
            setScannerInstance(scanner);
        }
        if (!show && scannerInstance) {
            scannerInstance.clear().catch(err => {
                console.error("Gagal membersihkan scanner saat unmount:", err);
            });
            setScannerInstance(null); 
        }
        
        return () => {
            if (scannerInstance) {
                scannerInstance.clear().catch(err => {
                    console.error("Gagal membersihkan scanner saat unmount total:", err);
                });
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, onScanSuccess, showToast, scannerInstance, shouldRender]);

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };
    
    if (!shouldRender) return null;
    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`modal-backdrop-centered ${animationClass}`}
            onClick={handleCloseClick}
        >
            <div 
                className={`modal-content-large qr-scanner-modal ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <h3>Arahkan QR Code ke Kamera</h3>
                {shouldRender && !isClosing && (
                    <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                )}
                <div className="modal-actions">
                    <button onClick={handleCloseClick} className="btn-cancel">Batal</button>
                </div>
            </div>
        </div>
    );
}

export default QrScannerModal;