import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import api from '../services/api';
import QrPrintSheet from './QrPrintSheet';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

/* ===========================================================
   Custom Components for Color Select 
=========================================================== */
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
   Initial State
=========================================================== */
const today = new Date().toISOString().split('T')[0];

const initialFormState = {
    master_barang_id: null,
    jumlah: 1,
    harga_beli: '',
    kondisi: 'Baru',
    id_warna: null,
    tanggal_pembelian: today,
    tanggal_masuk: today,
    serial_numbers: [''],
};

/* ===========================================================
   Barcode Scanner Hook
=========================================================== */
const useScannerListener = (onScan, isOpen) => {
    useEffect(() => {
        if (!isOpen) return;

        let barcode = '';
        let interval;

        const handleKeyDown = (e) => {
            if (
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.tagName === 'SELECT'
            ) {
                if (e.key === 'Enter' && e.target.closest('.creatable-select')) return;
            }

            if (typeof e.key !== 'string') return;

            if (interval) clearInterval(interval);

            if (e.key === 'Enter') {
                if (barcode.length > 3) {
                    onScan(barcode.trim());
                }
                barcode = '';
                return;
            }

            if (e.key.length === 1) barcode += e.key;
            interval = setInterval(() => (barcode = ''), 50);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan, isOpen]);
};

/* ===========================================================
   Main Component
=========================================================== */
function AddStockModal({ show, isOpen, onClose, onSaveSuccess, showToast, itemToPreselect }) {
    const [view, setView] = useState('form');
    const [newlyCreatedItems, setNewlyCreatedItems] = useState([]);
    const printRef = useRef();
    const isScanningRef = useRef(false);
    const [formData, setFormData] = useState(initialFormState);
    const [displayHarga, setDisplayHarga] = useState('');
    const [masterBarangOptions, setMasterBarangOptions] = useState([]);
    const [colorOptions, setColorOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSerialIndex, setActiveSerialIndex] = useState(0);
    const serialInputRefs = useRef([]);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [selectedMasterBarang, setSelectedMasterBarang] = useState(null);

    // Handle browser back button
    const handleClose = useModalBackHandler(show, onClose, 'add-stock');


    useEffect(() => {
        if (show) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
                setView('form');
                setFormData(initialFormState);
                setDisplayHarga('');
                setNewlyCreatedItems([]);
                setActiveSerialIndex(0);
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, shouldRender]);

    /* ---------------- Barcode Scanner ---------------- */
    const handleScan = useCallback(
        async (scannedSerial) => {
            isScanningRef.current = true;
            const trimmedSerial = scannedSerial.trim();
            const count = formData.serial_numbers.length;

            if (activeSerialIndex < count) {
                const otherSerials = formData.serial_numbers
                    .filter((_, i) => i !== activeSerialIndex)
                    .map(sn => sn.trim());

                if (otherSerials.includes(trimmedSerial)) {
                    showToast(`Serial Number "${trimmedSerial}" ganda di form ini.`, 'error');
                    const newSerials = [...formData.serial_numbers];
                    newSerials[activeSerialIndex] = '';
                    setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));
                    return;
                }
                const isExistsInDb = await checkSnOnServer(trimmedSerial);

                if (isExistsInDb) {
                    showToast(`Serial Number "${trimmedSerial}" SUDAH ADA di database!`, 'error');
                    const newSerials = [...formData.serial_numbers];
                    newSerials[activeSerialIndex] = '';
                    setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));

                    setTimeout(() => { isScanningRef.current = false; }, 300);
                    return;
                }

                const newSerials = [...formData.serial_numbers];
                newSerials[activeSerialIndex] = trimmedSerial;
                setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));

                const emptyIndex = newSerials.findIndex(sn => sn.trim() === '');

                if (emptyIndex !== -1) {
                    setActiveSerialIndex(emptyIndex);
                } else {
                    showToast(
                        'Semua Serial Number sudah terisi. Tambah jumlah atau simpan sebelum scan lagi.',
                        'warning'
                    );
                    setActiveSerialIndex(count - 1);
                }
            } else {
                showToast(
                    'Slot serial number penuh. Tambah jumlah atau simpan terlebih dahulu.',
                    'warning'
                );
                return;

            }
            setTimeout(() => {
                isScanningRef.current = false;
            }, 300);
        },
        [activeSerialIndex, formData.serial_numbers, showToast]
    );

    const blockEnterSubmit = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const handleSerialBlur = async (index, value) => {
        if (isScanningRef.current) return;
        const trimmedValue = value.trim();
        if (!trimmedValue) return;
        const isExistsInDb = await checkSnOnServer(trimmedValue);

        if (isExistsInDb) {
            showToast(`Serial Number "${trimmedValue}" SUDAH ADA di database!`, 'error');
            const newSerials = [...formData.serial_numbers];
            newSerials[index] = '';
            setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));
        }
    };

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

    useScannerListener(handleScan, show);

    const submitButtonRef = useRef(null);

    /* ---------------- Focus Handler ---------------- */
    useEffect(() => {
        if (show) {
            if (activeSerialIndex >= 0 && serialInputRefs.current[activeSerialIndex]) {
                serialInputRefs.current[activeSerialIndex].focus();
            } else if (activeSerialIndex === -1 && submitButtonRef.current) {
                submitButtonRef.current.focus();
            }
        }
    }, [show, activeSerialIndex]);

    useEffect(() => {
        if (!show) return;
        api.get('/inventory/items-flat?all=true').then((res) => {
            const data = res.data.data || res.data;
            const options = data.map((item) => ({
                value: item.id_m_barang,
                label: `${item.nama_barang} (${item.kode_barang})`,
            }));
            if (itemToPreselect) {
                const itemExists = options.some(opt => opt.value === itemToPreselect.value);
                if (!itemExists) {
                    options.unshift(itemToPreselect);
                }
                setMasterBarangOptions(options);
                setSelectedMasterBarang(itemToPreselect);
            } else {
                setMasterBarangOptions(options);
                setSelectedMasterBarang(null);
            }
        });
        api.get('/colors').then((res) => {
            const options = res.data.map((color) => ({
                value: color.id_warna,
                label: color.nama_warna,
                hex: color.kode_hex,
            }));
            setColorOptions(options);
        });
        setDisplayHarga('');
        setFormData(prev => ({
            ...initialFormState,
            master_barang_id: itemToPreselect ? itemToPreselect.value : null
        }));
        setActiveSerialIndex(0);
    }, [show, itemToPreselect]);



    useEffect(() => {
        const count = parseInt(formData.jumlah, 10) || 0;
        if (formData.serial_numbers.length !== count) {
            const newSerials = Array(count).fill('');
            const limit = Math.min(count, formData.serial_numbers.length);
            for (let i = 0; i < limit; i++) {
                newSerials[i] = formData.serial_numbers[i];
            }
            setFormData(prev => ({ ...prev, serial_numbers: newSerials }));
        }
    }, [formData.jumlah, formData.serial_numbers]);


    useEffect(() => {
        const count = parseInt(formData.jumlah, 10) || 0;
        if (activeSerialIndex >= count && count > 0) {
            setActiveSerialIndex(count - 1);
        } else if (count === 0 && activeSerialIndex !== 0) {
            setActiveSerialIndex(0);
        }
    }, [formData.jumlah, activeSerialIndex]);

    /* ---------------- Input Handlers ---------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'harga_beli') {
            const numericValue = parseRupiah(value);
            setFormData((prev) => ({ ...prev, harga_beli: numericValue }));
            setDisplayHarga(formatRupiah(numericValue));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleMasterBarangChange = (selectedOption) => {
        setSelectedMasterBarang(selectedOption);
        setFormData((prev) => ({
            ...prev,
            master_barang_id: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleSerialChange = (index, value) => {
        const trimmedValue = value.trim();

        const newSerials = [...formData.serial_numbers];

        if (trimmedValue !== '') {
            const otherSerials = formData.serial_numbers
                .filter((_, i) => i !== index)
                .map(sn => sn.trim());

            if (otherSerials.includes(trimmedValue)) {
                showToast(`Serial Number "${trimmedValue}" sudah ada di entri lain. Ganti dengan SN yang sesuai.`, 'error');
                newSerials[index] = '';
                setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));
                return;
            }
        }
        newSerials[index] = value;
        setFormData((prev) => ({ ...prev, serial_numbers: newSerials }));
    };

    const handleColorChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            id_warna: selectedOption ? selectedOption.value : null,
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filledSerials = formData.serial_numbers.filter(sn => sn && sn.trim() !== '');
        const serialSet = new Set(filledSerials);
        if (serialSet.size !== filledSerials.length) {
            showToast('Ada Serial Number ganda di form. Harap periksa kembali.', 'error');
            return;
        }
        const dataToSend = {
            ...formData,
            serial_numbers: filledSerials,
        };
        setIsLoading(true);
        try {
            const response = await api.post('/inventory/stock-items', dataToSend);
            setNewlyCreatedItems(response.data);
            setView('success');
            showToast('Stok baru berhasil ditambahkan.', 'success');
            onSaveSuccess();
        } catch (error) {
            const errorData = error.response?.data;
            let errorMessage = 'Gagal menambah stok.';
            if (error.response?.status === 422 && errorData?.errors) {
                const serialErrorKey = Object.keys(errorData.errors).find(key =>
                    key.startsWith('serial_numbers.')
                );

                if (serialErrorKey) {
                    const errorIndex = parseInt(serialErrorKey.split('.')[1], 10);
                    const failedSerial = formData.serial_numbers[errorIndex];
                    errorMessage = `Serial Number "${failedSerial}" sudah ada di daftar barang (terdaftar di database). Ganti serial number baru.`;
                    setFormData(prev => {
                        const newSerials = [...prev.serial_numbers];
                        newSerials[errorIndex] = '';
                        return { ...prev, serial_numbers: newSerials };
                    });
                    setActiveSerialIndex(errorIndex);

                } else {
                    errorMessage = errorData.message || errorData.errors[Object.keys(errorData.errors)[0]][0] || errorMessage;
                }
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            }

            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!shouldRender) return null;
    const animationClass = isClosing ? 'closing' : '';

    return (
        <>
            <div
                className={`modal-backdrop-detail ${animationClass}`}
                onClick={handleClose}
            >
                <div
                    className={`modal-content-detail ${animationClass}`}
                    onClick={e => e.stopPropagation()}
                >
                    {view === 'form' && (
                        <>
                            <h3>Tambah Stok Barang</h3>
                            <form onKeyDown={blockEnterSubmit} onSubmit={handleSubmit}>
                                <div className="form-group-half">
                                    <label>Pilih Barang (SKU)</label>
                                    <Select classNamePrefix="creatable-select"
                                        options={masterBarangOptions}
                                        value={selectedMasterBarang}
                                        onChange={handleMasterBarangChange}
                                        placeholder="Cari nama atau kode barang..."
                                        isClearable
                                    />
                                </div>
                                <div className="form-row2">
                                    <div className="form-group-half">
                                        <label>Jumlah</label>
                                        <input type="number" name="jumlah"
                                            value={formData.jumlah}
                                            onChange={handleChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group-half">
                                        <label>Harga Beli Satuan (Rp)</label>
                                        <input type="text" name="harga_beli"
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
                                        <Select classNamePrefix="creatable-select"
                                            options={colorOptions}
                                            value={colorOptions.find((opt) => opt.value === formData.id_warna)}
                                            onChange={handleColorChange}
                                            placeholder="Cari warna..."
                                            isClearable
                                            isSearchable
                                            components={{ Option: ColorOption, SingleValue: ColorSingleValue }}
                                        />
                                    </div>
                                </div>
                                <div className="form-row2">
                                    <div className="form-group-half">
                                        <label>Tanggal Pembelian</label>
                                        <input type="date" name="tanggal_pembelian"
                                            value={formData.tanggal_pembelian}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group-half">
                                        <label>Tanggal Masuk</label>
                                        <input type="date" name="tanggal_masuk"
                                            value={formData.tanggal_masuk}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group full">
                                    <label>Serial Number (Bisa di-scan)</label>
                                    <div className="serial-number-container">
                                        {formData.serial_numbers.map((sn, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (serialInputRefs.current[index] = el)}
                                                type="text"
                                                placeholder={`S/N #${index + 1}`}
                                                value={sn}
                                                onChange={(e) => handleSerialChange(index, e.target.value)}
                                                onBlur={(e) => handleSerialBlur(index, e.target.value)}

                                                onClick={() => setActiveSerialIndex(index)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        // handleSerialBlur(index, sn);

                                                        const nextIndex = index + 1;
                                                        if (nextIndex < formData.serial_numbers.length) {
                                                            setActiveSerialIndex(nextIndex);
                                                        } else {
                                                            e.target.blur();
                                                            setActiveSerialIndex(-1);
                                                        }
                                                    }
                                                }}
                                                className={`serial-number-input ${index === activeSerialIndex ? 'active-scan' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    {formData.serial_numbers.every(sn => sn.trim() !== '') && (
                                        <div className="sn-full-message" style={{ marginTop: '8px' }}>
                                            <small style={{ color: '#d9534f', fontWeight: 600 }}>
                                                Semua Serial Number sudah terisi. Klik simpan atau tambah jumlah jika ingin scan lagi.
                                            </small>
                                        </div>
                                    )}

                                </div>
                                <div className="confirmation-modal-actions">
                                    <button type="button" onClick={handleClose} className="btn-cancel">Batal</button>
                                    <button type="submit" className="btn-confirm" disabled={isLoading} ref={submitButtonRef}>Simpan</button>
                                </div>
                            </form>
                        </>
                    )}

                    {view === 'success' && (
                        <div className="success-view" style={{ textAlign: 'center', padding: '20px' }}>
                            <h3>Stok Berhasil Ditambahkan!</h3>
                            <p>{newlyCreatedItems.length} unit barang baru telah ditambahkan ke inventaris.</p>
                            <p style={{ marginTop: '20px' }}>Anda bisa langsung mencetak label QR Code untuk ditempelkan pada unit barang.</p>

                            <div className="confirmation-modal-actions" style={{ marginTop: '30px' }}>
                                <button onClick={handleClose} className="btn-cancel">Tutup</button>
                                <button onClick={handlePrint} className="btn-confirm">
                                    <i className="fas fa-print" style={{ marginRight: '8px' }}></i>
                                    Print QR Codes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {createPortal(
                <QrPrintSheet ref={printRef} items={newlyCreatedItems} />,
                document.getElementById('print-portal')
            )}
            <QrPrintSheet ref={printRef} items={newlyCreatedItems} />
        </>
    );
}

export default AddStockModal;