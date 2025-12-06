import React, { useState, useEffect, useRef } from 'react'; 
import Select from 'react-select';
import api from '../services/api';

const ColorOption = (props) => (
    <div
        {...props.innerProps}
        className={`color-select__option ${props.isFocused ? 'color-select__option--is-focused' : ''} ${props.isSelected ? 'color-select__option--is-selected' : ''}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            cursor: 'pointer',
        }}
    >
        <span
            className="color-select__swatch"
            style={{
                width: '20px',
                height: '20px',
                backgroundColor: props.data.hex,
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: '10px',
            }}
        ></span>
        <span className="color-select__label">{props.data.label}</span>
    </div>
);

const ColorSingleValue = (props) => (
    <div
        {...props.innerProps}
        className="color-select__single-value"
        style={{ display: 'flex', alignItems: 'center' }}
    >
        <span
            className="color-select__swatch"
            style={{
                width: '18px',
                height: '18px',
                backgroundColor: props.data.hex,
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: '8px',
            }}
        ></span>
        <span className="color-select__label">{props.data.label}</span>
    </div>
);

const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || angka === '') return '';
    return new Intl.NumberFormat('id-ID').format(angka);
};

const parseRupiah = (rupiah) => {
    if (typeof rupiah !== 'string') return rupiah;
    return parseInt(rupiah.replace(/\./g, ''), 10) || 0;
};

function EditStokBarangModal({ show, isOpen, onClose, item, onSaveSuccess, showToast, colorOptions }) {
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
    const serialInputRef = useRef(null);
    const [currentItem, setCurrentItem] = useState(item);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);

    useEffect(() => {
        if (show) {
            setCurrentItem(item);
            setShouldRender(true);
            setIsClosing(false);
            setTimeout(() => {
                if (serialInputRef.current) serialInputRef.current.focus();
            }, 100);
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, item, shouldRender]);

    useEffect(() => {
        if (currentItem) {
            setFormData({
                serial_number: currentItem.serial_number || '',
                status_id: currentItem.status_id || '',
                tanggal_pembelian: currentItem.tanggal_pembelian ? currentItem.tanggal_pembelian.split('T')[0] : '',
                tanggal_masuk: currentItem.tanggal_masuk ? currentItem.tanggal_masuk.split('T')[0] : '',
                harga_beli: currentItem.harga_beli || 0,
                kondisi: currentItem.kondisi || 'Baru',
                id_warna: currentItem.id_warna || null
            });
            setDisplayHarga(formatRupiah(currentItem.harga_beli));
        }
    }, [currentItem]);

    const checkSnOnServer = async (serial) => {
        if (!serial) return false;
        try {
            const response = await api.post('/inventory/check-sn-availability', {
                serial_number: serial
            });
            return response.data.exists;
        } catch (error) {
            console.error("Gagal validasi SN:", error);
            return false;
        }
    };

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
    const blockEnterSubmit = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur(); 
        }
    };

    const handleSerialBlur = async (e) => {
        const val = e.target.value.trim();
        if (!val) return;
        if (currentItem && val === currentItem.serial_number) {
            return;
        }

        const isExists = await checkSnOnServer(val);

        if (isExists) {
            showToast(`Serial Number "${val}" SUDAH ADA di database (milik barang lain)!`, 'error');
            setFormData(prev => ({ ...prev, serial_number: '' }));
            if (serialInputRef.current) {
                serialInputRef.current.focus();
            }
        }
    };

    const handleColorChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, id_warna: selectedOption ? selectedOption.value : null }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.serial_number) {
            showToast('Serial Number tidak boleh kosong.', 'error');
            if (serialInputRef.current) serialInputRef.current.focus();
            return;
        }

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

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    if (!shouldRender) return null;

    const animationClass = isClosing ? 'closing' : '';

    const colorOptionsForSelect = colorOptions.map(color => ({
        value: color.id_warna,
        label: color.nama_warna,
        hex: color.kode_hex
    }));

    return (
        <div
            className={`modal-backdrop-centered ${animationClass}`}
            onClick={handleCloseClick}
        >
            <div
                className={`modal-content-large ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >
                <h3>Edit Detail Stok: {currentItem?.kode_unik}</h3>
                <p style={{ marginTop: '-1rem', marginBottom: '1.5rem', color: '#6c757d' }}>
                    {currentItem?.master_barang?.nama_barang}
                </p>
                <form onSubmit={handleSave} onKeyDown={blockEnterSubmit}>
                    <div className="form-row2">
                        <div className="form-group-half">
                            <label>Serial Number</label>
                            <input
                                ref={serialInputRef}
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                onBlur={handleSerialBlur}
                                autoComplete="off"
                            />
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
                            <label>Kondisi</label>
                            <Select
                                classNamePrefix="custom-select-kondisi"
                                options={[
                                    { value: 'Baru', label: 'Baru' },
                                    { value: 'Bekas', label: 'Bekas' }
                                ]}
                                value={{ value: formData.kondisi, label: formData.kondisi }}
                                onChange={(selectedOption) => {
                                    handleChange({ target: { name: 'kondisi', value: selectedOption.value } });
                                }}
                                placeholder="Pilih Kondisi"
                                isSearchable={false}
                            />

                        </div>
                        <div className="form-group-half">
                            <label>Warna</label>
                            <Select
                                classNamePrefix="creatable-select"
                                options={colorOptionsForSelect}
                                value={colorOptionsForSelect.find((opt) => opt.value === formData.id_warna)}
                                onChange={handleColorChange}
                                placeholder="Pilih atau cari warna..."
                                isClearable
                                isSearchable
                                components={{ Option: ColorOption, SingleValue: ColorSingleValue }}
                                styles={{
                                    control: (base) => ({ ...base, minHeight: '44px' }),
                                    valueContainer: (base) => ({ ...base, padding: '2px 12px' }),
                                }}
                            />
                        </div>
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
                        <button type="button" onClick={handleCloseClick} className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-confirm" disabled={isLoading}>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStokBarangModal;