import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import UserFormModal from './UserFormModal';
import ConfirmationModal from './ConfirmationModal';
import UserDetailModal from './UserDetailModal';

export default function UserManagement() {
    const { showToast } = useOutletContext();
    const { logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [showUserConfirmModal, setShowUserConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showUserFormModal, setShowUserFormModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [detailUser, setDetailUser] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const desktopListRef = useRef(null);
    const mobileListRef = useRef(null);

    const fetchUsers = useCallback(async (search) => {
        try {
            const response = await api.get('/users', { params: { page: 1, search } });
            setUserData(response.data);
        } catch (e) {
            console.error('Gagal mengambil data pengguna:', e);
            if (e.response?.status === 401) logout();
        }
    }, [logout]);

    useEffect(() => {
        fetchUsers(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchUsers]);

    const loadMoreItems = async () => {
        if (isLoadingMore || !userData || userData.current_page >= userData.last_page) return;

        setIsLoadingMore(true);
        try {
            const nextPage = userData.current_page + 1;
            const response = await api.get('/users', { params: { page: nextPage, search: debouncedSearchTerm } });

            setUserData(prev => ({
                ...response.data,
                from: prev.from,
                data: [...prev.data, ...response.data.data]
            }));
        } catch (e) {
            console.error('Gagal memuat data pengguna tambahan:', e);
            showToast('Gagal memuat lebih banyak pengguna.', 'error');
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

        if (nearBottom && userData && !isLoadingMore && userData.current_page < userData.last_page) {
            loadMoreItems();
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        setSelectedIds(e.target.checked ? users.map(u => u.id) : []);
    };

    const handleUserDeleteClick = (user) => {
        setUserToDelete(user);
        setShowUserConfirmModal(true);
    };

    const confirmUserDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            showToast(`User "${userToDelete.name}" berhasil dihapus.`, 'success');
            fetchUsers(debouncedSearchTerm);
        } catch (e) {
            showToast('Gagal menghapus pengguna.', 'error');
        } finally {
            setShowUserConfirmModal(false);
            setUserToDelete(null);
        }
    };

    const handleEditRequest = (userToEditFromModal) => {
        setDetailUser(null);
        setUserToEdit(userToEditFromModal);
        setShowUserFormModal(true);
    };

    const handleAddUserClick = () => {
        setUserToEdit(null);
        setShowUserFormModal(true);
    };

    const handleUserEditClick = (user) => {
        setUserToEdit(user);
        setShowUserFormModal(true);
    };

    const handleSaveUser = async (formData) => {
        const isEditMode = Boolean(userToEdit);
        const url = isEditMode ? `/users/${userToEdit.id}` : '/users';
        const method = isEditMode ? 'post' : 'post';

        try {
            const res = await api[method](url, formData);
            showToast(isEditMode ? `User "${res.data.name}" berhasil di-edit.` : 'User baru berhasil dibuat.', 'success');
            fetchUsers(debouncedSearchTerm);
            setShowUserFormModal(false);
            setUserToEdit(null);
        } catch (e) {
            console.error('Gagal menyimpan pengguna:', e);
            const msgs = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join('\n') : 'Gagal menyimpan pengguna.';
            showToast(msgs, 'error');
        }
    };
    const handleRowClick = (e, user) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) {
            return;
        }
        setDetailUser(user);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            showToast('Pilih setidaknya satu pengguna untuk dihapus.', 'info');
            return;
        }
        if (window.confirm(`Anda yakin ingin menghapus ${selectedIds.length} pengguna yang dipilih?`)) {
            try {
                const response = await api.post('/users/bulk-delete', { ids: selectedIds });
                showToast(response.data.message, 'success');
                fetchUsers(debouncedSearchTerm);
                setSelectedIds([]);
            } catch (e) {
                console.error('Gagal menghapus pengguna secara massal:', e);
                showToast(e.response?.data?.message || 'Terjadi kesalahan saat mencoba menghapus pengguna.', 'error');
            }
        }
    };

    const users = userData ? userData.data : [];
    const isAllSelectedOnPage = users.length > 0 && selectedIds.length === users.length;

    return (
        <div className="user-management-container">

            <h1 className="page-title">Manajemen Pengguna</h1>

            <button onClick={handleAddUserClick} className="btn-primary">
                <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                Tambah Pengguna
            </button>
            <div className="filters-container report-filters" style={{ margin: '20px 0' }}>
                <input
                    type="text"
                    placeholder="Cari nama, email, atau peran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-search-input"
                />
            </div>
            {selectedIds.length > 0 && (
                <div className="bulk-action-bar" style={{ margin: '20px 0' }}>
                    <button onClick={handleBulkDelete} className="btn-delete">
                        Hapus {selectedIds.length} Pengguna yang Dipilih
                    </button>
                </div>
            )}
            {!userData ? (
                <p>Memuat data pengguna...</p>
            ) : (
                <>
                    <div className="table-scroll-container">
                        <table className='job-table'>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={isAllSelectedOnPage}
                                        />
                                    </th>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Peran</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                        <div
                            className="table-body-scroll"
                            ref={desktopListRef}
                            onScroll={handleScroll}
                            style={{ overflowY: 'auto', maxHeight: '70vh' }}
                        >
                            <table className='job-table'>
                                <tbody>
                                    {users.length === 0 && !isLoadingMore ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada pengguna yang ditemukan.</td></tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className={`hoverable-row ${selectedIds.includes(user.id) ? 'selected-row' : ''}`}
                                                onClick={(e) => handleRowClick(e, user)}
                                            >
                                                <td style={{ width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(user.id)}
                                                        onChange={() => handleSelect(user.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.role}</td>
                                                <td>
                                                    <div className="action-buttons-group">
                                                        <button onClick={() => handleUserEditClick(user)} className="btn-user-action btn-edit">Edit</button>
                                                        <button onClick={() => handleUserDeleteClick(user)} className="btn-user-action btn-delete">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {isLoadingMore && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!isLoadingMore && userData && userData.total > 0 && (
                            <table className="job-table">
                                <tfoot>
                                    <tr className="subtotal-row">
                                        <td colSpan="4" style={{ textAlign: 'left', paddingLeft: '1.25rem', fontWeight: 'bold' }}>
                                            Total Pengguna
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {userData.total}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>

                    <div
                        className="user-list-mobile"
                        ref={mobileListRef}
                        onScroll={handleScroll}
                        style={{ overflowY: 'auto', maxHeight: '65vh' }}
                    >
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div key={user.id} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, user)}>
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">NAMA</span>
                                            <span className="value">{user.name}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">EMAIL</span>
                                            <span className="value">{user.email}</span>
                                        </div>
                                    </div>
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">PERAN</span>
                                            <span className="value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                                        </div>
                                    </div>
                                    <div className="action-row">
                                        <div className="action-buttons-group">
                                            <button onClick={() => handleUserEditClick(user)} className="btn-edit">Edit</button>
                                            <button onClick={() => handleUserDeleteClick(user)} className="btn-delete">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !isLoadingMore && <p style={{ textAlign: 'center' }}>Tidak ada pengguna yang ditemukan.</p>
                        )}
                        {isLoadingMore && (
                            <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                        )}
                    </div>
                </>
            )}
            {showUserFormModal && (
                <UserFormModal userToEdit={userToEdit} onClose={() => { setShowUserFormModal(false); setUserToEdit(null); }} onSave={handleSaveUser} />
            )}
            {showUserConfirmModal && (
                <ConfirmationModal message={`Anda yakin ingin menghapus pengguna "${userToDelete?.name}"?`} onConfirm={confirmUserDelete} onCancel={() => setShowUserConfirmModal(false)} />
            )}
            {detailUser && (
                <UserDetailModal
                    user={detailUser}
                    onClose={() => setDetailUser(null)}
                    onEditRequest={handleEditRequest}
                />
            )}
        </div>
    );
};