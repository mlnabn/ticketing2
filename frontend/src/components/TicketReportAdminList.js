// file: src/components/TicketReportAdminList.js

import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ReportLineChart from './ReportLineChart';
import ComprehensiveReportPage from './ComprehensiveReportPage';
import TicketReportDetail from './TicketReportDetail'; // (BARU) Import komponen detail

// Helper untuk generate pilihan tahun
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }
  return years;
};

// (DIUBAH) Hapus prop onSelectAdmin karena tidak dibutuhkan lagi
export default function TicketReportAdminList({ onTicketClick }) {
  const [view, setView] = useState('main');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  // (BARU) State untuk menyimpan data admin yang dipilih untuk ditampilkan detailnya
  const [selectedAdminData, setSelectedAdminData] = useState(null);

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
      if (month) {
        params.month = month;
      }
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
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
  ];

  // (BARU) Fungsi untuk menangani saat admin dipilih dari daftar
  const handleAdminSelect = (admin) => {
    setSelectedAdminData({
      admin: admin,
      filters: {
        year: selectedYear,
        month: selectedMonth
      }
    });
    setView('admin_detail'); // Ganti view untuk menampilkan komponen detail
  };

  const renderMainView = () => (
    <>
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
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
      </div>
      <div className="report-navigation-cards">
        <div className="nav-card" onClick={() => setView('all_report')}>
          <h3>Laporan Seluruh Tiket</h3>
          <p>Lihat semua tiket sesuai filter di atas.</p>
        </div>
        <div className="nav-card" onClick={() => setView('worked_on_report')}>
          <h3>Laporan Tiket yang Dikerjakan</h3>
          <p>Hanya tiket yang ditangani admin (sesuai filter).</p>
        </div>
      </div>
      <hr className="report-divider" />
      <div className="user-management-container" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Pilih Admin Untuk Laporan Detail</h1>
        {loadingAdmins ? <p>Memuat data admin...</p> : (
          <div className="admin-list-grid">
            {admins.map(admin => (
              // (DIUBAH) onClick kini memanggil fungsi internal handleAdminSelect
              <div key={admin.id} className="admin-card" onClick={() => handleAdminSelect(admin)}>
                <div className="avatar">{admin.name.charAt(0)}</div>
                <div className="info">
                  <h3>{admin.name}</h3>
                  <p>{admin.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderCurrentView = () => {
    const filters = { year: selectedYear, month: selectedMonth };
    switch (view) {
      case 'all_report':
        return <ComprehensiveReportPage title="Laporan Seluruh Pekerjaan Admin" filterType="all" onBack={() => setView('main')} dateFilters={filters} onTicketClick={onTicketClick} />;
      case 'worked_on_report':
        return <ComprehensiveReportPage title="Laporan yang Dikerjakan Seluruh Admin" filterType="handled" onBack={() => setView('main')} dateFilters={filters} onTicketClick={onTicketClick} />;
      // (BARU) Tambahkan case untuk menampilkan TicketReportDetail
      case 'admin_detail':
        return <TicketReportDetail
          admin={selectedAdminData.admin}
          filters={selectedAdminData.filters}
          onBack={() => setView('main')}
          onTicketClick={onTicketClick}
        />;
      default:
        return renderMainView();
    }
  };

  return <>{renderCurrentView()}</>;
}