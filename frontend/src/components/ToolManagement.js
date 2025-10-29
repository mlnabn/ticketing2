import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom'; // 1. Import hook
import api from '../services/api';
import ItemListView from './ItemListView';
import ItemFormModal from './ItemFormModal';
import ConfirmationModal from './ConfirmationModal';
import EditNamaBarangModal from './EditNamaBarangModal';

// 2. Hapus `showToast` dari props
function ToolManagement() {
    // 3. Ambil `showToast` dari context
    const { showToast } = useOutletContext();

    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [itemToEditName, setItemToEditName] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({});
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchItems = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        setCurrentFilters(filters);
        try {
            const params = { page: 1, ...filters };
            const response = await api.get('/inventory/items', { params });
            setItems(response.data.data);
            setPagination(response.data);
        } catch (error) {
            console.error("Gagal mengambil data inventaris:", error);
            showToast("Gagal mengambil data inventaris.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const loadMoreItems = async () => {
        if (isLoadingMore || !pagination || pagination.current_page >= pagination.last_page) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pagination.current_page + 1;
            const params = { page: nextPage, ...currentFilters };
            const response = await api.get('/inventory/items', { params });

            setItems(prev => [...prev, ...response.data.data]);
            setPagination(response.data);
        } catch (error) {
            console.error("Gagal memuat lebih banyak:", error);
            showToast("Gagal memuat lebih banyak.", "error");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && !loading && !isLoadingMore && pagination && pagination.current_page < pagination.last_page) {
            loadMoreItems();
        }
    };

    const handleOpenAddModal = () => { setItemToEdit(null); setIsItemModalOpen(true); };
    const handleCloseItemModal = () => { setIsItemModalOpen(false); setItemToEdit(null); };
    const handleOpenEditNameModal = (item) => setItemToEditName(item);
    const handleCloseEditNameModal = () => setItemToEditName(null);

    const handleSaveItem = async (formData) => {
        try {
            await api.post('/inventory/items', formData);
            showToast('Tipe barang baru berhasil didaftarkan.');
            handleCloseItemModal();
            fetchItems(pagination?.current_page || 1);
        } catch (e) {
            console.error('Gagal menyimpan barang:', e);
            const errorMsg = e.response?.data?.message || 'Gagal menyimpan data barang.';
            showToast(errorMsg, 'error');
        }
    };

    const handleDeleteClick = (item) => {
        if (!item || !item.id_m_barang) {
            console.error("Attempted to delete an invalid item:", item);
            showToast("Gagal memulai proses hapus: item tidak valid.", "error");
            return;
        }
        setItemToDelete(item);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            const response = await api.delete(`/inventory/items/${itemToDelete.id_m_barang}`);

            // Cek status sukses (200 OK atau 204 No Content)
            if (response.status === 200 || response.status === 204) {
                showToast(response.data?.message || "Barang berhasil dihapus.");

                // Logika untuk pindah halaman jika item terakhir di halaman dihapus
                const currentPage = pagination?.current_page || 1;
                if (items.length === 1 && currentPage > 1) {
                    fetchItems(currentPage - 1);
                } else {
                    fetchItems(currentPage);
                }
            } else {
                showToast(response.data?.message || "Gagal menghapus barang.", "error");
            }
        } catch (error) {
            console.error("Gagal menghapus barang:", error);
            showToast(error.response?.data?.message || "Gagal menghapus barang.", "error");
        } finally {
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Tambah SKU</h1>
            </div>

            <ItemListView
                items={items}
                // pagination={pagination}
                loading={loading}
                totalItems={pagination?.total || 0} // <-- TAMBAHKAN BARIS INI
                onAdd={handleOpenAddModal}
                onEdit={handleOpenEditNameModal}
                onDelete={handleDeleteClick}
                onFilterChange={fetchItems}
                onScroll={handleScroll}
                isLoadingMore={isLoadingMore}
            />

            <ItemFormModal
                isOpen={isItemModalOpen}
                onClose={handleCloseItemModal}
                onSave={handleSaveItem}
                itemToEdit={itemToEdit}
                showToast={showToast}
            />

            <EditNamaBarangModal
                isOpen={!!itemToEditName}
                onClose={handleCloseEditNameModal}
                item={itemToEditName}
                showToast={showToast}
                onSaveSuccess={() => fetchItems(pagination?.current_page || 1)}
            />

            {isConfirmModalOpen && (
                <ConfirmationModal
                    message={`Anda yakin ingin menghapus "${itemToDelete?.nama_barang || 'item yang dipilih'}"?`}
                    onConfirm={confirmDeleteItem}
                    onCancel={() => setIsConfirmModalOpen(false)}
                />
            )}
        </>
    );
}

export default ToolManagement;