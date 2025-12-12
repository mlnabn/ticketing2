import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScannerModal({ show, onClose, onScanSuccess }) {
    const { showToast } = useOutletContext();
    const scannerRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const hasHistoryPushed = useRef(false);

    // Custom close handler that properly cleans up camera
    const handleClose = useCallback(async () => {
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

        // Navigate back if we pushed history
        if (hasHistoryPushed.current) {
            hasHistoryPushed.current = false;
            window.history.back();
        } else if (onClose) {
            onClose();
        }
    }, [onClose]);

    // Handle browser back button
    useEffect(() => {
        if (show) {
            // Push history state when modal opens
            if (!hasHistoryPushed.current) {
                window.history.pushState({ modal: 'qr-scanner' }, '');
                hasHistoryPushed.current = true;
            }

            const handlePopState = async () => {
                hasHistoryPushed.current = false;
                // Clean up camera
                const currentScanner = scannerRef.current;
                if (currentScanner) {
                    try {
                        await currentScanner.clear();
                        scannerRef.current = null;
                    } catch (err) {
                        console.error("Gagal mematikan kamera:", err);
                        scannerRef.current = null;
                    }
                }
                if (onClose) onClose();
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        } else {
            hasHistoryPushed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

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

    if (!shouldRender) return null;
    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-backdrop-centered ${animationClass}`}
            onClick={handleClose}
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
                    <button onClick={handleClose} className="btn-cancel">Batal</button>
                </div>
            </div>
        </div>
    );
}

export default QrScannerModal;