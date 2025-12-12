import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook untuk mengelola state modal dengan URL routing.
 * Memungkinkan browser back button untuk menutup modal.
 * 
 * @param {string} modalName - Nama unik untuk modal (akan disimpan di query param)
 * @returns {Object} - { isOpen, modalId, openModal, closeModal }
 * 
 * @example
 * const { isOpen, modalId, openModal, closeModal } = useModalRoute('ticket-detail');
 * 
 * // Buka modal dengan ID
 * openModal(item.id);
 * 
 * // Buka modal tanpa ID
 * openModal();
 * 
 * // Tutup modal
 * closeModal();
 */
export function useModalRoute(modalName) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Cek apakah modal ini sedang terbuka
    const isOpen = searchParams.get('modal') === modalName;

    // Ambil ID dari query param (jika ada)
    const modalId = searchParams.get('id');

    // Fungsi untuk membuka modal
    const openModal = useCallback((id = null) => {
        const params = new URLSearchParams(searchParams);
        params.set('modal', modalName);
        if (id !== null && id !== undefined) {
            params.set('id', String(id));
        } else {
            params.delete('id');
        }
        // replace: false agar bisa back
        setSearchParams(params, { replace: false });
    }, [modalName, searchParams, setSearchParams]);

    // Fungsi untuk menutup modal
    const closeModal = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete('modal');
        params.delete('id');
        // replace: true agar tidak menambah history entry saat close
        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);

    // Handle popstate (browser back/forward button) - cleanup saat component unmount
    useEffect(() => {
        const handlePopState = () => {
            // React Router akan handle ini secara otomatis
            // Effect ini untuk memastikan state konsisten
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return { isOpen, modalId, openModal, closeModal };
}

/**
 * Helper hook untuk modal yang membutuhkan data tambahan selain ID
 * Menyimpan data di sessionStorage untuk persistensi saat page refresh
 * 
 * @param {string} modalName - Nama unik untuk modal
 * @returns {Object} - { isOpen, modalData, openModal, closeModal }
 */
export function useModalRouteWithData(modalName) {
    const { isOpen, modalId, openModal: baseOpenModal, closeModal: baseCloseModal } = useModalRoute(modalName);

    // Key untuk sessionStorage
    const storageKey = `modal_data_${modalName}`;

    // Ambil data dari sessionStorage
    const getModalData = useCallback(() => {
        try {
            const stored = sessionStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }, [storageKey]);

    // Buka modal dengan data
    const openModal = useCallback((id = null, data = null) => {
        if (data) {
            sessionStorage.setItem(storageKey, JSON.stringify(data));
        }
        baseOpenModal(id);
    }, [baseOpenModal, storageKey]);

    // Tutup modal dan bersihkan data
    const closeModal = useCallback(() => {
        sessionStorage.removeItem(storageKey);
        baseCloseModal();
    }, [baseCloseModal, storageKey]);

    return {
        isOpen,
        modalId,
        modalData: isOpen ? getModalData() : null,
        openModal,
        closeModal
    };
}

export default useModalRoute;
