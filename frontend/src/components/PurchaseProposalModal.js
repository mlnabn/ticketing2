import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CreatableSelect from 'react-select/creatable';
import ItemFormModal from './ItemFormModal'; 

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID').format(angka);
const parseRupiah = (rupiah) => parseInt(rupiah.replace(/\./g, ''), 10) || 0;

function PurchaseProposalModal({ show, onClose, onSaveSuccess, showToast }) {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    // State utama
    const [title, setTitle] = useState('');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State untuk Form Tambah Item
    const [masterBarangOptions, setMasterBarangOptions] = useState([]);
    const [selectedBarang, setSelectedBarang] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [displayEstimatedPrice, setDisplayEstimatedPrice] = useState('');
    const [link, setLink] = useState('');
    const [notes, setNotes] = useState('');

    // State untuk Modal SKU (Modal di dalam Modal)
    const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
    const [newSkuName, setNewSkuName] = useState('');

    // Efek untuk animasi tutup/buka
    useEffect(() => {
        if (show) {
            setShouldRender(true);
            setIsClosing(false);
            api.get('/inventory/items-flat?all=true').then((res) => {
                const data = res.data.data || res.data;
                const options = data.map((item) => ({
                    value: item.id_m_barang,
                    label: `${item.nama_barang} (${item.kode_barang})`,
                    itemData: item,
                }));
                setMasterBarangOptions(options);
            });
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
                setTitle('');
                setItems([]);
                setSelectedBarang(null);
                setQuantity(1);
                setDisplayEstimatedPrice('');
                setLink('');
                setNotes('');
            }, 300);
        }
    }, [show, shouldRender, isClosing]);

    // Fungsi untuk menambah item ke daftar
    const handleAddItem = (e) => {
        e.preventDefault();
        if (!selectedBarang || !quantity || !displayEstimatedPrice) {
            showToast('Barang, Jumlah, dan Estimasi Harga wajib diisi.', 'warning');
            return;
        }

        const newItem = {
            id: selectedBarang.value,
            master_barang_id: selectedBarang.value,
            nama_barang: selectedBarang.label,
            quantity: parseInt(quantity, 10),
            estimated_price: parseRupiah(displayEstimatedPrice),
            link: link,
            notes: notes,
        };

        // Cek duplikat
        if (items.find(item => item.id === newItem.id)) {
            showToast('Barang ini sudah ada di daftar.', 'warning');
            return;
        }

        setItems(prev => [...prev, newItem]);
        
        // Reset form tambah item
        setSelectedBarang(null);
        setQuantity(1);
        setDisplayEstimatedPrice('');
        setLink('');
        setNotes('');
    };

    // Fungsi untuk menghapus item dari daftar
    const handleRemoveItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handlePriceChange = (e) => {
        const { value } = e.target;
        const numericValue = parseRupiah(value);
        setDisplayEstimatedPrice(formatRupiah(numericValue));
    };

    const handleCreateNewSKU = (inputValue) => {
        setNewSkuName(inputValue); 
        setIsSkuModalOpen(true);
    };

    const handleSkuSaveSuccess = (newMasterBarang) => {
        setIsSkuModalOpen(false);
        showToast(`SKU Baru "${newMasterBarang.nama_barang}" berhasil dibuat.`, 'success');

        const newOption = {
            value: newMasterBarang.id_m_barang,
            label: `${newMasterBarang.nama_barang} (${newMasterBarang.kode_barang})`,
            itemData: newMasterBarang,
        };

        setMasterBarangOptions(prev => [newOption, ...prev]);
        setSelectedBarang(newOption);
    };

    const handleSkuApiSave = async (formData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/inventory/items', formData);
            handleSkuSaveSuccess(response.data);
        } catch (e) {
            console.error('Gagal menyimpan SKU baru:', e);
            const errorMsg = e.response?.data?.message || 'Gagal menyimpan SKU baru.';
            showToast(errorMsg, 'error');
            setIsSkuModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmitProposal = async () => {
        if (!title || items.length === 0) {
            showToast('Judul dan minimal 1 barang wajib diisi.', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            const payload = { title, items };
            const response = await api.post('/purchase-proposals', payload);
            showToast('Catatan pengajuan berhasil disimpan.', 'success');
            onSaveSuccess(response.data); 
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menyimpan catatan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!shouldRender) return null;
    const animationClass = isClosing ? 'closing' : '';

    return (
        <>
            <div className={`modal-backdrop-detail ${animationClass}`} onClick={onClose}>
                <div className={`modal-content-large ${animationClass}`} onClick={e => e.stopPropagation()}>
                    {/* <button onClick={onClose} className="modal-close-btn">&times;</button> */}
                    <h3>Buat Catatan Pengajuan Baru</h3>

                    <div className="form-group full">
                        <label>Judul Catatan</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Mis: Belanja Kebutuhan Q4 2025" 
                        />
                    </div>

                    <div className="items-to-return-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {items.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Belum ada barang yang ditambahkan.</p>
                        )}
                        {items.map(item => (
                            <div key={item.id} className="return-item-row" style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold' }}>{item.nama_barang}</span>
                                    <button onClick={() => handleRemoveItem(item.id)} className="btn-remove-item" title="Hapus item">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {item.quantity} unit @ {formatRupiah(item.estimated_price)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddItem} className="return-item-row" style={{ backgroundColor: 'var(--bg-color)', borderStyle: 'dashed' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Tambah Barang</h4>
                        <div className="form-group full">
                            <label>Nama Barang</label>
                            <CreatableSelect
                                classNamePrefix="creatable-select"
                                options={masterBarangOptions}
                                value={selectedBarang}
                                onChange={setSelectedBarang}
                                onCreateOption={handleCreateNewSKU}
                                placeholder="Cari atau Ketik Barang Baru..."
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                            />
                        </div>
                        <div className="form-row2">
                            <div className="form-group-half">
                                <label>Jumlah</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
                            </div>
                            <div className="form-group-half">
                                <label>Estimasi Harga Satuan (Rp)</label>
                                <input 
                                    type="text" 
                                    value={displayEstimatedPrice} 
                                    onChange={handlePriceChange} 
                                    placeholder="Mis: 1500000" 
                                />
                            </div>
                        </div>
                        <div className="form-group full">
                            <label>Link Referensi (Opsional)</label>
                            <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="form-group full">
                            <label>Keterangan (Opsional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" placeholder="Mis: Untuk kebutuhan workshop Canden"></textarea>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                            Tambahkan ke Catatan
                        </button>
                    </form>

                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="button" onClick={handleSubmitProposal} className="btn-confirm" disabled={isLoading || items.length === 0}>
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>

            <ItemFormModal
                show={isSkuModalOpen}
                onClose={() => setIsSkuModalOpen(false)}
                onSave={handleSkuApiSave}
                showToast={showToast}
                initialData={{ nama_barang: newSkuName }}
            />
        </>
    );
}

export default PurchaseProposalModal;