import React, { useState } from 'react';
import Pagination from './Pagination';

const UserManagement = ({ userData, onAddClick, onEditClick, onDeleteClick, onPageChange, onSearch }) => {
    const [searchInput, setSearchInput] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchInput);
    };

    const users = userData ? userData.data : [];

    return (
        <div className="user-management-container">
            <h1>Manajemen Pengguna</h1>
            <button onClick={onAddClick} className="btn-primary">
                Tambah Pengguna Baru
            </button>
            <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>Cari</button>
            </form>

            {/* ======================================================= */}
            {/* ===    TAMPILAN TABEL UNTUK DESKTOP (TETAP SAMA)    === */}
            {/* ======================================================= */}
            <div className="user-list-table">
                <table className='user-table'>
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
                            <tr key={user.id}>
                                <td>{userData.from + index}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <div className="action-buttons-group">
                                        <button onClick={() => onEditClick(user)} className="btn-user-action btn-edit">Edit</button>
                                        <button onClick={() => onDeleteClick(user)} className="btn-user-action btn-delete">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ======================================================= */}
            {/* ===      TAMPILAN KARTU BARU UNTUK MOBILE           === */}
            {/* ======================================================= */}
            <div className="user-list-mobile">
                {users.map(user => (
                    <div key={user.id} className="user-card-mobile">
                        {/* Baris 1: Nama dan Email */}
                        <div className="user-card-row">
                            <div className="user-data-group">
                                <span className="label">Nama</span>
                                <span className="value">{user.name}</span>
                            </div>
                            <div className="user-data-group">
                                <span className="label">Email</span>
                                <span className="value">{user.email}</span>
                            </div>
                        </div>
                        {/* Baris 2: Peran dan Aksi */}
                        <div className="user-card-row">
                            <div className="user-data-group">
                                <span className="label">Peran</span>
                                <span className="value role">{user.role}</span>
                            </div>
                            <div className="action-buttons-group">
                                <button onClick={() => onEditClick(user)} className="btn-edit">Edit</button>
                                <button onClick={() => onDeleteClick(user)} className="btn-delete">Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {userData && (
                <Pagination
                    currentPage={userData.current_page}
                    lastPage={userData.last_page}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default UserManagement;