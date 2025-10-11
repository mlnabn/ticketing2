import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select from 'react-select';
import api from '../services/api';

// Custom hook untuk listener scanner
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

function AssignAdminModal({ ticket, admins, onAssign, onClose, showToast }) {
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [itemsToAssign, setItemsToAssign] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);

    const isDarkMode = document.body.classList.contains('dark-mode');
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
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
            backgroundColor: isDarkMode ? '#2d3748' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ccc',
            borderRadius: "10px",
        }),
        option: (provided, state) => ({
            ...provided,
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
        setSearchCode(''); // Kosongkan input setelah berhasil
    }, [itemsToAssign, showToast]);

    // Fungsi yang menangani pencarian via scan atau ketik manual
    const findItem = useCallback(async (code) => {
        if (!code) return;
        setIsSearching(true);
        try {
            const res = await api.get(`/inventory/stock-items/find-available/${code}`);
            addItemToList(res.data);
        } catch (error) {
            showToast(error.response?.data?.message || `Kode "${code}" tidak ditemukan.`, 'error');
        } finally {
            setIsSearching(false);
            searchInputRef.current?.focus();
        }
    }, [addItemToList, showToast]);
    
    // Aktifkan listener scanner
    useScannerListener(findItem, !!ticket);

    const handleRemoveItem = (itemId) => {
        setItemsToAssign(prev => prev.filter(item => item.id !== itemId));
    };

    const handleSubmit = () => {
        if (!selectedAdminId) {
            showToast('Pilih salah satu admin.', 'info');
            return;
        }
        const stokIds = itemsToAssign.map(item => item.id);
        onAssign(ticket.id, selectedAdminId, stokIds);
    };
    
    const adminOptions = admins.map(admin => ({ value: admin.id, label: admin.name }));

    return (
        <div className="confirmation-modal-backdrop">
            <div className="confirmation-modal-content">
                <h3>Ticket "{ticket.title}"</h3>
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
                    <div className="scan-input-group">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Scan QR atau ketik kode unik/S-N..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); findItem(searchCode); }}}
                        />
                        <button onClick={() => findItem(searchCode)} disabled={isSearching}>
                            {isSearching ? '...' : 'Tambah'}
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
                    <button onClick={onClose} className="btn-cancel">Batal</button>
                    <button onClick={handleSubmit} className="btn-confirm">Kerjakan</button>
                </div>
            </div>
        </div>
    );
}

export default AssignAdminModal;