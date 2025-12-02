import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../services/api';

const ConditionalUserInput = ({ item, statusName, users, onChange }) => {
    const userOptions = users.map(u => ({ value: String(u.id), label: u.name }));
    const defaultUserOption = { value: '', label: "Pilih Pengguna (default: Anda)" };
    const optionsWithDefault = [defaultUserOption, ...userOptions];

    switch (statusName) {
        case 'Digunakan':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Pengguna:</label>
                    <Select 
                        classNamePrefix="custom-select-return"
                        options={optionsWithDefault}
                        value={optionsWithDefault.find(opt => opt.value === String(item.user_digunakan_id)) || null}
                        onChange={(selectedOption) => onChange(item.stok_barang_id, 'user_digunakan_id', selectedOption.value)}
                        isSearchable={true}
                        placeholder="Pilih Pengguna..."
                    />
                </div>
            );
        case 'Rusak':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Dilaporkan oleh:</label>
                    <Select
                        classNamePrefix="custom-select-return"
                        options={optionsWithDefault}
                        value={optionsWithDefault.find(opt => opt.value === String(item.user_rusak_id)) || null}
                        onChange={(selectedOption) => onChange(item.stok_barang_id, 'user_rusak_id', selectedOption.value)}
                        isSearchable={true}
                        placeholder="Pilih Penanggung Jawab..."
                    />
                </div>
            );
        case 'Hilang':
            return (
                <div className="form-group-inline2 conditional">
                    <label>Terakhir diketahui:</label>
                    <Select
                        classNamePrefix="custom-select-return"
                        options={optionsWithDefault}
                        value={optionsWithDefault.find(opt => opt.value === String(item.user_hilang_id)) || null}
                        onChange={(selectedOption) => onChange(item.stok_barang_id, 'user_hilang_id', selectedOption.value)}
                        isSearchable={true}
                        placeholder="Pilih Penanggung Jawab..."
                    />
                </div>
            );
        default:
            return null;
    }
};

function ReturnItemsModal({ show, ticket, onSave, onClose, showToast }) {
    const [items, setItems] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
            }, 300);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, ticket, shouldRender]);

    useEffect(() => {
        if (show && ticket && ticket.id) {
            setIsLoading(true);
            Promise.all([
                api.get(`/tickets/${ticket.id}/borrowed-items`),
                api.get('/statuses'),
                api.get('/users/all')
            ]).then(([itemsRes, statusesRes, usersRes]) => {
                const tersediaStatus = statusesRes.data.find(s => s.nama_status === 'Tersedia');
                const tersediaStatusId = tersediaStatus ? tersediaStatus.id : '';

                const initialItems = itemsRes.data.map(item => ({
                    stok_barang_id: item.id,
                    name: item.master_barang.nama_barang,
                    kode_unik: item.kode_unik,
                    status_id: tersediaStatusId,
                    keterangan: '',
                    user_digunakan_id: '',
                    user_rusak_id: '',
                    user_hilang_id: '',
                }));
                setItems(initialItems);

                setStatusOptions(statusesRes.data.filter(s =>
                    ['Tersedia', 'Digunakan', 'Rusak', 'Hilang'].includes(s.nama_status)
                ));
                setAllUsers(usersRes.data);

            }).catch(err => {
                console.error("Gagal memuat data pengembalian", err);
                showToast("Gagal memuat data barang yang dipinjam.", "error");
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [show, ticket, showToast]);

    const handleItemChange = (stokId, field, value) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.stok_barang_id === stokId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = () => {
        const payload = {
            items: items.map(item => ({
                stok_barang_id: item.stok_barang_id,
                status_id: item.status_id,
                keterangan: item.keterangan,
                user_digunakan_id: item.user_digunakan_id,
                user_rusak_id: item.user_rusak_id,
                user_hilang_id: item.user_hilang_id,
            }))
        };
        onSave(currentTicket.id, payload.items);
    };

    const handleCloseClick = () => {
        if (onClose) {
            onClose();
        }
    };

    const formattedStatusOptions = statusOptions.map(s => ({
        value: String(s.id),
        label: s.nama_status
    }));

    if (!shouldRender) return null;
    if (!currentTicket) return null;

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
                <h3>Form Pengembalian & Penyelesaian</h3>
                <p>Tiket: "{currentTicket.title}"</p>

                {isLoading ? <p>Memuat...</p> : (
                    <div className="items-to-return-list">
                        {items.length > 0 ? items.map(item => {
                            const selectedStatus = statusOptions.find(s => s.id === Number(item.status_id));
                            return (
                                <div key={item.stok_barang_id} className="return-item-row">
                                    <div className="item-info">
                                        <strong>{item.name}</strong>
                                        <small>({item.kode_unik})</small>
                                    </div>

                                    <div className="item-controls">
                                        <div className="form-group-inline2">
                                            <label>Status Akhir:</label>
                                            <Select
                                                classNamePrefix="custom-select-return"
                                                options={formattedStatusOptions}
                                                value={formattedStatusOptions.find(opt => opt.value === String(item.status_id)) || null}
                                                onChange={(selectedOption) => handleItemChange(item.stok_barang_id, 'status_id', selectedOption.value)}
                                                isSearchable={false}
                                            />
                                        </div>

                                        <ConditionalUserInput
                                            item={item}
                                            statusName={selectedStatus?.nama_status}
                                            users={allUsers}
                                            onChange={handleItemChange}
                                        />

                                        <div className="form-group2">
                                            <label>Keterangan (jika perlu):</label>
                                            <textarea
                                                value={item.keterangan}
                                                onChange={(e) => handleItemChange(item.stok_barang_id, 'keterangan', e.target.value)}
                                                rows="2"
                                                placeholder="Cth: Dipasang permanen di workshop, jatuh, dll."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : <p>Tidak ada barang yang tercatat dipinjam untuk tiket ini.</p>}
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={handleCloseClick} className="btn-cancel">Batal</button>
                    <button onClick={handleSubmit} className="btn-confirm" disabled={isLoading}>
                        Selesaikan Tiket
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReturnItemsModal;