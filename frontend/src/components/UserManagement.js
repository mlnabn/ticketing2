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

    const users = userData ? userData.data : [];

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
            {!userData ? (
                <p>Memuat data pengguna...</p>
            ) : (
                <>
                    <div className="table-scroll-container">
                        <table className='job-table'>
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>No.</th>
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
                            style={{ overflowY: 'auto', maxHeight: '65vh' }}
                        >
                            <table className='job-table'>
                                <tbody>
                                    {users.length === 0 && !isLoadingMore ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Tidak ada pengguna yang ditemukan.</td></tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr key={user.id} className="hoverable-row" onClick={(e) => handleRowClick(e, user)}>
                                                <td style={{ width: '50px' }}>{userData.from + index}</td>
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