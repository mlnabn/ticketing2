import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScannerModal({ show, onClose, onScanSuccess }) {
    const { showToast } = useOutletContext();
    const scannerRef = useRef(null);
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
        if (show && shouldRender && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            const handleSuccess = async (decodedText, decodedResult) => {
                const currentScanner = scannerRef.current;

                if (currentScanner) {
                    try {
                        await currentScanner.clear();
                        scannerRef.current = null;
                        onScanSuccess(decodedText);

                    } catch (err) {
                        console.error("Gagal mematikan kamera setelah sukses scan:", err);
                        scannerRef.current = null;
                        onScanSuccess(decodedText);
                    }
                } else {
                    onScanSuccess(decodedText);
                }
            };

            const handleError = (error) => {
                if (error.includes("NotFoundException")) {
                    return;
                }
            };

            scanner.render(handleSuccess, handleError);
            scannerRef.current = scanner;
        }
        return () => {
            const currentScanner = scannerRef.current;
            if (currentScanner) {
                currentScanner.clear().catch(err => {
                    console.error("Gagal mematikan kamera saat UNMOUNT TOTAL:", err);
                }).finally(() => {
                    scannerRef.current = null;
                });
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, onScanSuccess, showToast, shouldRender]);

    const handleCloseClick = async () => {
        const currentScanner = scannerRef.current;

        if (currentScanner) {
            try {
                await currentScanner.clear();
                scannerRef.current = null;
            } catch (err) {
                console.error("Gagal mematikan kamera saat force close:", err);
                scannerRef.current = null;
            }
        }
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