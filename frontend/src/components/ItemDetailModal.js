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

function ItemDetailModal({ show, item, onClose, onSaveSuccess, showToast, onEditClick, statusOptions, colorOptions, fetchData, pagination, currentFilters }) {
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

    useEffect(() => {
        if (currentItem) {
            setFormData({
                status_id: currentItem.status_id || '',
                deskripsi: currentItem.deskripsi || '',
                user_peminjam_id: currentItem.user_peminjam_id || '',
                workshop_id: currentItem.workshop_id || '',
                teknisi_perbaikan_id: currentItem.teknisi_perbaikan_id || '',
                tanggal_mulai_perbaikan: currentItem.tanggal_mulai_perbaikan?.split(' ')[0] || '',
                tanggal_selesai_perbaikan: currentItem.tanggal_selesai_perbaikan?.split(' ')[0] || '',
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
            api.get('/users?all=true').then(res => setUsers(res.data));
            api.get('/workshops').then(res => setWorkshops(res.data.data || res.data));
        }
    }, [isEditing]);

    useEffect(() => {
        if (currentItem?.master_barang_id) {
            const fetchStockByColor = async () => {
                try {
                    const response = await api.get(`/inventory/items/${currentItem.master_barang_id}/stock-by-color`);
                    setStockByColor(response.data);
                } catch (error) {
                    console.error("Gagal mengambil rincian stok warna:", error);
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
                fileType: "image/jpeg"
            };
            try {
                const compressedFile = await imageCompression(originalFile, options);
                setImage(compressedFile);
                setPreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Gagal kompresi:", error);
                showToast("Gagal memproses gambar.", 'error');
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const selectedStatusName = useMemo(() => {
        if (isEditing) {
            const selectedStatus = statusOptions.find(s => s.id === Number(formData.status_id));
            return selectedStatus ? selectedStatus.nama_status : '';
        }
        return currentItem?.status_detail?.nama_status;
    }, [formData.status_id, statusOptions, isEditing, currentItem]);

    if (!shouldRender) return null;
    if (!currentItem) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const dataToSend = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                dataToSend.append(key, formData[key]);
            }
        });

        if (selectedStatusName === 'Digunakan' && image) {
            dataToSend.append('bukti_foto', image);
        }

        try {
            await api.post(`/inventory/stock-items/${currentItem.id}/update-status`, dataToSend);
            showToast('Status barang berhasil diupdate.', 'success');
            onSaveSuccess();
            handleCloseClick();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan.';
            showToast(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderConditionalInputs = () => {
        if (!isEditing) return null;

        const commonDescription = (label) => (
            <div className="info-row full-width">
                <span className="info-label">{label}</span>
                <textarea name="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} rows="2" className="detail-edit-textarea"></textarea>
            </div>
        );

        switch (selectedStatusName) {
            case 'Digunakan':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Digunakan Oleh</span>
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Di Workshop</span>
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || ''} onChange={handleChange} className="detail-edit-input" placeholder="Otomatis hari ini jika kosong" />
                        </div>
                        {commonDescription('Deskripsi Peminjaman')}
                        <div className="info-row full-width" style={{marginTop:'10px'}}>
                            <span className="info-label" style={{marginBottom:'5px', display:'block'}}>Bukti Penggunaan (Foto)</span>
                            <input id="camera-input" type="file" accept="image/*" capture="environment" onChange={handleImageChange} disabled={isCompressing} style={{ display: 'none' }} />
                            <input id="gallery-input" type="file" accept="image/*" onChange={handleImageChange} disabled={isCompressing} style={{ display: 'none' }} />
                            
                            <div className="upload-options-container" style={{display: 'flex', gap: '10px'}}>
                                <label htmlFor="camera-input" className={`btn-upload-option btn-camera ${isCompressing ? 'disabled' : ''}`} style={{cursor:'pointer', padding:'8px 12px', background:'#eee', borderRadius:'8px', display:'flex', alignItems:'center', gap:'5px'}}>
                                    <FaCamera /> <span>Ambil Foto</span>
                                </label>
                                <label htmlFor="gallery-input" className={`btn-upload-option btn-gallery ${isCompressing ? 'disabled' : ''}`} style={{cursor:'pointer', padding:'8px 12px', background:'#eee', borderRadius:'8px', display:'flex', alignItems:'center', gap:'5px'}}>
                                    <FaImage /> <span>Galeri</span>
                                </label>
                            </div>
                            {isCompressing && <small>Sedang memproses gambar...</small>}
                            {preview && (
                                <div style={{marginTop:'10px', position:'relative', width:'fit-content'}}>
                                    <img src={preview} alt="Preview" style={{maxHeight:'150px', borderRadius:'8px', border:'1px solid #ddd'}} />
                                    <button type="button" onClick={()=>{setImage(null); setPreview(null);}} style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer'}}>x</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Dipinjam':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">{selectedStatusName} Oleh</span>
                            <select name="user_peminjam_id" value={formData.user_peminjam_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Di Workshop</span>
                            <select name="workshop_id" value={formData.workshop_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Workshop</option>
                                {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tanggal Keluar</span>
                            <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || ''} onChange={handleChange} className="detail-edit-input" placeholder="Otomatis hari ini jika kosong" />
                        </div>
                        {commonDescription('Deskripsi Peminjaman')}
                    </div>
                );
            case 'Perbaikan':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Teknisi Perbaikan</span>
                            <select name="teknisi_perbaikan_id" value={formData.teknisi_perbaikan_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Teknisi</option>
                                {users.filter(u => u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Mulai</span>
                            <input type="date" name="tanggal_mulai_perbaikan" value={formData.tanggal_mulai_perbaikan || ''} onChange={handleChange} className="detail-edit-input" placeholder="Otomatis hari ini jika kosong" />
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Selesai</span>
                            <input type="date" name="tanggal_selesai_perbaikan" value={formData.tanggal_selesai_perbaikan || ''} onChange={handleChange} className="detail-edit-input" />
                        </div>
                        {commonDescription('Deskripsi Perbaikan')}
                    </div>
                );
            case 'Rusak':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Dilaporkan oleh</span>
                            <select name="user_perusak_id" value={formData.user_perusak_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Rusak</span>
                            <input type="date" name="tanggal_rusak" value={formData.tanggal_rusak || ''} onChange={handleChange} className="detail-edit-input" placeholder="Otomatis hari ini jika kosong" />
                        </div>
                        {commonDescription('Deskripsi Kerusakan')}
                    </div>
                );
            case 'Hilang':
                return (
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Terakhir Diketahui oleh</span>
                            <select name="user_penghilang_id" value={formData.user_penghilang_id} onChange={handleChange} className="detail-edit-select">
                                <option value="">Pilih Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Hilang</span>
                            <input type="date" name="tanggal_hilang" value={formData.tanggal_hilang || ''} onChange={handleChange} className="detail-edit-input" placeholder="Otomatis hari ini jika kosong" />
                        </div>
                        <div className="info-row"><span className="info-label">Tgl Ketemu</span>
                            <input type="date" name="tanggal_ketemu" value={formData.tanggal_ketemu || ''} onChange={handleChange} className="detail-edit-input" />
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
            onClick={handleCloseClick}
        >
            <div
                className={`modal-content-large ${animationClass}`}
                onClick={e => e.stopPropagation()}
            >

                <button type="button" onClick={handleCloseClick} className="modal-close-btn">&times;</button>
                <h3>Detail Aset: {currentItem.master_barang?.nama_barang}</h3>

                <div className="item-detail-qr-top">
                    <QRCode value={currentItem.kode_unik} size={160} level="H" />
                    <strong>{currentItem.kode_unik}</strong>
                </div>

                <div className="item-detail-bottom-section">
                    <div className="form-row2">
                        <div className="info-row"><span className="info-label">Kondisi</span><span className="info-value-info">{currentItem.kondisi}</span></div>
                        <div className="info-row"><span className="info-label">Harga Beli</span><span className="info-value-info">{`Rp ${Number(currentItem.harga_beli).toLocaleString('id-ID')}`}</span></div>
                        <div className="info-row"><span className="info-label">Tanggal Pembelian</span><span className="info-value-info">{new Date(currentItem.tanggal_pembelian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>

                        {stockByColor.length > 0 && (
                            <div className="info-row full-width stock-detail-info">
                                <span className="info-label">Rincian Stok per Warna</span>
                                <div className="stock-color-list">
                                    {stockByColor.map((stock, index) => (
                                        <div key={index} className="stock-item">
                                            <span className="stock-color-name">{stock.nama_warna || 'Tanpa Warna'}</span>
                                            <span className="stock-color-qty">{stock.total} unit</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="info-row">
                            <span className="info-label">Status Stok</span>
                            <span className="info-value-info">
                                {isEditing ? (
                                    <select name="status_id" value={formData.status_id} onChange={handleChange} className="detail-edit-select">
                                        <option value="">Pilih Status</option>
                                        {statusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nama_status}</option>)}
                                    </select>
                                ) : (currentItem.status_detail?.nama_status || 'N/A')}
                            </span>
                        </div>

                        {!isEditing && (
                            <>
                                {currentItem.bukti_foto_path && (
                                    <div className="info-row full-width" style={{display:'flex', flexDirection:'column', alignItems:'center', margin:'10px 0'}}>
                                        <span className="info-label" style={{alignSelf:'flex-start'}}>Bukti Foto</span>
                                        <img 
                                            src={`${api.defaults.baseURL.replace('/api', '')}/storage/${currentItem.bukti_foto_path}`} 
                                            alt="Bukti Aset" 
                                            style={{maxWidth:'100%', maxHeight:'200px', borderRadius:'8px', border:'1px solid #ddd', marginTop:'5px'}} 
                                        />
                                    </div>
                                )}
                                {(currentItem.status_detail?.nama_status === 'Digunakan' || currentItem.status_detail?.nama_status === 'Dipinjam') && (
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">
                                                {currentItem.status_detail.nama_status} Oleh
                                            </span>
                                            <span className="info-value-info">
                                                {currentItem.user_peminjam?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Di Workshop
                                            </span>
                                            <span className="info-value-info">
                                                {currentItem.workshop?.name || 'N/A'}
                                            </span>
                                        </div>
                                        {currentItem.tanggal_keluar && <div className="info-row"><span className="info-label">Tanggal Keluar</span><span className="info-value-info">{new Date(currentItem.tanggal_keluar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                        {currentItem.tanggal_masuk_pinjam && <div className="info-row"><span className="info-label">Estimasi Tgl Masuk</span><span className="info-value-info">{new Date(currentItem.tanggal_masuk_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {currentItem.status_detail?.nama_status === 'Perbaikan' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Teknisi</span><span className="info-value-info">{currentItem.teknisi_perbaikan?.name || 'N/A'}</span></div>
                                        {currentItem.tanggal_mulai_perbaikan && <div className="info-row"><span className="info-label">Tgl Mulai</span><span className="info-value-info">{new Date(currentItem.tanggal_mulai_perbaikan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {currentItem.status_detail?.nama_status === 'Rusak' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Dilaporkan Oleh</span><span className="info-value-info">{currentItem.user_perusak?.name || 'N/A'}</span></div>
                                        {currentItem.tanggal_rusak && <div className="info-row"><span className="info-label">Tgl Rusak</span><span className="info-value-info">{new Date(currentItem.tanggal_rusak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {currentItem.status_detail?.nama_status === 'Hilang' && (
                                    <>
                                        <div className="info-row"><span className="info-label">Terakhir Oleh</span><span className="info-value-info">{currentItem.user_penghilang?.name || 'N/A'}</span></div>
                                        {currentItem.tanggal_hilang && <div className="info-row"><span className="info-label">Tgl Hilang</span><span className="info-value-info">{new Date(currentItem.tanggal_hilang).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                                    </>
                                )}
                                {currentItem.deskripsi && (
                                    <div className="info-row full-width"><span className="info-label">Deskripsi</span><span className="info-value-info">{currentItem.deskripsi}</span></div>
                                )}
                            </>
                        )}

                        {renderConditionalInputs()}
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={() => setShowHistory(true)} className="btn-history" style={{ marginRight: 'auto' }}> Riwayat Barang </button>
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="btn-cancel">Batal</button>
                            <button onClick={handleSave} className="btn-confirm" disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => onEditClick(currentItem)} className="btn-cancel">Edit Detail</button>
                            <button onClick={() => setIsEditing(true)} className="btn-confirm">Ubah Status</button>
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
                    fetchData(pagination?.current_page || 1, currentFilters);
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

