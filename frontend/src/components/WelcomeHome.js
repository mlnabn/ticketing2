import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

import { motion, useIsPresent } from 'framer-motion';

import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import BarChartComponent from './BarChartComponent';
import MapComponent from './MapComponent';
import CalendarComponent from './CalendarComponent';
import { Bold } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1, // Jeda antar blok
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

export default function WelcomeHome() {
  const isPresent = useIsPresent();
  const { logout } = useAuth();
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
    if (!isPresent) return;
    fetchDashboardData();
  }, [fetchDashboardData, isPresent]);

  const handleCardClick = (status) => {
    navigate(`/admin/tickets?status=${status}`);
  };

  const handleChartFilter = (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    navigate(`/admin/tickets?${queryParams}`);
  };

  const handleBarOrLegendClick = (data) => {
    const filters = { status: data.status };
    if (data.id) {
      filters.adminId = data.id;
    }
    handleChartFilter(filters);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* <div className="welcome-header">
        <h1>Selamat Datang, {user?.name || 'Admin'}!</h1>
        <p>Berikut adalah ringkasan aktivitas sistem saat ini.</p>
      </div> */}

      {/* Kartu Statistik */}
      <motion.div variants={staggerItem}>
        <div className="info-cards-grid">
          <div className="info-card red-card" onClick={() => handleCardClick('Belum Selesai')}>
            <div className="card-header">
              <p className="card-label" style={{fontWeight : 'bold'}}>Tiket Belum Selesai</p>
              <div className="card-icon red-icon"><i className="fas fa-exclamation-triangle"></i></div>
            </div>
            <h3 className="card-value">{stats ? stats.pending_tickets : '...'}</h3>
          </div>
          <div className="info-card green-card" onClick={() => handleCardClick('Selesai')}>
            <div className="card-header">
              <p className="card-label" style={{fontWeight : 'bold'}}>Tiket Selesai</p>
              <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
            </div>
            <h3 className="card-value">{stats ? stats.completed_tickets : '...'}</h3>
          </div>
          <div className="info-card yellow-card" onClick={() => navigate('/admin/tickets')}>
            <div className="card-header">
              <p className="card-label" style={{fontWeight : 'bold'}}>Total Tiket</p>
              <div className="card-icon yellow-icon"><i className="fas fa-tasks"></i></div>
            </div>
            <h3 className="card-value">{stats ? stats.total_tickets : '...'}</h3>
          </div>
          <div className="info-card blue-card" onClick={() => navigate('/admin/users')}>
            <div className="card-header">
              <p className="card-label" style={{fontWeight : 'bold'}}>Total Pengguna</p>
              <div className="card-icon blue-icon"><i className="fas fa-users"></i></div>
            </div>
            <h3 className="card-value">{stats ? stats.total_users : '...'}</h3>
          </div>
        </div>
      </motion.div>

      {/* Kontainer Chart */}
      <div className="dashboard-container2">
        <motion.div variants={staggerItem} className="dashboard-row2">
          <div className="dashboard-card line-chart-card">
            <h4>Tren Tiket (30 Hari Terakhir)</h4>
            <LineChartComponent data={analyticsData} onPointClick={(status, date) => handleChartFilter({ status, date })} onLegendClick={(status) => handleChartFilter({ status })} />
          </div>
          <div className="dashboard-card pie-chart-card">
            <h4>Status Tiket</h4>
            <PieChartComponent stats={stats} handleStatusFilterClick={(status) => handleChartFilter({ status })} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="dashboard-row">
          <div className="dashboard-card bar-chart-card">
            <h4>Performa Admin</h4>
            <BarChartComponent data={adminPerformanceData} onBarClick={handleBarOrLegendClick} />
          </div>
          <div className="dashboard-card map-chart-card">
            <h4>Geografi Traffic</h4>
            <MapComponent data={locationsData} />
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="dashboard-card calendar-card">
          <h4>Kalender Tiket</h4>
          <CalendarComponent tickets={allTickets} onTicketClick={(ticketId) => handleChartFilter({ ticketId })} />
        </motion.div>

       

          <div className="ticket-legend" style={{ marginTop: "10px", fontSize: "13px" }}>
            <div className="legend-item legend-green">
              <span className="legend-dot dot-green"></span>
              <span>Selesai</span>
            </div>
            <div className="legend-item legend-yellow">
              <span className="legend-dot dot-yellow"></span>
              <span>Sedang Dikerjakan</span>
            </div>
            <div className="legend-item legend-blue">
              <span className="legend-dot dot-blue"></span>
              <span>Belum Dikerjakan</span>
            </div>
            <div className="legend-item legend-gray">
              <span className="legend-dot dot-gray"></span>
              <span>Ditunda</span>
            </div>
            <div className="legend-item legend-red">
              <span className="legend-dot dot-red"></span>
              <span>Ditolak</span>
            </div>
          </div>
       

      </div>
    </motion.div>
  );
}