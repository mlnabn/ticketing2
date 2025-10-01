// src/components/ToolManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ToolFormModal from './ToolFormModal';
import RecoverStockModal from './RecoverStockModal';

function ToolManagement() {
    // ... (Semua state dan handler Anda SAMA, tidak perlu diubah) ...
    const [tools, setTools] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toolToEdit, setToolToEdit] = useState(null);
    const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
    const [toolToRecover, setToolToRecover] = useState(null);
    const [ticketForRecover, setTicketForRecover] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        alert(`${type.toUpperCase()}: ${message}`);
    }, []);
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [toolsResponse, lostItemsResponse] = await Promise.all([
                api.get('/tools'),
                api.get('/tools/lost-items')
            ]);
            setTools(toolsResponse.data);
            const lostItemsMap = lostItemsResponse.data.reduce((acc, item) => {
                acc[item.id] = item.lost_in_tickets;
                return acc;
            }, {});
            setLostItems(lostItemsMap);
        } catch (error) {
            console.error("Gagal mengambil data gudang:", error);
            showToast("Gagal mengambil data gudang.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    const handleOpenAddModal = () => {
        setToolToEdit(null);
        setIsModalOpen(true);
    };
    const handleOpenEditModal = (tool) => {
        setToolToEdit(tool);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setToolToEdit(null);
    };
    const handleSaveTool = async (formData) => {
        const isEditMode = Boolean(toolToEdit);
        const url = isEditMode ? `/tools/${toolToEdit.id}` : '/tools';
        try {
            await api.post(url, formData);
            showToast(isEditMode ? 'Data alat berhasil diubah.' : 'Alat baru berhasil ditambahkan.');
            handleCloseModal();
            fetchAllData();
        } catch (e) {
            console.error('Gagal menyimpan alat:', e);
            showToast(e.response?.data?.message || 'Gagal menyimpan data alat.');
        }
    };
    const handleDelete = async (toolId) => {
        if (window.confirm("Anda yakin ingin menghapus alat ini?")) {
            try {
                await api.delete(`/tools/${toolId}`);
                showToast("Alat berhasil dihapus.");
                fetchAllData();
            } catch (error) {
                console.error("Gagal menghapus alat:", error);
                showToast("Gagal menghapus alat.");
            }
        }
    };
    const handleOpenRecoverModal = (tool, ticket) => {
        setToolToRecover(tool);
        setTicketForRecover(ticket);
        setIsRecoverModalOpen(true);
    };
    const handleCloseRecoverModal = () => {
        setIsRecoverModalOpen(false);
        setToolToRecover(null);
        setTicketForRecover(null);
    };
    const handleSaveRecover = async (toolId, ticketId, quantity, keterangan) => {
        try {
            await api.post(`/tools/${toolId}/recover`, {
                ticket_id: ticketId,
                quantity_recovered: quantity,
                keterangan: keterangan,
            });
            showToast('Stok berhasil dipulihkan.', 'success');
            handleCloseRecoverModal();
            fetchAllData();
        } catch (e) {
            console.error('Gagal memulihkan stok:', e);
            showToast(e.response?.data?.message || 'Gagal memulihkan stok.', 'error');
        }
    };


    if (loading) return <p>Memuat data alat...</p>;

    return (
        <>
            <div className="user-management-container">
                <h1>Manajemen Gudang</h1>
                <button className="btn-primary" onClick={handleOpenAddModal}>
                    Tambah Alat Baru
                </button>
            </div>

            {/* --- Tampilan Tabel untuk Desktop --- */}
            <div className="job-list-table">
                <table className="job-table">
                    {/* ... Isi tabel desktop Anda (thead & tbody) sama seperti sebelumnya ... */}
                    <thead>
                        <tr>
                            <th>Nama Alat</th>
                            <th>Stok</th>
                            <th style={{ width: '25%' }}>Deskripsi</th>
                            <th style={{ width: '30%' }}>Keterangan Hilang</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tools.length > 0 ? tools.map(tool => (
                            <tr key={tool.id}>
                                <td>{tool.name}</td>
                                <td>{tool.stock}</td>
                                <td>{tool.description || '-'}</td>
                                <td>
                                    {lostItems[tool.id] ? (
                                        lostItems[tool.id].map(ticketInfo => (
                                            <div key={ticketInfo.ticket_id} className="lost-item-info">
                                                <div><strong>Tiket:</strong> {ticketInfo.ticket_title}</div>
                                                <div><small><strong>Status:</strong> {ticketInfo.status}</small></div>
                                                <div><small><strong>Ket:</strong> {ticketInfo.keterangan || 'Tidak ada keterangan'}</small></div>
                                                <button className="btn-recover-small" onClick={() => handleOpenRecoverModal(tool, ticketInfo)}>
                                                    Pulihkan
                                                </button>
                                            </div>
                                        ))
                                    ) : ('-')}
                                </td>
                                <td>
                                    <div className="action-buttons-group">
                                        <button className="btn-user-action btn-edit" onClick={() => handleOpenEditModal(tool)}>Edit</button>
                                        <button className="btn-user-action btn-delete" onClick={() => handleDelete(tool.id)}>Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data alat.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* === BAGIAN BARU: Tampilan Kartu untuk Mobile === */}
            <div className="tool-list-mobile">
                {tools.length > 0 ? tools.map(tool => (
                    <div key={tool.id} className="tool-card-mobile">
                        <div className="tool-card-header">
                            <span className="tool-name">{tool.name}</span>
                            <span className="tool-stock">Stok: {tool.stock}</span>
                        </div>
                        <div className="tool-card-body">
                            <div className="tool-info-section">
                                <span className="label">Deskripsi</span>
                                <span className="value">{tool.description || '-'}</span>
                            </div>
                            <div className="tool-info-section">
                                <span className="label">Keterangan Hilang</span>
                                <div className="value">
                                    {lostItems[tool.id] ? (
                                        lostItems[tool.id].map(ticketInfo => (
                                            <div key={ticketInfo.ticket_id} className="lost-item-info">
                                                <div><strong>Tiket:</strong> {ticketInfo.ticket_title}</div>
                                                <div><small><strong>Status:</strong> {ticketInfo.status}</small></div>
                                                <div><small><strong>Ket:</strong> {ticketInfo.keterangan || 'Tidak ada keterangan'}</small></div>
                                                <button className="btn-recover-small" onClick={() => handleOpenRecoverModal(tool, ticketInfo)}>
                                                    Pulihkan
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        '-'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="tool-card-footer">
                            <div className="action-buttons-group">
                                <button onClick={() => handleOpenEditModal(tool)} className="btn-edit">Edit</button>
                                <button onClick={() => handleDelete(tool.id)} className="btn-delete">Hapus</button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                        <p>Tidak ada alat yang ditemukan.</p>
                    </div>
                )}
            </div>

            {/* ... (Modal-modal Anda tetap sama) ... */}
            <ToolFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTool}
                toolToEdit={toolToEdit}
                showToast={showToast}
            />
            {isRecoverModalOpen && (
                <RecoverStockModal
                    onClose={handleCloseRecoverModal}
                    onSave={handleSaveRecover}
                    tool={toolToRecover}
                    ticket={ticketForRecover}
                    showToast={showToast}
                />
            )}
        </>
    );
}

export default ToolManagement;