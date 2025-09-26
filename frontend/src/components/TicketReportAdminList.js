// file: src/components/TicketReportAdminList.js
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ReportLineChart from './ReportLineChart';
import ComprehensiveReportPage from './ComprehensiveReportPage';
import DatePicker from "react-datepicker";

export default function TicketReportAdminList({ onSelectAdmin }) {
  const [view, setView] = useState('main');

  // (DIUBAH) Kita hanya butuh satu state untuk tanggal
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State untuk daftar admin
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // State untuk chart
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

  // (DIUBAH) Fungsi ini sekarang menerima objek Date, bukan string
  const fetchChartData = useCallback(async (date) => {
    if (!date) return;
    setLoadingChart(true);
    try {

      const year = date.getFullYear();
      const monthValue = date.getMonth() + 1;

      const res = await api.get('/tickets/report-analytics', {
        params: { year, month: monthValue }
      });
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
    fetchChartData(selectedDate);
  }, [selectedDate, fetchChartData]);

  const renderMainView = () => (
    <>
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <div className="report-header">
          <h2>Laporan Tiket</h2>
          <div className="month-picker-container">
            <label htmlFor="month-selector">Pilih Bulan:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className="month-input"
            />
          </div>
        </div>
        {loadingChart ? <p>Memuat data chart...</p> : <ReportLineChart data={chartData} />}
      </div>
      <div className="report-navigation-cards">
        <div className="nav-card" onClick={() => setView('all_report')}>
          <h3>Laporan Seluruh Pekerjaan</h3>
          <p>Lihat semua tiket dengan berbagai status.</p>
          <i className="fas fa-arrow-right"></i>
        </div>
        <div className="nav-card" onClick={() => setView('worked_on_report')}>
          <h3>Laporan Tiket Dikerjakan</h3>
          <p>Hanya tiket yang sudah ditangani admin.</p>
          <i className="fas fa-arrow-right"></i>
        </div>
      </div>
      <hr className="report-divider" />

      <div className="adminselect-card" style={{ marginBottom: '2rem' }}>
      <h2 className="page-title">Pilih Admin</h2>
      {loadingAdmins ? <p>Memuat data admin...</p> : (
        <div className="admin-list-grid">
          {admins.map(admin => (
            <div key={admin.id} className="admin-card" onClick={() => onSelectAdmin(admin)}>
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

  // Fungsi renderCurrentView tidak berubah
  const renderCurrentView = () => {
    switch (view) {
      case 'all_report':
        return <ComprehensiveReportPage
          title="Laporan Seluruh Pekerjaan Admin"
          filterType="all"
          onBack={() => setView('main')}
        />;
      case 'worked_on_report':
        return <ComprehensiveReportPage
          title="Laporan yang Dikerjakan Seluruh Admin"
          filterType="worked_on"
          onBack={() => setView('main')}
        />;
      default:
        return renderMainView();
    }
  };

  return <>{renderCurrentView()}</>;
}