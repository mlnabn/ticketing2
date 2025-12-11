import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import imageCompression from 'browser-image-compression';
import { FaCamera, FaImage } from 'react-icons/fa';
import api from '../services/api';
import EditStokBarangModal from './EditStokBarangModal';
import HistoryModal from './HistoryModal';

const initialFormData = {
    status_id: '',
    deskripsi: '',
    user_peminjam_id: '',
    workshop_id: '',
    teknisi_perbaikan_id: '',
    tanggal_mulai_perbaikan: '',
    tanggal_selesai_perbaikan: '',
    user_perusak_id: '',
    tanggal_rusak: '',
    user_penghilang_id: '',
    tanggal_hilang: '',
    tanggal_ketemu: '',
    tanggal_keluar: '',
};

function ItemDetailModal({
    show,
    item,
    onClose,
    onSaveSuccess,
    showToast,
    onEditClick,
    statusOptions,
    colorOptions,
    fetchData,
    pagination,
    currentFilters,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [users, setUsers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [stockByColor, setStockByColor] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentItem, setCurrentItem] = useState(item);

    /* --------------------------------------------------------------------------
       FIXED MODAL OPEN/CLOSE ANIMATION
    -------------------------------------------------------------------------- */

    useEffect(() => {
        if (show) {
            setCurrentItem(item);
            setShouldRender(true);
            setIsClosing(false);
            setImage(null);
            setPreview(null);
        } else if (shouldRender && !isClosing) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsClosing(false);
                setShouldRender(false);
                setIsEditing(false);
                setImage(null);
                setPreview(null);
            }, 300);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, item, shouldRender]);

    /* -------------------------------------------------------------------------- */

    useEffect(() => {
        if (currentItem) {
            setFormData({
                status_id: currentItem.status_id || '',
                deskripsi: currentItem.deskripsi || '',
                user_peminjam_id: currentItem.user_peminjam_id || '',
                workshop_id: currentItem.workshop_id || '',
                teknisi_perbaikan_id: currentItem.teknisi_perbaikan_id || '',
                tanggal_mulai_perbaikan:
                    currentItem.tanggal_mulai_perbaikan?.split(' ')[0] || '',
                tanggal_selesai_perbaikan:
                    currentItem.tanggal_selesai_perbaikan?.split(' ')[0] || '',
                user_perusak_id: currentItem.user_perusak_id || '',
                tanggal_rusak: currentItem.tanggal_rusak?.split(' ')[0] || '',
                user_penghilang_id: currentItem.user_penghilang_id || '',
                tanggal_hilang: currentItem.tanggal_hilang?.split(' ')[0] || '',
                tanggal_ketemu: currentItem.tanggal_ketemu?.split(' ')[0] || '',
                tanggal_keluar: currentItem.tanggal_keluar?.split(' ')[0] || '',
            });
        }
    }, [currentItem, isEditing]);

    useEffect(() => {
        if (isEditing) {
            api.get('/users?all=true').then((res) => setUsers(res.data));
            api
                .get('/workshops')
                .then((res) => setWorkshops(res.data.data || res.data));
        }
    }, [isEditing]);

    useEffect(() => {
        if (currentItem?.master_barang_id) {
            const fetchStockByColor = async () => {
                try {
                    const response = await api.get(
                        `/inventory/items/${currentItem.master_barang_id}/stock-by-color`
                    );
                    setStockByColor(response.data);
                } catch (error) {
                    console.error('Gagal mengambil rincian stok warna:', error);
                }
            };

            fetchStockByColor();
        }
    }, [currentItem]);

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0];

            if (!originalFile.type.startsWith('image/')) {
                showToast('Mohon upload file gambar.', 'error');
                return;
            }

            setIsCompressing(true);

            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                initialQuality: 0.7,
                fileType: 'image/jpeg',
            };

            try {
                const compressedFile = await imageCompression(
                    originalFile,
                    options
                );
                setImage(compressedFile);
                setPreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error('Gagal kompresi:', error);
                showToast('Gagal memproses gambar.', 'error');
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const selectedStatusName = useMemo(() => {
        if (isEditing) {
            const selectedStatus = statusOptions.find(
                (s) => s.id === Number(formData.status_id)
            );
            return selectedStatus ? selectedStatus.nama_status : '';
        }
        return currentItem?.status_detail?.nama_status;
    }, [formData.status_id, statusOptions, isEditing, currentItem]);

    if (!shouldRender || !currentItem) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        const dataToSend = new FormData();

        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== undefined) {
                dataToSend.append(key, formData[key]);
            }
        });

        if (selectedStatusName === 'Digunakan' && image) {
            dataToSend.append('bukti_foto', image);
        }

        try {
            await api.post(
                `/inventory/stock-items/${currentItem.id}/update-status`,
                dataToSend
            );

            showToast('Status barang berhasil diupdate.', 'success');
            onSaveSuccess();
            onClose();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || 'Gagal menyimpan.';
            showToast(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /* --------------------------------------------------------------------------
       CONDITIONAL INPUTS
    -------------------------------------------------------------------------- */

    const renderConditionalInputs = () => {
        if (!isEditing) return null;

        const commonDescription = (label) => (
            <div className="detail-field detail-full">
                <label className="detail-label">{label}</label>
                <textarea
                    name="deskripsi"
                    value={formData.deskripsi || ''}
                    onChange={handleChange}
                    rows="2"
                    className="detail-textarea"
                ></textarea>
            </div>
        );

        switch (selectedStatusName) {
            case 'Digunakan':
                return (
                    <div className="detail-field detail-full">
                        <div className="detail-detail">
                            <span className="detail-label">Digunakan Oleh</span>
                            <select
                                name="user_peminjam_id"
                                value={formData.user_peminjam_id}
                                onChange={handleChange}
                                className="detail-select"
                            >
                                <option value="">Pilih Pengguna</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <span className="detail-label">Di Workshop</span>
                            <select
                                name="workshop_id"
                                value={formData.workshop_id}
                                onChange={handleChange}
                                className="detail-select"
                            >
                                <option value="">Pilih Workshop</option>
                                {workshops.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <span className="detail-label">Tanggal Keluar</span>
                            <input
                                type="date"
                                name="tanggal_keluar"
                                value={formData.tanggal_keluar || ''}
                                onChange={handleChange}
                                className="detail-edit-input"
                                placeholder="Otomatis hari ini jika kosong"
                            />
                        </div>

                        {commonDescription('Deskripsi Peminjaman')}

                        <div className="detail-detail full-width" style={{ marginTop: 10 }}>
                            <span
                                className="detail-label"
                                style={{ marginBottom: 5, display: 'block' }}
                            >
                                Bukti Penggunaan (Foto)
                            </span>

                            <input
                                id="camera-input"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                disabled={isCompressing}
                                style={{ display: 'none' }}
                            />

                            <input
                                id="gallery-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isCompressing}
                                style={{ display: 'none' }}
                            />

                            <div
                                className="upload-options-container"
                                style={{ display: 'flex', gap: 10 }}
                            >
                                <label
                                    htmlFor="camera-input"
                                    className={`btn-upload-option btn-camera ${isCompressing ? 'disabled' : ''
                                        }`}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        background: '#e3f2fd',
                                        color: '#0d47a1',
                                        borderRadius: 6,
                                        border: '1px solid #90caf9',
                                        fontSize: '0.9rem',
                                        width: '100%',
                                    }}
                                >
                                    <FaCamera />
                                    <span>Ambil Foto</span>
                                </label>

                                <label
                                    htmlFor="gallery-input"
                                    className={`btn-upload-option btn-gallery ${isCompressing ? 'disabled' : ''
                                        }`}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        background: '#f3e5f5',
                                        color: '#7b1fa2',
                                        borderRadius: 6,
                                        border: '1px solid #ce93d8',
                                        fontSize: '0.9rem',
                                        width: '100%',
                                    }}
                                >
                                    <FaImage />
                                    <span>Galeri</span>
                                </label>
                            </div>

                            {isCompressing && (
                                <small>Sedang memproses gambar...</small>
                            )}

                            {preview && (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div
                                        style={{
                                            marginTop: 10,
                                            position: 'relative',
                                            width: 'fit-content',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{
                                                maxHeight: 400,
                                                borderRadius: 8,
                                                border: '1px solid #ddd',
                                            }}
                                        />
                                        <button
                                            className='close-btn'
                                            type="button"
                                            onClick={() => {
                                                setImage(null);
                                                setPreview(null);
                                            }}

                                        >
                                            x
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'Dipinjam':
                return (
                    <div className="detail-field detail-full">
                        <div className="detail-detail">
                            <label className="detail-label">
                                {selectedStatusName} Oleh
                            </label>
                            <select
                                name="user_peminjam_id"
                                className="detail-select"
                                value={formData.user_peminjam_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Pengguna</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Di Workshop</label>
                            <select
                                name="workshop_id"
                                className="detail-select"
                                value={formData.workshop_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Workshop</option>
                                {workshops.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tanggal Keluar</label>
                            <input
                                type="date"
                                name="tanggal_keluar"
                                className="detail-input"
                                value={formData.tanggal_keluar}
                                onChange={handleChange}
                            />
                        </div>

                        {commonDescription('Deskripsi Peminjaman')}
                    </div>
                );

            case 'Perbaikan':
                return (
                    <div className="detail-field detail-full">
                        <div className="detail-detail">
                            <label className="detail-label">
                                Teknisi Perbaikan
                            </label>
                            <select
                                name="teknisi_perbaikan_id"
                                className="detail-select"
                                value={formData.teknisi_perbaikan_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Teknisi</option>
                                {users
                                    .filter((u) => u.role === 'admin')
                                    .map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tgl Mulai</label>
                            <input
                                type="date"
                                name="tanggal_mulai_perbaikan"
                                className="detail-input"
                                value={formData.tanggal_mulai_perbaikan}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tgl Selesai</label>
                            <input
                                type="date"
                                name="tanggal_selesai_perbaikan"
                                className="detail-input"
                                value={formData.tanggal_selesai_perbaikan}
                                onChange={handleChange}
                            />
                        </div>

                        {commonDescription('Deskripsi Perbaikan')}
                    </div>
                );

            case 'Rusak':
                return (
                    <div className="detail-field detail-full">
                        <div className="detail-detail">
                            <label className="detail-label">
                                Dilaporkan oleh
                            </label>
                            <select
                                name="user_perusak_id"
                                className="detail-select"
                                value={formData.user_perusak_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Pengguna</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tgl Rusak</label>
                            <input
                                type="date"
                                name="tanggal_rusak"
                                className="detail-input"
                                value={formData.tanggal_rusak}
                                onChange={handleChange}
                            />
                        </div>

                        {commonDescription('Deskripsi Kerusakan')}
                    </div>
                );

            case 'Hilang':
                return (
                    <div className="detail-field detail-full">
                        <div className="detail-detail">
                            <label className="detail-label">
                                Terakhir Diketahui oleh
                            </label>
                            <select
                                name="user_penghilang_id"
                                className="detail-select"
                                value={formData.user_penghilang_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Pengguna</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tgl Hilang</label>
                            <input
                                type="date"
                                name="tanggal_hilang"
                                className="detail-input"
                                value={formData.tanggal_hilang}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="detail-detail">
                            <label className="detail-label">Tgl Ketemu</label>
                            <input
                                type="date"
                                name="tanggal_ketemu"
                                className="detail-input"
                                value={formData.tanggal_ketemu}
                                onChange={handleChange}
                            />
                        </div>

                        {commonDescription('Deskripsi Kehilangan')}
                    </div>
                );

            default:
                return commonDescription('Deskripsi');
        }
    };

    const animationClass = isClosing ? 'closing' : '';

    return (
        <div
            className={`modal-backdrop-centered ${animationClass}`}
            onClick={onClose}
        >
            <div
                className={`modal-content-large ${animationClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" onClick={onClose}>
                    &times;
                </button>

                <h3>
                    Detail Aset: {currentItem.master_barang?.nama_barang}
                </h3>

                <div className="item-detail-qr-top">
                    <QRCode
                        value={currentItem.kode_unik}
                        size={160}
                        level="H"
                    />
                    <strong>{currentItem.kode_unik}</strong>
                </div>

                <div className="item-detail-bottom-section">
                    <div className="detail-grid">

                        <div className="detail-field">
                            <label className="detail-label">Kondisi</label>
                            <span className="info-value-info">
                                {currentItem.kondisi}
                            </span>
                        </div>

                        <div className="detail-field">
                            <label className="detail-label">Harga Beli</label>
                            <span className="info-value-info">
                                {`Rp ${Number(currentItem.harga_beli).toLocaleString(
                                    'id-ID'
                                )}`}
                            </span>
                        </div>

                        <div className="detail-field">
                            <label className="detail-label">
                                Tanggal Pembelian
                            </label>
                            <span className="info-value-info">
                                {new Date(
                                    currentItem.tanggal_pembelian
                                ).toLocaleDateString('id-ID')}
                            </span>
                        </div>

                        <div className="detail-field">
                            <label className="detail-label">Status Stok</label>
                            {isEditing ? (
                                <select
                                    name="status_id"
                                    className="detail-select"
                                    value={formData.status_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Status</option>
                                    {statusOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.nama_status}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="info-value-info">
                                    {
                                        currentItem.status_detail
                                            ?.nama_status
                                    }
                                </span>
                            )}
                        </div>

                        {stockByColor.length > 0 && (
                            <div className="detail-field detail-full">
                                <label className="detail-label">
                                    Rincian Stok per Warna
                                </label>

                                <div className="stock-color-list">
                                    {stockByColor.map((s, i) => (
                                        <div
                                            key={i}
                                            className="stock-item"
                                        >
                                            <span>
                                                {s.nama_warna ||
                                                    'Tanpa Warna'}
                                            </span>
                                            <span>{s.total} unit</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isEditing && (
                            <>
                                {(currentItem.status_detail?.nama_status ===
                                    'Digunakan' ||
                                    currentItem.status_detail?.nama_status ===
                                    'Dipinjam') && (
                                        <>
                                            <div className="detail-field">
                                                <label className="detail-label">
                                                    Pemakai
                                                </label>
                                                <span className="info-value-info">
                                                    {currentItem.user_peminjam
                                                        ?.name || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="detail-field">
                                                <label className="detail-label">
                                                    Workshop
                                                </label>
                                                <span className="info-value-info">
                                                    {currentItem.workshop?.name ||
                                                        'N/A'}
                                                </span>
                                            </div>

                                            {currentItem.tanggal_keluar && (
                                                <div className="detail-field">
                                                    <label className="detail-label">
                                                        Tanggal Keluar
                                                    </label>
                                                    <span className="info-value-info">
                                                        {new Date(
                                                            currentItem.tanggal_keluar
                                                        ).toLocaleDateString(
                                                            'id-ID'
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                {currentItem.status_detail?.nama_status === 'Perbaikan' && (
                                    <>
                                        <div className="detail-field">
                                            <label className="detail-label">
                                                Teknisi
                                            </label>
                                            <span className="info-value-info">
                                                {currentItem.teknisi_perbaikan?.name || '-'}
                                            </span>
                                        </div>

                                        <div className="detail-field">
                                            <label className="detail-label">
                                                Tgl Mulai Perbaikan
                                            </label>
                                            <span className="info-value-info">
                                                {currentItem.tanggal_mulai_perbaikan
                                                    ? new Date(currentItem.tanggal_mulai_perbaikan).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </span>
                                        </div>

                                        <div className="detail-field">
                                            <label className="detail-label">
                                                Est. Selesai
                                            </label>
                                            <span className="info-value-info">
                                                {currentItem.tanggal_selesai_perbaikan
                                                    ? new Date(currentItem.tanggal_selesai_perbaikan).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {currentItem.status_detail?.nama_status === 'Rusak' && (
                                    <>
                                        <div className="detail-field">
                                            <label className="detail-label">Pelapor Rusak</label>
                                            <span className="info-value-info">
                                                {currentItem.user_perusak?.name || '-'}
                                            </span>
                                        </div>
                                        <div className="detail-field">
                                            <label className="detail-label">Tgl Rusak</label>
                                            <span className="info-value-info">
                                                {currentItem.tanggal_rusak
                                                    ? new Date(currentItem.tanggal_rusak).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {currentItem.status_detail?.nama_status === 'Hilang' && (
                                    <>
                                        <div className="detail-field">
                                            <label className="detail-label">Terakhir Diketahui</label>
                                            <span className="info-value-info">
                                                {currentItem.user_penghilang?.name || '-'}
                                            </span>
                                        </div>
                                        <div className="detail-field">
                                            <label className="detail-label">Tgl Hilang</label>
                                            <span className="info-value-info">
                                                {currentItem.tanggal_hilang
                                                    ? new Date(currentItem.tanggal_hilang).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {currentItem.deskripsi && (
                                    <div className="detail-field detail-full">
                                        <label className="detail-label">
                                            Deskripsi
                                        </label>
                                        <span>{currentItem.deskripsi}</span>
                                    </div>
                                )}
                                {currentItem.bukti_foto_path && (
                                    <div className="detail-field detail-full">
                                        <label className="detail-label">
                                            Bukti Foto
                                        </label>
                                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                                            <img
                                                src={`http://localhost:8000/storage/${currentItem.bukti_foto_path}`}
                                                alt="Bukti Stok"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '400px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ddd',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(`http://localhost:8000/storage/${currentItem.bukti_foto_path}`, '_blank')}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {renderConditionalInputs()}
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn-history"
                        style={{ marginRight: 'auto' }}
                        onClick={() => setShowHistory(true)}
                    >
                        Riwayat Barang
                    </button>

                    {isEditing ? (
                        <>
                            <button
                                className="btn-cancel"
                                onClick={() => setIsEditing(false)}
                            >
                                Batal
                            </button>
                            <button
                                className="btn-confirm"
                                disabled={isLoading}
                                onClick={handleSave}
                            >
                                {isLoading
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn-cancel"
                                onClick={() =>
                                    onEditClick(currentItem)
                                }
                            >
                                Edit Detail
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={() => setIsEditing(true)}
                            >
                                Ubah Status
                            </button>
                        </>
                    )}
                </div>
            </div>

            <EditStokBarangModal
                show={Boolean(editItem)}
                onClose={() => setEditItem(null)}
                item={editItem}
                showToast={showToast}
                onSaveSuccess={() => {
                    setEditItem(null);
                    fetchData(
                        pagination?.current_page || 1,
                        currentFilters
                    );
                }}
                statusOptions={statusOptions}
                colorOptions={colorOptions}
            />

            <HistoryModal
                show={showHistory}
                item={currentItem}
                onClose={() => setShowHistory(false)}
                showToast={showToast}
            />
        </div>
    );
}

export default ItemDetailModal;
