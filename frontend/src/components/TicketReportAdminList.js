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

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) years.push(currentYear - i);
  return years;
};

export default function TicketReportAdminList() {

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
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

  const fetchChartData = useCallback(async (year, month) => {
    if (!year) return;
    setLoadingChart(true);
    try {
      const params = { year };
      if (month) params.month = month;
      const res = await api.get('/tickets/report-analytics', { params });
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
    fetchChartData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, fetchChartData]);

  const yearOptions = generateYearOptions();
  const monthOptions = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  const filterQueryString = `?year=${selectedYear}${selectedMonth ? `&month=${selectedMonth}` : ''}`;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="report-header">
          <h2>Laporan Tiket</h2>
          <div className="report-filters">
            <div className="filter-group">
              <select id="month-selector" value={selectedMonth || ''} onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)} className="month-input">
                <option value="">Semua Bulan</option>
                {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select id="year-selector" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="month-input">
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        {loadingChart ? <p>Memuat data chart...</p> : <ReportLineChart data={chartData} />}
      </motion.div>

      <motion.div variants={staggerItem} className="report-navigation-cards">
        <Link to={`/admin/reports/all${filterQueryString}`} className="nav-card">
          <h3>Laporan Seluruh Tiket</h3><p>Lihat semua tiket sesuai filter di atas.</p>
        </Link>
        <Link to={`/admin/reports/handled${filterQueryString}`} className="nav-card">
          <h3>Laporan Tiket yang Dikerjakan</h3><p>Hanya tiket yang ditangani admin (sesuai filter).</p>
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