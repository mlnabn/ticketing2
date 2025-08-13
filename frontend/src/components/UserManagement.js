import React from 'react';

// const API_URL = 'http://127.0.0.1:8000/api';

// 1. Terima semua props yang dibutuhkan: onAddClick, onEditClick, dan onDeleteClick
const UserManagement = ({ users, onAddClick, onEditClick, onDeleteClick }) => {
  // const [users, setUsers] = useState([]);
  
  // // Fungsi fetchUsers ini akan dipanggil ulang dari App.js,
  // // jadi kita bisa sederhanakan di sini.
  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  // const fetchUsers = async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/users`, {
  //       headers: { Authorization: `Bearer ${getToken()}` }
  //     });
  //     setUsers(response.data);
  //   } catch (error) {
  //     console.error("Gagal mengambil data pengguna:", error);
  //   }
  // };

  return (
    <div className="user-management-container">
      <div className="flex justify-between items-center mb-4">
        <h1>Manajemen Pengguna</h1>
        <button onClick={onAddClick} className="btn-primary">Tambah Pengguna Baru</button>
      </div>

      <div className="user-list-table">
        <table className='job-table'>
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
            {/* Langsung gunakan prop 'users' untuk me-render tabel */}
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
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
    </div>
  );
};

export default UserManagement;