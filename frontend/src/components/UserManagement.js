import React, { useState } from 'react';
import Pagination from './Pagination';

const UserManagement = ({ userData, onAddClick, onEditClick, onDeleteClick, onPageChange, onSearch }) => {
    const [searchInput, setSearchInput] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchInput);
    };

    // Definisikan 'users' di atas agar bisa diakses di kondisi render
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
            {/* ===         LOGIKA KONDISIONAL UNTUK LOADING        === */}
            {/* ======================================================= */}
            {!userData ? (
                <p>Memuat data pengguna...</p>
            ) : users.length === 0 ? (
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Tidak ada pengguna yang ditemukan.</p>
                </div>
            ) : (
                <>
                    {/* Tampilan Tabel untuk Desktop */}
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

                    {/* Tampilan Kartu untuk Mobile */}
                    <div className="user-list-mobile">
                        {users.map((user, index) => (
                            <div key={user.id} className="user-card-mobile">
                                <div className="user-card-header">
                                  <span className="user-number">{userData.from + index}</span>
                                  <span className="user-role">{user.role}</span>
                                </div>
                                <div className="user-card-body">
                                  <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-email">{user.email}</span>
                                  </div>
                                  <div className="action-buttons-group">
                                      <button onClick={() => onEditClick(user)} className="btn-edit">Edit</button>
                                      <button onClick={() => onDeleteClick(user)} className="btn-delete">Hapus</button>
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Tampilkan Pagination hanya jika ada data */}
                    {userData.last_page > 1 && (
                        <Pagination
                            currentPage={userData.current_page}
                            lastPage={userData.last_page}
                            onPageChange={onPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default UserManagement;