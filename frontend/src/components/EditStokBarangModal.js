import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import api from '../services/api';

// PERBAIKAN 1: Pindahkan komponen kustom dan utility function ke luar dari main component
// Ini adalah praktik terbaik di React untuk mencegah re-render yang tidak perlu.

/* ===========================================================
   Custom Components for Color Select
=========================================================== */
const ColorOption = (props) => (
    <div
        {...props.innerProps}
        className={`color-select__option ${props.isFocused ? 'color-select__option--is-focused' : ''}`}
    >
        <span className="color-select__swatch" style={{ backgroundColor: props.data.hex }}></span>
        <span className="color-select__label">{props.data.label}</span>
    </div>
);

const ColorSingleValue = (props) => (
    <div {...props.innerProps} className="color-select__single-value">
        <span className="color-select__swatch" style={{ backgroundColor: props.data.hex }}></span>
        <span className="color-select__label">{props.data.label}</span>
    </div>
);

/* ===========================================================
   Utility Functions
=========================================================== */
const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === '') return '';
    return new Intl.NumberFormat('id-ID').format(angka);
};

const parseRupiah = (rupiah) => {
    if (typeof rupiah !== 'string') return rupiah;
    return parseInt(rupiah.replace(/\./g, ''), 10) || 0;
};

/* ===========================================================
   Main Component
=========================================================== */
function EditStokBarangModal({ isOpen, onClose, item, onSaveSuccess, showToast }) {
    const [formData, setFormData] = useState({
        serial_number: '',
        status_id: '',
        tanggal_pembelian: '',
        tanggal_masuk: '',
        harga_beli: 0,
        kondisi: 'Baru',
        id_warna: null,
    });
    const [displayHarga, setDisplayHarga] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);

    // --- Load data dropdown (statuses & colors) ---
    useEffect(() => {
        if (isOpen) {
            api.get('/statuses').then(res => setStatusOptions(res.data));
            api.get('/colors').then(res => {
                const options = res.data.map(color => ({
                    value: color.id_warna,
                    label: color.nama_warna,
                    hex: color.kode_hex
                }));
                setColorOptions(options);
            });
        }
    }, [isOpen]);

    // --- Isi form dengan data item yang akan diedit ---
    useEffect(() => {
        if (item) {
            setFormData({
                serial_number: item.serial_number || '',
                // PERBAIKAN 2: Gunakan status_id, bukan status
                status_id: item.status_id || '',
                tanggal_pembelian: item.tanggal_pembelian ? item.tanggal_pembelian.split('T')[0] : '',
                tanggal_masuk: item.tanggal_masuk ? item.tanggal_masuk.split('T')[0] : '',
                harga_beli: item.harga_beli || 0,
                kondisi: item.kondisi || 'Baru',
                id_warna: item.id_warna || null
            });
            setDisplayHarga(formatRupiah(item.harga_beli));
        }
    }, [item]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'harga_beli') {
            const numericValue = parseRupiah(value);
            setFormData(prev => ({ ...prev, harga_beli: numericValue }));
            setDisplayHarga(formatRupiah(numericValue));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleColorChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, id_warna: selectedOption ? selectedOption.value : null }));
    };

    // PERBAIKAN 3: Gunakan api.put() untuk update
    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put(`/inventory/stock-items/${item.id}`, formData);
            showToast('Detail stok berhasil diubah.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal update stok:", error);
            showToast(error.response?.data?.message || 'Gagal menyimpan perubahan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // PERBAIKAN 4: Standarisasi wrapper modal
        <div className="modal-backdrop-centered">
            <div className="modal-content-large">
                <h3>Edit Detail Stok: {item?.kode_unik}</h3>
                <p style={{ marginTop: '-1rem', marginBottom: '1.5rem', color: '#6c757d' }}>
                    {item?.master_barang?.nama_barang}
                </p>
                <form onSubmit={handleSave}>
                    {/* PERBAIKAN 5: Gunakan layout 2 kolom (form-row2) */}
                    <div className="form-row2">
                        <div className="form-group-half">
                            <label>Serial Number</label>
                            <input name="serial_number" value={formData.serial_number} onChange={handleChange} />
                        </div>
                        <div className="form-group-half">
                            <label>Harga Beli (Rp)</label>
                            <input
                                type="text"
                                name="harga_beli"
                                value={displayHarga}
                                onChange={handleChange}
                                placeholder="Contoh: 1500000"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row2">
                        <div className="form-group-half">
                            <label>Kondisi Barang</label>
                            <select name="kondisi" value={formData.kondisi} onChange={handleChange}>
                                <option value="Baru">Baru</option>
                                <option value="Bekas">Bekas</option>
                            </select>
                        </div>
                        <div className="form-group-half">
                            <label>Warna</label>
                            {/* PERBAIKAN 6: Sempurnakan CreatableSelect Warna */}
                            <CreatableSelect
                                classNamePrefix="creatable-select"
                                options={colorOptions}
                                value={colorOptions.find((opt) => opt.value === formData.id_warna)}
                                onChange={handleColorChange}
                                placeholder="Pilih warna..."
                                isClearable
                                components={{ Option: ColorOption, SingleValue: ColorSingleValue }}
                                styles={{
                                    control: (base) => ({ ...base, minHeight: '44px' }),
                                    valueContainer: (base) => ({ ...base, padding: '2px 12px' }),
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Status Stok</label>
                        <select name="status_id" value={formData.status_id} onChange={handleChange}>
                            <option value="">Pilih Status</option>
                            {statusOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.nama_status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row2">
                        <div className="form-group-half">
                            <label>Tanggal Pembelian</label>
                            <input type="date" name="tanggal_pembelian" value={formData.tanggal_pembelian} onChange={handleChange} />
                        </div>
                        <div className="form-group-half">
                            <label>Tanggal Masuk</label>
                            <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="confirmation-modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading}>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStokBarangModal;