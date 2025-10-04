// src/components/ToolManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Komponen BARU untuk sistem inventaris
import ItemListView from './ItemListView';
import ItemFormModal from './ItemFormModal';

// Komponen lama yang masih relevan untuk laporan
import ToolReportView from './ToolReportView';
import RecoverStockModal from './RecoverStockModal';


function ToolManagement({ showToast }) {
    // 'main', 'itemList', 'report'
    const [view, setView] = useState('main');

    // --- STATE UNTUK SISTEM INVENTARIS BARU ---
    const [items, setItems] = useState([]);
    const [itemsPagination, setItemsPagination] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- STATE UNTUK FITUR LAPORAN (YANG SUDAH ADA) ---
    const [recentActivity, setRecentActivity] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
    const [toolToRecover, setToolToRecover] = useState(null);
    const [ticketForRecover, setTicketForRecover] = useState(null);

    // --- STATE UMUM ---
    const [loading, setLoading] = useState(true);

    // --- FETCHER BARU: Mengambil data dari master_barang ---
    const fetchItems = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = { page, ...filters, _t: new Date().getTime() };
            const response = await api.get('/inventory/items', { params });
            setItems(response.data.data);
            setItemsPagination(response.data);
        } catch (error) {
            console.error("Gagal mengambil data inventaris:", error);
            showToast("Gagal mengambil data inventaris.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // --- FETCHER LAMA (MASIH RELEVAN) ---
    const fetchMainData = useCallback(async () => {
        setLoading(true);
        try {
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
        setLoading(true);
        try {
            const response = await api.get('/tools/lost-items-report');
            setReportData(response.data);
        } catch (error) {
            console.error("Gagal mengambil data laporan:", error);
            showToast("Gagal mengambil data laporan.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // --- EFEK UNTUK MEMUAT DATA SESUAI VIEW ---
    useEffect(() => {
        if (view === 'main') fetchMainData();
        if (view === 'itemList') fetchItems();
        if (view === 'report') fetchReportData();
    }, [view, fetchMainData, fetchItems, fetchReportData]);

    // --- HANDLER UNTUK MODAL INVENTARIS ---
    const handleOpenAddModal = () => { setItemToEdit(null); setIsModalOpen(true); };
    const handleOpenEditModal = (item) => { setItemToEdit(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setItemToEdit(null); };

    const handleSaveItem = async (formData, itemId) => {
        const isEditMode = Boolean(itemId);
        // Tentukan URL tujuan
        const url = isEditMode ? `/inventory/items/${itemId}` : '/inventory/items';

        if (isEditMode) {
            formData.append('_method', 'PUT');
        }

        try {
            // Kirim request sebagai POST
            await api.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            showToast(isEditMode ? 'Data barang berhasil diubah.' : 'Barang baru berhasil ditambahkan.');
            handleCloseModal();
            // Refresh data di halaman yang sedang aktif
            fetchItems(itemsPagination?.current_page || 1);
        } catch (e) {
            console.error('Gagal menyimpan barang:', e);
            const errorMsg = e.response?.data?.message || 'Gagal menyimpan data barang.';
            showToast(errorMsg, 'error');
        }
    };

    const handleDeleteItem = useCallback(async (itemId) => {
        if (window.confirm("Anda yakin ingin menghapus barang ini dari inventaris?")) {
            try {
                const res = await api.delete(`/inventory/items/${itemId}`);

                if (res.status === 204) {
                    showToast("Barang berhasil dihapus.");

                    const currentPage = itemsPagination?.current_page || 1;
                    const totalOnPage = items.length;

                    if (totalOnPage === 1 && currentPage > 1) {
                        fetchItems(currentPage - 1);
                    } else {
                        fetchItems(currentPage);
                    }
                } else {
                    showToast(res.data?.message || "Gagal menghapus barang.", "error");
                }

            } catch (error) {
                console.error("Gagal menghapus barang:", error);
                showToast(error.response?.data?.message || "Gagal menghapus barang.", "error");
            }
        }
    }, [items, itemsPagination, fetchItems, showToast]);


    // --- HANDLER UNTUK MODAL RECOVER (TIDAK BERUBAH) ---
    const handleOpenRecoverModal = (item) => {
        // 'item' adalah satu baris data dari laporan kehilangan
        setToolToRecover({ id: item.tool_id, name: item.tool_name });

        const remainingLost = item.quantity_lost - item.quantity_recovered;
        setTicketForRecover({
            ticket_id: item.ticket_id,
            ticket_title: item.ticket_title,
            quantity_lost: remainingLost, // Kirim sisa yang hilang
        });

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
            showToast('Stok berhasil dipulihkan!');
            handleCloseRecoverModal();
            fetchReportData(); // Refresh data laporan setelah berhasil
        } catch (error) {
            console.error("Gagal memulihkan stok:", error);
            showToast(error.response?.data?.message || "Gagal memulihkan stok.", "error");
        }
    };

    // --- RENDER ---
    const renderMainView = () => (
        <>
            <div className="report-navigation-cards">
                <div className="nav-card" onClick={() => setView('itemList')}>
                    <h3>Daftar Barang</h3>
                    <p>Kelola semua barang dan stok yang tersedia di gudang.</p>
                </div>
                <div className="nav-card" onClick={() => setView('report')}>
                    <h3>Laporan Kehilangan</h3>
                    <p>Lihat riwayat barang yang hilang dan proses pemulihan stok.</p>
                </div>
            </div>
            <hr className="report-divider" />
            <h2 className="tool-section-title">Aktivitas Peminjaman Terakhir</h2>

            {/* --- BAGIAN YANG DILENGKAPI --- */}
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
                                <td>{new Date(act.activity_time).toLocaleString('id-ID')}</td>
                                <td>{act.tool_name}</td>
                                <td>{act.quantity_used}</td>
                                <td>{act.admin_name || '-'}</td>
                                <td><span className={`status-${act.loan_status}`}>{act.loan_status}</span></td>
                                <td>
                                    <span className="description-cell">{act.ticket_title}</span>
                                </td>
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
                                <span className="value">{new Date(act.activity_time).toLocaleString('id-ID')}</span>
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
                                <span className="value">
                                    <span className="description-cell">{act.ticket_title}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center' }}>Belum ada aktivitas.</p>
                )}
            </div>
            {/* --- AKHIR BAGIAN YANG DILENGKAPI --- */}
        </>
    );

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Manajemen Gudang</h1>
            </div>

            {view === 'main' && renderMainView()}

            {view === 'itemList' && (
                <ItemListView
                    items={items}
                    pagination={itemsPagination}
                    loading={loading}
                    onBack={() => setView('main')}
                    onAdd={handleOpenAddModal}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteItem}
                    onPageChange={fetchItems}
                    onFilterChange={fetchItems}
                />
            )}

            {view === 'report' && (
                <ToolReportView
                    reportData={reportData}
                    loading={loading}
                    onBack={() => setView('main')}
                    onRecoverClick={handleOpenRecoverModal}
                />
            )}

            <ItemFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveItem}
                itemToEdit={itemToEdit}
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