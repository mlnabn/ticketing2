import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import BarChartComponent from './BarChartComponent';
import MapComponent from './MapComponent';
import CalendarComponent from './CalendarComponent';

export default function WelcomeHome() {
  const { user, logout } = useAuth();
  const { showToast } = useOutletContext();
  const navigate = useNavigate(); 

  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [adminPerformanceData, setAdminPerformanceData] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard-data');
      const data = response.data;

      setStats(data.stats);
      setAnalyticsData(data.analyticsData);
      setAdminPerformanceData(data.adminPerformance);
      setAllTickets(data.allTicketsForCalendar);
      setLocationsData(data.locations);

    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      showToast('Gagal memuat data dashboard.', 'error');
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [logout, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCardClick = (status) => {
    navigate(`/admin/tickets?status=${status}`);
  };

  const handleChartFilter = (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    navigate(`/admin/tickets?${queryParams}`);
  };

  return (
    <>
      <div className="welcome-header">
        <h1>Selamat Datang, {user?.name || 'Admin'}!</h1>
        <p>Berikut adalah ringkasan aktivitas sistem saat ini.</p>
      </div>

      {/* Kartu Statistik */}
      <div className="info-cards-grid">
        <div className="info-card red-card" onClick={() => handleCardClick('Belum Selesai')}>
          <div className="card-header">
            <p className="card-label">Tiket Belum Selesai</p>
            <div className="card-icon red-icon"><i className="fas fa-exclamation-triangle"></i></div>
          </div>
          <h3 className="card-value">{stats ? stats.pending_tickets : '...'}</h3>
        </div>
        <div className="info-card green-card" onClick={() => handleCardClick('Selesai')}>
          <div className="card-header">
            <p className="card-label">Tiket Selesai</p>
            <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
          </div>
          <h3 className="card-value">{stats ? stats.completed_tickets : '...'}</h3>
        </div>
        <div className="info-card yellow-card" onClick={() => navigate('/admin/tickets')}>
          <div className="card-header">
            <p className="card-label">Total Tiket</p>
            <div className="card-icon yellow-icon"><i className="fas fa-tasks"></i></div>
          </div>
          <h3 className="card-value">{stats ? stats.total_tickets : '...'}</h3>
        </div>
        <div className="info-card blue-card" onClick={() => navigate('/admin/users')}>
          <div className="card-header">
            <p className="card-label">Total Pengguna</p>
            <div className="card-icon blue-icon"><i className="fas fa-users"></i></div>
          </div>
          <h3 className="card-value">{stats ? stats.total_users : '...'}</h3>
        </div>
      </div>

      {/* Kontainer Chart */}
      <div className="dashboard-container2">
        <div className="dashboard-row">
          <div className="dashboard-card line-chart-card">
            <h4>Tren Tiket (30 Hari Terakhir)</h4>
            <LineChartComponent data={analyticsData} onPointClick={(status, date) => handleChartFilter({ status, date })} onLegendClick={(status) => handleChartFilter({ status })} />
          </div>
          <div className="dashboard-card pie-chart-card">
            <h4>Status Tiket</h4>
            <PieChartComponent stats={stats} handleStatusFilterClick={(status) => handleChartFilter({ status })} />
          </div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-card bar-chart-card">
            <h4>Performa Admin</h4>
            <BarChartComponent data={adminPerformanceData} onBarClick={(admin) => handleChartFilter({ status: admin.status, adminId: admin.id })} />
          </div>
          <div className="dashboard-card map-chart-card">
            <h4>Geografi Traffic</h4>
            <MapComponent data={locationsData} />
          </div>
        </div>
        <div className="dashboard-column2">
          <div className="dashboard-card calendar-card">
            <h4>Kalender Tiket</h4>
            <CalendarComponent tickets={allTickets} onTicketClick={(ticketId) => handleChartFilter({ ticketId })} />
          </div>
        </div>
      </div>
    </>
  );
}