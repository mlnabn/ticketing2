import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth';

const API_URL = 'http://127.0.0.1:8000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    }
  };

  // Nanti kita akan tambahkan fungsi edit dan hapus di sini

  return (
    <div className="user-management-container">
      <div className="flex justify-between items-center mb-4">
        <h1>Manajemen Pengguna</h1>
        {/* Tombol ini nantinya akan membuka form Tambah User */}
        <button className="btn-primary">Tambah Pengguna Baru</button>
      </div>

      <div className="user-list-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <div className="action-buttons-group">
                    {/* Tombol ini nantinya akan membuka form Edit User */}
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;