import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReportLineChart from './ReportLineChart';
import { motion } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export default function TicketReportAdminList() {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const res = await api.get('/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar admin:', err);
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const res = await api.get('/tickets/report-analytics');
      setChartData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data chart:', err);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const filterQueryString = '';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="report-header">
          <h2>Laporan Tiket</h2>
        </div>
        {loadingChart ? <p>Memuat data chart...</p> : <ReportLineChart data={chartData} />}
      </motion.div>

      <motion.div variants={staggerItem} className="report-navigation-cards">
        <Link to={`/admin/reports/all${filterQueryString}`} className="nav-card">
          <h3>Laporan Seluruh Tiket</h3><p>Lihat semua tiket sesuai filter di atas.</p>
        </Link>
        <Link to={`/admin/reports/handled${filterQueryString}`} className="nav-card">
          <h3>Laporan Tiket yang Dikerjakan</h3><p>Hanya tiket yang ditangani admin.</p>
        </Link>
      </motion.div>

      <motion.hr variants={staggerItem} className="report-divider" />

      <motion.div variants={staggerItem} className="adminselect-card" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Pilih Admin Untuk Laporan Detail</h1>
        {loadingAdmins ? <p>Memuat data admin...</p> : (
          <div className="admin-list-grid">
            {admins.map(admin => (
              <Link to={`/admin/reports/admin/${admin.id}${filterQueryString}`} key={admin.id} className="admin-card">
                <div className="avatar">{admin.name.charAt(0)}</div>
                <div className="info">
                  <h3>{admin.name}</h3>
                  <p title={admin.email}>{admin.email}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div> // 
  );
}