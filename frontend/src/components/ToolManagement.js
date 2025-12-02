import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ItemListView from './ItemListView';
import ItemFormModal from './ItemFormModal';
import ConfirmationModal from './ConfirmationModal';
import EditNamaBarangModal from './EditNamaBarangModal';
import { motion, useIsPresent } from 'framer-motion';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};
const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

function ToolManagement() {
    const { showToast } = useOutletContext();
    const isPresent = useIsPresent();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToEditName, setItemToEditName] = useState(null);
    const [currentFilters, setCurrentFilters] = useState({ is_active: 'true' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [detailItems, setDetailItems] = useState({});
    const [expandingId, setExpandingId] = useState(null);

    const fetchItems = useCallback(async (page = 1, filters = {}, getIsActive = () => true) => {
        if (page === 1) setLoading(true);
        try {
            const params = { page, ...filters };
            const response = await api.get('/inventory/items', { params });

            if (getIsActive()) {
                if (page === 1) {
                    setItems(response.data.data);
                    setExpandedRows({});
                    setDetailItems({});
                    setSelectedIds([]);
                } else {
                    setItems(prev => [...prev, ...response.data.data]);
                }
                setPagination(response.data);
            }
        } catch (error) {
            if (getIsActive()) {
                console.error("Gagal mengambil data inventaris:", error);
                showToast("Gagal mengambil data inventaris.", "error");
            }
        } finally {
            if (getIsActive()) {
                if (page === 1) setLoading(false);
            }
        }
    }, [showToast]);

    useEffect(() => {
        if (!isPresent) return;
        let isActive = true;
        fetchItems(1, currentFilters, () => isActive);
        return () => {
            isActive = false;
        };
    }, [fetchItems, currentFilters, isPresent]);

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
    
    const toggleExpand = async (kodeBarang) => {
        const isCurrentlyExpanded = !!expandedRows[kodeBarang];
        if (isCurrentlyExpanded) {
            setExpandedRows(prev => ({ ...prev, [kodeBarang]: false }));
            return;
        }

        setExpandedRows(prev => ({ ...prev, [kodeBarang]: true }));
        if (detailItems[kodeBarang]) {
            return;
        }

        setExpandingId(kodeBarang); 
        try {
            const isActive = currentFilters.is_active === 'true';
            const res = await api.get(`/inventory/items/variations/${kodeBarang}`, {
                params: { is_active: isActive }
            });

            setDetailItems(prev => ({
                ...prev,
                [kodeBarang]: res.data 
            }));

        } catch (error) {
            console.error("Gagal memuat variasi SKU:", error);
            showToast('Gagal memuat variasi SKU.', 'error');
            setExpandedRows(prev => ({ ...prev, [kodeBarang]: false }));
        } finally {
            setExpandingId(null);
        }
    };

    const handleOpenAddModal = () => { setItemToEdit(null); setIsItemModalOpen(true); };
    const handleCloseItemModal = () => { setIsItemModalOpen(false); setItemToEdit(null); };
    const handleOpenEditNameModal = (item) => setItemToEditName(item);
    const handleCloseEditNameModal = () => setItemToEditName(null);

    const handleSaveRequest = async (formData, action = 'save') => {
        try {
            const response = await api.post('/inventory/items', formData);
            const newItem = response.data; 
            showToast('Tipe barang baru berhasil didaftarkan.');
            handleCloseItemModal();
            fetchItems(1, currentFilters); 
            if (action === 'saveAndAddStock' && newItem) {
                const preselectData = {
                    value: newItem.id_m_barang,
                    label: `${newItem.nama_barang} (${newItem.kode_barang})`
                };
                navigate('/admin/stock', { 
                    state: { 
                        preselectItem: preselectData 
                    } 
                });
            }
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
            const response = await api.post(`/inventory/items/${itemToDelete.id_m_barang}/archive`);

            if (response.status === 200 || response.status === 204) {
                showToast(response.data?.message || "Barang berhasil diarsipkan.");
                fetchItems(1, currentFilters);
                setDetailItems(prev => {
                    const newDetails = { ...prev };
                    if (newDetails[itemToDelete.kode_barang]) {
                        newDetails[itemToDelete.kode_barang] = newDetails[itemToDelete.kode_barang].filter(
                            it => it.id_m_barang !== itemToDelete.id_m_barang
                        );
                    }
                    return newDetails;
                });
            } else {
                showToast(response.data?.message || "Gagal mengarsipkan barang.", "error");
            }
        } catch (error) {
            console.error("Gagal mengarsipkan barang:", error);
            showToast(error.response?.data?.message || "Gagal mengarsipkan barang.", "error");
        } finally {
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleRestoreClick = async (item) => {
        if (!item || !item.id_m_barang) {
            console.error("Attempted to restore an invalid item:", item);
            showToast("Gagal memulai proses pulihkan: item tidak valid.", "error");
            return;
        }
        try {
            const response = await api.post(`/inventory/items/${item.id_m_barang}/restore`);
            showToast(response.data?.message || "SKU berhasil dipulihkan.");
            fetchItems(1, currentFilters);
            setDetailItems(prev => {
                const newDetails = { ...prev };
                if (newDetails[item.kode_barang]) {
                    newDetails[item.kode_barang] = newDetails[item.kode_barang].filter(
                        it => it.id_m_barang !== item.id_m_barang
                    );
                }
                return newDetails;
            });

        } catch (error) {
            console.error("Gagal memulihkan barang:", error);
            showToast(error.response?.data?.message || "Gagal memulihkan barang.", "error");
        }
    };

    const handleSelectId = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e, kodeBarang) => {
        const itemIds = detailItems[kodeBarang]?.map(item => item.id_m_barang) || [];

        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (e.target.checked) {
                itemIds.forEach(id => newSet.add(id));
            } else {
                itemIds.forEach(id => newSet.delete(id));
            }
            return Array.from(newSet);
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showToast('Pilih setidaknya satu SKU untuk dihapus.', 'info');
            return;
        }
        if (window.confirm(`Anda yakin ingin menghapus ${selectedIds.length} SKU yang dipilih?`)) {
            try {
                const response = await api.post('/inventory/items/bulk-delete', { ids: selectedIds });
                showToast(response.data.message, 'success');
                fetchItems(1, currentFilters);
                setSelectedIds([]);
            } catch (e) {
                console.error('Gagal menghapus SKU secara massal:', e);
                showToast(e.response?.data?.message || 'Terjadi kesalahan saat mencoba menghapus SKU.', 'error');
            }
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) {
            showToast('Pilih setidaknya satu SKU untuk dipulihkan.', 'info');
            return;
        }
        if (window.confirm(`Anda yakin ingin memulihkan ${selectedIds.length} SKU yang dipilih?`)) {
            try {
                const response = await api.post('/inventory/items/bulk-restore', { ids: selectedIds });
                showToast(response.data.message, 'success');
                fetchItems(1, currentFilters);
                setSelectedIds([]);
            } catch (e) {
                console.error('Gagal memulihkan SKU secara massal:', e);
                showToast(e.response?.data?.message || 'Terjadi kesalahan saat mencoba memulihkan SKU.', 'error');
            }
        }
    };

    const handleFilterChange = useCallback((page, filters) => {
        setCurrentFilters(prevFilters => ({
            is_active: prevFilters.is_active,
            id_kategori: filters.id_kategori || '',
            id_sub_kategori: filters.id_sub_kategori || ''
        }));
    }, [])

    const handleToggleArchived = (isArchived) => {
        const newFilters = { 
            is_active: isArchived ? 'false' : 'true',
            id_kategori: '',
            id_sub_kategori: ''
        };
        setCurrentFilters(newFilters);
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={staggerItem} className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>{currentFilters.is_active === 'true' ? 'Tambah Kode Unik Tipe Barang' : 'Arsip Tipe Barang'}</h1>
            </motion.div>

            <ItemListView
                items={items}
                loading={loading}
                onScroll={handleScroll}
                isLoadingMore={isLoadingMore}
                totalItems={pagination?.total || 0}
                onAdd={handleOpenAddModal}
                onEdit={handleOpenEditNameModal}
                onDelete={handleDeleteClick}
                onFilterChange={handleFilterChange}
                selectedIds={selectedIds}
                onSelectId={handleSelectId}
                onSelectAll={handleSelectAll}
                onBulkDelete={handleBulkDelete}
                expandedRows={expandedRows}
                detailItems={detailItems}
                expandingId={expandingId}
                onToggleExpand={toggleExpand}
                showArchived={currentFilters.is_active === 'false'}
                onToggleArchived={handleToggleArchived}
                onRestore={handleRestoreClick}
                onBulkRestore={handleBulkRestore}
                currentFilters={currentFilters}
            />

            <ItemFormModal
                show={isItemModalOpen}
                onClose={handleCloseItemModal}
                onSaveRequest={handleSaveRequest}
                itemToEdit={itemToEdit}
                showToast={showToast}
            />

            <EditNamaBarangModal
                show={!!itemToEditName}
                onClose={handleCloseEditNameModal}
                item={itemToEditName}
                showToast={showToast}
                onSaveSuccess={() => fetchItems(pagination?.current_page || 1)}
            />

            <ConfirmationModal
                show={isConfirmModalOpen}
                message={`Anda yakin ingin mengarsipkan "${itemToDelete?.nama_barang || 'item yang dipilih'}"? SKU ini tidak akan bisa digunakan lagi.`}
                onConfirm={confirmDeleteItem}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </motion.div>
    );
}

export default ToolManagement;