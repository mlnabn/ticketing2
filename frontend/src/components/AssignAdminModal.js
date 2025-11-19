import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import api from '../services/api';
import QrScannerModal from './QrScannerModal';


const useScannerListener = (onScan, isOpen) => {
    useEffect(() => {
        if (!isOpen) return;
        let barcode = '';
        let interval;
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            if (typeof e.key !== 'string') return;
            if (interval) clearInterval(interval);
            if (e.key === 'Enter') {
                if (barcode.length > 2) onScan(barcode.trim());
                barcode = '';
                return;
            }
            if (e.key.length === 1) barcode += e.key;
            interval = setInterval(() => barcode = '', 50);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan, isOpen]);
};

function AssignAdminModal({ ticket, admins, onAssign, onClose, showToast, show }) {
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [itemsToAssign, setItemsToAssign] = useState([]);
    const [selectKey, setSelectKey] = useState(Date.now());
    const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentTicket, setCurrentTicket] = useState(ticket); 

    useEffect(() => {
        if (show) {
            setCurrentTicket(ticket); 
            setShouldRender(true);
            setIsClosing(false); 
        } else if (shouldRender && !isClosing) {
            setIsClosing(true); 
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false); 
                setSelectedAdminId(null);
                setItemsToAssign([]);
            }, 300); 
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, ticket, shouldRender]);

    const isDarkMode = document.body.classList.contains('dark-mode');
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            cursor: 'text',
            backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.7)' : '#fff',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#ccc',
            borderRadius: "10px",
            minHeight: "45px",
            boxShadow: state.isFocused ? (isDarkMode ? '0 0 0 1px #3b82f6' : '0 0 0 1px #2563eb') : 'none',
            '&:hover': {
                borderColor: isDarkMode ? '#3b82f6' : '#2563eb',
            }
        }),
        input: (provided) => ({ ...provided, color: isDarkMode ? '#e2e8f0' : '#333' }),
        placeholder: (provided) => ({ ...provided, color: isDarkMode ? '#a0aec0' : '#aaa' }),
        singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#e2e8f0' : '#333' }),
        menu: (provided) => ({
            ...provided,
            cursor: 'pointer',
            backgroundColor: isDarkMode ? '#2d3748' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ccc',
            borderRadius: "10px",
        }),
        option: (provided, state) => ({
            ...provided,
            cursor: 'pointer',
            color: isDarkMode ? '#e2e8f0' : '#333',
            backgroundColor: state.isFocused ? (isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#e9f2ff') : 'transparent',
            '&:active': {
                backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                color: '#fff'
            },
        }),
        indicatorSeparator: () => ({ display: 'none' }),
    };

    // Fungsi untuk menambah item ke daftar
    const addItemToList = useCallback((item) => {
        // Cek duplikat
        if (itemsToAssign.some(existing => existing.id === item.id)) {
            showToast(`Barang "${item.kode_unik}" sudah ada dalam daftar.`, 'warning');
            return;
        }
        setItemsToAssign(prev => [...prev, item]);
        setSelectKey(Date.now());
    }, [itemsToAssign, showToast]);

    const handleScan = useCallback(async (code) => {
        if (!code) return;
        try {
            const res = await api.get(`/inventory/stock-items/find-available/${code}`);
            addItemToList(res.data);
        } catch (error) {
            showToast(error.response?.data?.message || `Kode "${code}" tidak ditemukan.`, 'error');
        }
    }, [addItemToList, showToast]);
    
    useScannerListener(handleScan, show);

    const handleCameraScanSuccess = (decodedText) => {
        setIsCameraScannerOpen(false);
        handleScan(decodedText);  
    };

    const loadOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];

        try {
            const response = await api.get('/inventory/stock-items/search-available', {
                params: { search: inputValue }
            });

            return response.data.map(item => ({
                value: item,
                label: `${item.master_barang.nama_barang} (${item.kode_unik})`
            }));
        } catch (error) {
            console.error("Gagal mencari barang:", error);
            return [];
        }
    };

    const handleRemoveItem = (itemId) => {
        setItemsToAssign(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = () => {
        if (!selectedAdminId) {
            showToast('Pilih salah satu admin.', 'info');
            return;
        }
        const stokIds = itemsToAssign.map(item => item.id);
        onAssign(currentTicket.id, selectedAdminId, stokIds);
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };
    
    const adminOptions = admins.map(admin => ({ value: admin.id, label: admin.name }));

    if (!shouldRender) return null;
    if (!currentTicket) return null;

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div 
            className={`confirmation-modal-backdrop ${animationClass}`}
            onClick={handleCloseClick}
        >
            <div 
                className={`confirmation-modal-content ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <h3>Ticket "{currentTicket.title}"</h3>
                <div className="form-group-AssignAdmin">
                    <label className="modal-label">Dikerjakan Oleh</label>
                    <Select
                        options={adminOptions}
                        onChange={(opt) => setSelectedAdminId(opt.value)}
                        placeholder="Pilih Admin..."
                        styles={selectStyles}
                        className="admin-select"
                    />
                </div>

                <div className="form-group-AssignAdmin">
                    <label className="modal-label">Barang yang Dibawa (Scan atau Ketik Kode)</label>
                    <div className="input-with-button-wrapper">
                        <AsyncSelect className="async-select-main"
                            key={selectKey}
                            cacheOptions
                            loadOptions={loadOptions}
                            defaultOptions
                            placeholder="Ketik Nama, Kode SKU, atau S/N..."
                            onChange={(selectedOption) => addItemToList(selectedOption.value)}
                            styles={selectStyles}
                            noOptionsMessage={() => 'Ketik untuk mencari barang...'}
                            loadingMessage={() => 'Mencari...'}
                        />
                        <button 
                            type="button" 
                            className="btn-icon-only btn-scan-camera"
                            onClick={() => setIsCameraScannerOpen(true)}
                            title="Pindai dengan Kamera"
                        >
                            <i className="fas fa-qrcode"></i>
                        </button>
                    </div>
                </div>

                <div className="assigned-items-list-scan">
                    {itemsToAssign.length === 0 && <p className="empty-list-text">Belum ada barang yang ditambahkan.</p>}
                    {itemsToAssign.map(item => (
                        <div key={item.id} className="assigned-item-row-scan">
                            <span>{item.master_barang.nama_barang} ({item.kode_unik})</span>
                            <button onClick={() => handleRemoveItem(item.id)} className="btn-remove-item">&times;</button>
                        </div>
                    ))}
                </div>

                <div className="confirmation-modal-actions">
                    <button onClick={handleCloseClick} className="btn-cancel">Batal</button>
                    <button onClick={handleSubmit} className="btn-confirm">Kerjakan</button>
                </div>
            </div>
            <QrScannerModal
                show={isCameraScannerOpen}
                onClose={() => setIsCameraScannerOpen(false)}
                onScanSuccess={handleCameraScanSuccess}
            />
        </div>
    );
}

export default AssignAdminModal;