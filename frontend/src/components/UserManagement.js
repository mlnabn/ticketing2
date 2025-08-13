import React, { useState } from 'react';
import Pagination from './Pagination';

// Terima semua data dan fungsi sebagai props
const UserManagement = ({ userData, onAddClick, onEditClick, onDeleteClick, onPageChange, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  // Ambil array user dari objek paginasi
  const users = userData ? userData.data : [];

  return (
    <div className="user-management-container">
      <div className="flex justify-between items-center mb-4">
        <h1>Manajemen Pengguna</h1>
        <button onClick={onAddClick} className="btn-primary">
          Tambah Pengguna Baru
        </button>
      </div>

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

      <div className="user-list-table">
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
                    <button onClick={() => onEditClick(user)} className="btn-edit">Edit</button>
                    <button onClick={() => onDeleteClick(user)} className="btn-delete">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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