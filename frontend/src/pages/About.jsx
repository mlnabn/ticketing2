import React, { useState, useEffect } from 'react';
import AboutUsPage from '../components/AboutUsPage';
import api from '../services/api';
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
    if (loggedIn) {
      fetchAdmins();
    }
  }, [loggedIn]);

  return <AboutUsPage adminList={adminList} />;
}