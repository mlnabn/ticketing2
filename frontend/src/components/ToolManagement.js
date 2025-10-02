// src/components/ToolManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ToolFormModal from './ToolFormModal';
import RecoverStockModal from './RecoverStockModal';
import ToolListView from './ToolListView';
import ToolReportView from './ToolReportView';

function ToolManagement({ showToast }) {
    const [view, setView] = useState('main');

    // State global yang dipakai anak (list, report)
    const [tools, setTools] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    // State modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toolToEdit, setToolToEdit] = useState(null);
    const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
    const [toolToRecover, setToolToRecover] = useState(null);
    const [ticketForRecover, setTicketForRecover] = useState(null);

    // Fetcher
    const fetchListData = useCallback(async () => {
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
            console.error("Gagal mengambil data daftar barang:", error);
            showToast("Gagal mengambil data daftar barang.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchMainData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/tools/recent-activity');
            setRecentActivity(response.data);
        } catch (error) {
            console.error("Gagal mengambil aktivitas terakhir:", error);
            showToast("Gagal mengambil aktivitas terakhir.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchReportData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/tools/lost-items-report');
            setReportData(response.data);
        } catch (error) {
            console.error("Gagal mengambil data laporan:", error);
            showToast("Gagal mengambil data laporan.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Auto-fetch sesuai halaman
    useEffect(() => {
        if (view === 'main') fetchMainData();
        if (view === 'list') fetchListData();
        if (view === 'report') fetchReportData();
    }, [view, fetchMainData, fetchListData, fetchReportData]);

    // Handler modal
    const handleOpenAddModal = () => { setToolToEdit(null); setIsModalOpen(true); };
    const handleOpenEditModal = (tool) => { setToolToEdit(tool); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setToolToEdit(null); };
    const handleSaveTool = async (formData) => {
        const isEditMode = Boolean(toolToEdit);
        const url = isEditMode ? `/tools/${toolToEdit.id}` : '/tools';
        try {
            await api.post(url, formData);
            showToast(isEditMode ? 'Data alat berhasil diubah.' : 'Alat baru berhasil ditambahkan.');
            handleCloseModal();
            fetchListData();
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
                fetchListData();
            } catch (error) {
                console.error("Gagal menghapus alat:", error);
                showToast("Gagal menghapus alat.");
            }
        }
    };
    const handleOpenRecoverModal = (tool, ticket) => { setToolToRecover(tool); setTicketForRecover(ticket); setIsRecoverModalOpen(true); };
    const handleCloseRecoverModal = () => { setIsRecoverModalOpen(false); setToolToRecover(null); setTicketForRecover(null); };
    const handleSaveRecover = async (toolId, ticketId, quantity, keterangan) => {
        try {
            await api.post(`/tools/${toolId}/recover`, { ticket_id: ticketId, quantity_recovered: quantity, keterangan });
            showToast('Stok berhasil dipulihkan.', 'success');
            handleCloseRecoverModal();
            fetchListData();
        } catch (e) {
            console.error('Gagal memulihkan stok:', e);
            showToast(e.response?.data?.message || 'Gagal memulihkan stok.', 'error');
        }
    };

    // --- Render Halaman Utama ---
    const renderMainView = () => (
        <>
            <div className="report-navigation-cards">
                <div className="nav-card" onClick={() => setView('list')}>
                    <h3>Daftar Barang</h3>
                    <p>Kelola semua barang dan stok yang tersedia di gudang.</p>
                </div>
                <div className="nav-card" onClick={() => setView('report')}>
                    <h3>Laporan Barang</h3>
                    <p>Lihat riwayat peminjaman dan pengembalian barang oleh admin.</p>
                </div>
            </div>

            <hr className="report-divider" />

            <h2 className="tool-section-title">Aktivitas Peminjaman Terakhir</h2>
            <div className="job-list-table">
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Nama Barang</th>
                            <th>Jumlah</th>
                            <th>Admin</th>
                            <th>Status</th>
                            <th>Untuk Tiket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat aktivitas...</td></tr>
                        ) : recentActivity.length > 0 ? recentActivity.map((act, index) => (
                            <tr key={index}>
                                <td>{new Date(act.activity_time).toLocaleString()}</td>
                                <td>{act.tool_name}</td>
                                <td>{act.quantity_used}</td>
                                <td>{act.admin_name || '-'}</td>
                                <td><span className={`status-${act.loan_status}`}>{act.loan_status}</span></td>
                                <td>{act.ticket_title}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada aktivitas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="job-list-mobile">
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Memuat aktivitas...</p>
                ) : recentActivity.length > 0 ? recentActivity.map((act, index) => (
                    <div key={index} className="ticket-card-mobile">
                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Waktu</span>
                                <span className="value">{new Date(act.activity_time).toLocaleString()}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Nama Barang</span>
                                <span className="value">{act.tool_name}</span>
                            </div>
                        </div>
                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Jumlah</span>
                                <span className="value">{act.quantity_used}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Admin</span>
                                <span className="value">{act.admin_name || '-'}</span>
                            </div>
                        </div>
                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Status</span>
                                <span className={`value status-${act.loan_status}`}>{act.loan_status}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Untuk Tiket</span>
                                <span className="value">{act.ticket_title}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center' }}>Belum ada aktivitas.</p>
                )}
            </div>
        </>
    );

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Manajemen Gudang</h1>
            </div>

            {view === 'main' && renderMainView()}
            {view === 'list' && (
                <ToolListView
                    tools={tools}
                    lostItems={lostItems}
                    loading={loading}
                    onBack={() => setView('main')}
                    onAdd={handleOpenAddModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                    onRecover={handleOpenRecoverModal}
                />
            )}
            {view === 'report' && (
                <ToolReportView
                    reportData={reportData}
                    loading={loading}
                    onBack={() => setView('main')}
                />
            )}

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
