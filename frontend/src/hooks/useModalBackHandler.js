import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook untuk menangani browser back button pada modal.
 * Ketika modal terbuka, hook ini akan push history state.
 * Ketika user menekan back button, modal akan tertutup.
 * 
 * @param {boolean} isOpen - State apakah modal sedang terbuka
 * @param {function} onClose - Callback untuk menutup modal
 * @param {string} modalName - Nama unik modal (opsional, untuk debugging)
 * @returns {function} handleClose - Gunakan ini untuk menutup modal dengan benar
 */
export function useModalBackHandler(isOpen, onClose, modalName = 'modal') {
    const historyPushedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const onCloseRef = useRef(onClose);

    // Always keep onClose ref updated - this avoids dependency issues
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Single effect to handle both pushState and popstate listener
    // This ensures they are always in sync
    useEffect(() => {
        if (!isOpen) {
            // Modal is closed - reset state
            historyPushedRef.current = false;
            isProcessingRef.current = false;
            return;
        }

        // Modal is open - push history if not already done
        if (!historyPushedRef.current) {
            window.history.pushState({ modal: modalName }, '');
            historyPushedRef.current = true;
            isProcessingRef.current = false;
        }

        // Handler for back button
        const handlePopState = () => {
            if (historyPushedRef.current && !isProcessingRef.current) {
                // Ignore if we are back at THIS modal's state (e.g. child modal closed)
                if (window.history.state?.modal === modalName) {
                    return;
                }

                isProcessingRef.current = true;
                historyPushedRef.current = false;
                // Use ref to always get latest onClose without re-creating listener
                onCloseRef.current?.();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, modalName]);

    // Return a close handler that properly manages history
    const handleClose = useCallback(() => {
        if (isProcessingRef.current) return; // Prevent double close

        isProcessingRef.current = true;

        if (historyPushedRef.current) {
            historyPushedRef.current = false;
            // Go back to remove our pushed state
            // popstate will fire but isProcessingRef is true, so it won't call onClose again
            window.history.back();
        }

        // Always call onClose
        onCloseRef.current?.();
    }, []);

    return handleClose;
}

/**
 * Versi untuk modal yang tidak memiliki prop `show` (conditional render pattern)
 * Langsung push history saat mount dan cleanup saat unmount.
 * 
 * @param {function} onClose - Callback untuk menutup modal
 * @param {string} modalName - Nama unik modal
 * @returns {function} handleClose
 */
export function useModalBackHandlerOnMount(onClose, modalName = 'modal') {
    const historyPushedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const onCloseRef = useRef(onClose);

    // Keep onClose ref updated
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Push history on mount and add popstate listener
    useEffect(() => {
        if (!historyPushedRef.current) {
            window.history.pushState({ modal: modalName }, '');
            historyPushedRef.current = true;
        }

        const handlePopState = () => {
            if (historyPushedRef.current && !isProcessingRef.current) {
                if (window.history.state?.modal === modalName) {
                    return;
                }
                isProcessingRef.current = true;
                historyPushedRef.current = false;
                onCloseRef.current?.();
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [modalName]); // Only modalName in deps, not onClose

    const handleClose = useCallback(() => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;

        if (historyPushedRef.current) {
            historyPushedRef.current = false;
            window.history.back();
        }

        onCloseRef.current?.();
    }, []);

    return handleClose;
}

export default useModalBackHandler;
