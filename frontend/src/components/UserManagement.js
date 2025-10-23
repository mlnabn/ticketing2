import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { useAuth } from '../AuthContext';

import Pagination from './Pagination';
import UserFormModal from './UserFormModal';
import ConfirmationModal from './ConfirmationModal';
import UserDetailModal from './UserDetailModal';

export default function UserManagement() {
    const { showToast } = useOutletContext();
    const { logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [userPage, setUserPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [showUserConfirmModal, setShowUserConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showUserFormModal, setShowUserFormModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [detailUser, setDetailUser] = useState(null);

    const fetchUsers = useCallback(async (page, search) => {
        try {
            const response = await api.get('/users', { params: { page, search } });
            setUserData(response.data);
        } catch (e) {
            console.error('Gagal mengambil data pengguna:', e);
            if (e.response?.status === 401) logout();
        }
    }, [logout]);

    useEffect(() => {
        fetchUsers(userPage, debouncedSearchTerm);
    }, [userPage, debouncedSearchTerm, fetchUsers]);

    const handleUserDeleteClick = (user) => {
        setUserToDelete(user);
        setShowUserConfirmModal(true);
    };

    const confirmUserDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            showToast(`User "${userToDelete.name}" berhasil dihapus.`, 'success');
            fetchUsers(userPage, debouncedSearchTerm);
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
            fetchUsers(userPage, debouncedSearchTerm);
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
            ) : users.length === 0 ? (
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Tidak ada pengguna yang ditemukan.</p>
                </div>
            ) : (
                <>
                    <div className="job-list-table">
                        <table className='job-table'>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Peran</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id} className="hoverable-row" onClick={(e) => handleRowClick(e, user)}>
                                        <td>{userData.from + index}</td>
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
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="user-list-mobile">
                        {users.map((user) => (
                            // --- TAMBAHAN: onClick event ---
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
                        ))}
                    </div>

                    {userData.last_page > 1 && (
                        <Pagination
                            currentPage={userData.current_page}
                            lastPage={userData.last_page}
                            onPageChange={setUserPage}
                        />
                    )}
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