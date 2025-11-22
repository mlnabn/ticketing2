import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReportLineChart from './ReportLineChart';
import { motion, useIsPresent } from 'framer-motion';

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
  const isPresent = useIsPresent();
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  const fetchAdmins = useCallback(async (page = 1) => {
    const isDesktopInitialLoad = (page === 1) && !isMobile;

    if (page === 1) setLoadingAdmins(true);
    if (page > 1) setIsLoadingMore(true);

    try {
      const params = { page: page };
      if (isDesktopInitialLoad) {
        params.all = true;
      }

      const res = await api.get('/admins-for-report', { params });

      if (page === 1) {
        setAdmins(res.data.data || res.data);
      } else {
        setAdmins(prev => [...prev, ...res.data.data]);
      }
      if (!isDesktopInitialLoad) {
        setPagination(res.data);
      } else {
        setPagination(null);
      }

    } catch (err) {
      console.error('Gagal mengambil daftar admin:', err);
    } finally {
      setLoadingAdmins(false);
      if (page > 1) setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadMoreAdmins = useCallback(async () => {
    if (isLoadingMore || !pagination || pagination.current_page >= pagination.last_page) return;

    const nextPage = pagination.current_page + 1;
    fetchAdmins(nextPage);
  }, [isLoadingMore, pagination, fetchAdmins]);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 200;

    if (nearBottom && !loadingAdmins && !isLoadingMore && pagination && pagination.current_page < pagination.last_page) {
      loadMoreAdmins();
    }
  }, [loadingAdmins, isLoadingMore, pagination, loadMoreAdmins]);

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
    if (!isPresent) return;
    fetchAdmins(1);
  }, [fetchAdmins, isPresent]);

  useEffect(() => {
    if (!isPresent) return;
    fetchChartData();
  }, [fetchChartData, isPresent]);

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

      <motion.div
        variants={staggerItem}
        className="adminselect-card"
        style={

          isMobile ?
            { marginBottom: '2rem', maxHeight: '500px', overflowY: 'auto' } :
            { marginBottom: '2rem' }
        }

        ref={isMobile ? scrollRef : null}
        onScroll={isMobile ? handleScroll : null}
      >
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

            {isMobile && isLoadingMore && (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '10px' }}>
                Memuat lebih banyak admin...
              </div>
            )}
          </div>
        )}
        {!loadingAdmins && admins.length === 0 && <p style={{ textAlign: 'center' }}>Tidak ada data admin.</p>}
      </motion.div>
    </motion.div>
  );
}