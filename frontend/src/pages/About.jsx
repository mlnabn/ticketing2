import React, { useState, useEffect } from 'react';
import AboutUsPage from '../components/AboutUsPage'; // Impor komponen utama
import api from '../services/api'; // Impor instance API untuk fetch data
import { useAuth } from '../AuthContext';

export default function AboutRoute() {
  const [adminList, setAdminList] = useState([]);
  const { loggedIn } = useAuth();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await api.get('/admins');
        setAdminList(response.data);
      } catch (error) {
        console.error("Gagal mengambil daftar admin:", error);
      }
    };

    // 3. Hanya jalankan fetchAdmins JIKA pengguna sudah login
    if (loggedIn) {
      fetchAdmins();
    }
  }, [loggedIn]);

  return <AboutUsPage adminList={adminList} />;
}