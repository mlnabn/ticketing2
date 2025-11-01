import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import ItemListView from './ItemListView';
import ItemFormModal from './ItemFormModal';
import ConfirmationModal from './ConfirmationModal';
import EditNamaBarangModal from './EditNamaBarangModal';

function ToolManagement() {
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
    const [mobileItems, setMobileItems] = useState([]);
    const [mobilePagination, setMobilePagination] = useState(null);
    const [isMobileLoading, setIsMobileLoading] = useState(true);
    const [isLoadingMoreMobile, setIsLoadingMoreMobile] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [detailItems, setDetailItems] = useState({});
    const [expandingId, setExpandingId] = useState(null);

    const fetchItems = useCallback(async (page = 1, filters = {}) => {
        if (page === 1) setLoading(true);
        try {
            const params = { page, ...filters };
            const response = await api.get('/inventory/items', { params });
            if (page === 1) {
                setItems(response.data.data);
                setExpandedRows({});
                setDetailItems({});
                setSelectedIds([]);
            } else {
                setItems(prev => [...prev, ...response.data.data]);
            }
            setPagination(response.data);
        } catch (error) {
            console.error("Gagal mengambil data inventaris:", error);
            showToast("Gagal mengambil data inventaris.", "error");
        } finally {
            if (page === 1) setLoading(false);
        }
    }, [showToast]);

    const fetchMobileItems = useCallback(async (page = 1, filters = {}) => {
        if (page === 1) setIsMobileLoading(true);
        try {
            const params = { page, ...filters };
            const response = await api.get('/inventory/items-flat', { params });
            if (page === 1) {
                setMobileItems(response.data.data);
            } else {
                setMobileItems(prev => [...prev, ...response.data.data]);
            }
            setMobilePagination(response.data);
        } catch (error) {
            console.error("Gagal mengambil data mobile:", error);
            showToast("Gagal mengambil data inventaris (mobile).", "error");
        } finally {
            if (page === 1) setIsMobileLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchItems(1, currentFilters);
        fetchMobileItems(1, currentFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchItems, fetchMobileItems]);

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

    const loadMoreMobileItems = async () => {
        if (isLoadingMoreMobile || !mobilePagination || mobilePagination.current_page >= mobilePagination.last_page) return;
        setIsLoadingMoreMobile(true);
        try {
            const nextPage = mobilePagination.current_page + 1;
            const params = { page: nextPage, ...currentFilters };
            const response = await api.get('/inventory/items-flat', { params });
            setMobileItems(prev => [...prev, ...response.data.data]);
            setMobilePagination(response.data);
        } catch (error) {
            showToast('Gagal memuat lebih banyak (mobile).', 'error');
        } finally {
            setIsLoadingMoreMobile(false);
        }
    };
    const handleMobileScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;
        if (nearBottom && !isMobileLoading && !isLoadingMoreMobile) {
            loadMoreMobileItems();
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
            const res = await api.get(`/inventory/items/variations/${kodeBarang}`);
            setDetailItems(prev => ({
                ...prev,
                [kodeBarang]: res.data 
            }));
        } catch (error) {
            console.error("Fetch Detail Error:", error);
            showToast('Gagal memuat detail SKU.', 'error');
            setExpandedRows(prev => ({ ...prev, [kodeBarang]: false })); 
        } finally {
            setExpandingId(null);
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
        fetchItems(1, currentFilters);
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
            
            if (response.status === 200 || response.status === 204) {
                showToast(response.data?.message || "Barang berhasil dihapus.");
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

    const handleFilterChange = useCallback((page, filters) => {
        setCurrentFilters(filters);
        fetchItems(1, filters);
        fetchMobileItems(1, filters);
    }, [fetchItems, fetchMobileItems]);

    return (
        <>
            <div className="user-management-container" style={{ marginBottom: '20px' }}>
                <h1>Tambah SKU</h1>
            </div>

            <ItemListView
                // Props Desktop
                items={items}
                loading={loading}
                onScroll={handleScroll}
                isLoadingMore={isLoadingMore}
                
                // Props Mobile
                mobileItems={mobileItems}
                isMobileLoading={isMobileLoading}
                onMobileScroll={handleMobileScroll}
                isLoadingMoreMobile={isLoadingMoreMobile}

                // Props Bersama
                totalItems={pagination?.total || 0} // <-- TAMBAHKAN BARIS INI
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
            />

            <ItemFormModal
                show={isItemModalOpen}
                onClose={handleCloseItemModal}
                onSave={handleSaveItem}
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
                message={`Anda yakin ingin menghapus "${itemToDelete?.nama_barang || 'item yang dipilih'}"?`}
                onConfirm={confirmDeleteItem}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </>
    );
}

export default ToolManagement;