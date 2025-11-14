import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import {
  HiOutlineHome,
  HiOutlineTicket,
  HiOutlineArchiveBox,
  HiOutlineCog6Tooth
} from "react-icons/hi2"; // Versi Outline (default)
import {
  HiHome,
  HiTicket,
  HiArchiveBox,
  HiCog6Tooth
} from "react-icons/hi2"; // Versi Solid (aktif)

import Toast from '../components/Toast';
import yourLogok from '../Image/DTECH-Logo.png';

const MobileNavLink = ({ to, end, icon, text, onClick }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <i className={`fas ${icon}`}></i><span className="nav-text">{text}</span>
  </NavLink>
);

const pageTransitionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState(user?.name || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const toggleSidebar = () => setIsSidebarOpen(v => !v);
  const toggleDarkMode = () => setDarkMode(v => !v);
  const handleLogout = useCallback(() => { 
    document.body.classList.remove('dark-mode');
    localStorage.removeItem('darkMode'); 
    logout?.(); 
  }, [logout]);

  useEffect(() => { setUserName(user?.name || ''); }, [user]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      <motion.aside
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="sidebar-header">
          <img src={yourLogok} alt="Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="sidebar-nav-item">
              <NavLink to="/admin" end className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-home"></i><span className="nav-text">Home</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-user-plus"></i><span className="nav-text">Pengguna</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/notifications" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-bell"></i><span className="nav-text">Notifikasi</span>
              </NavLink>
            </li>

            <li className="sidebar-divider"><span className="nav-text">Ticketing</span></li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/tickets" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-ticket-alt"></i><span className="nav-text">Daftar Tiket</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/my-tickets" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-user-tag"></i><span className="nav-text">Tiket Saya</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-file-alt"></i><span className="nav-text">Laporan Tiket</span>
              </NavLink>
            </li>

            <li className="sidebar-divider"><span className="nav-text">Inventory</span></li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/inventory" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-warehouse"></i><span className="nav-text">Tipe Barang</span>
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/admin/stock" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-boxes"></i><span className="nav-text">Stok Barang</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/inventory-reports" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-chart-line"></i><span className="nav-text">Laporan Inventory</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/financial-report" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-file-invoice-dollar"></i><span className="nav-text">Laporan Keuangan</span>
              </NavLink>
            </li>

            <li className="sidebar-divider"><span className="nav-text">Settings</span></li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/templates" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-paste"></i><span className="nav-text">Template Notif</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink to="/admin/workshops" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-cogs"></i><span className="nav-text"> Daftar Workshop</span>
              </NavLink>
            </li>

          </ul>
        </nav>
      </motion.aside>

      {isSidebarOpen && <div className="content-overlay" onClick={toggleSidebar}></div>}

      <main className="main-content">

        <motion.header
          className="main-header"
          initial={{ y: -80, opacity: 0 }} // Mulai dari atas dan transparan
          animate={{ y: 0, opacity: 1 }}    // Selesai di posisi normal
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <div className="header-left-group">
            <button className="hamburger-menu-button" onClick={toggleSidebar}><span /><span /><span /></button>
            <h1 className="dashboard-header-title">Admin Dashboard</h1>
          </div>
          <div className="admin-user-info-container">
            <motion.div className="user-info">
              <button onClick={toggleDarkMode} className="theme-toggle-button" aria-label="Toggle Dark Mode">
                {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
              </button>
              <motion.div 
                className="user-profile-clickable" 
                onClick={() => setIsAdminDropdownOpen(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="user-avatar"><FaUser /></div>
                <span><strong>{userName || "User"}</strong></span>
              </motion.div>
            </motion.div>
            <AnimatePresence>
              {isAdminDropdownOpen && (
                <>
                  <motion.div 
                    className="dropdown-overlay" 
                    onClick={() => setIsAdminDropdownOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div 
                    className="admin-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransitionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="page-transition-wrapper"
            >
              <Outlet context={{ showToast }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* --- TAMBAHKAN SEMUA KODE DI BAWAH INI --- */}
      {/* ---------------------------------------------------- */}

      {/* 1. OVERLAY (untuk menutup modal saat diklik di luar) */}
      {activeMobileMenu && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setActiveMobileMenu(null)}
        ></div>
      )}

      {/* 2. KARTU NAVIGASI (MODAL) */}
      <AnimatePresence>
        {activeMobileMenu && (
          <motion.div
            key={activeMobileMenu}
            className="mobile-nav-card"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="mobile-nav-card-header">
              <h3>{activeMobileMenu}</h3>
              <button onClick={() => setActiveMobileMenu(null)}>&times;</button>
            </div>
            <nav className="mobile-nav-card-links">
              {/* Gunakan helper MobileNavLink yang kita buat */}
              {activeMobileMenu === 'Home' && (
                <>
                  <MobileNavLink to="/admin" end icon="fa-home" text="Home" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/users" icon="fa-user-plus" text="Pengguna" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/notifications" icon="fa-bell" text="Notifikasi" onClick={() => setActiveMobileMenu(null)} />
                </>
              )}
              {activeMobileMenu === 'Ticketing' && (
                <>
                  <MobileNavLink to="/admin/tickets" icon="fa-ticket-alt" text="Daftar Tiket" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/my-tickets" icon="fa-user-tag" text="Tiket Saya" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/reports" icon="fa-file-alt" text="Laporan Tiket" onClick={() => setActiveMobileMenu(null)} />
                </>
              )}
              {activeMobileMenu === 'Inventory' && (
                <>
                  <MobileNavLink to="/admin/inventory" icon="fa-warehouse" text="Tambah SKU" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/stock" icon="fa-boxes" text="Stok Barang" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/inventory-reports" icon="fa-chart-line" text="Laporan Inventory" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/financial-report" icon="fa-file-invoice-dollar" text="Laporan Keuangan" onClick={() => setActiveMobileMenu(null)} />
                </>
              )}
              {activeMobileMenu === 'Settings' && (
                <>
                  {/* Link Halaman Setting yang sudah ada */}
                  <MobileNavLink to="/admin/templates" icon="fa-paste" text="Template Notif" onClick={() => setActiveMobileMenu(null)} />
                  <MobileNavLink to="/admin/workshops" icon="fa-cogs" text="Daftar Workshop" onClick={() => setActiveMobileMenu(null)} />

                  {/* Garis Pemisah */}
                  <div className="mobile-modal-divider"></div>

                  {/* Toggle Dark Mode */}
                  <div className="mobile-modal-setting-item">
                    <span>Mode Gelap</span>
                    <label className="mobile-switch">
                      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                      <span className="mobile-slider"></span>
                    </label>
                  </div>

                  {/* Info Profil & Tombol Logout */}
                  <div className="mobile-modal-setting-item user-profile-item">
                    <div className="user-avatar"><FaUser /></div>
                    <span><strong>{userName || "User"}</strong></span>

                    {/* Tombol Logout langsung di sini */}
                    <button onClick={handleLogout} className="mobile-logout-button">
                      <i className="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FOOTER NAVIGASI UTAMA (Tombol 4 icon) */}
      <footer className="mobile-footer-nav">
        <button
          onClick={() => setActiveMobileMenu(activeMobileMenu === 'Home' ? null : 'Home')}
          className={activeMobileMenu === 'Home' ? 'active' : ''}
        >
          {activeMobileMenu === 'Home' ? <HiHome /> : <HiOutlineHome />}
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveMobileMenu(activeMobileMenu === 'Ticketing' ? null : 'Ticketing')}
          className={activeMobileMenu === 'Ticketing' ? 'active' : ''}
        >
          {activeMobileMenu === 'Ticketing' ? <HiTicket /> : <HiOutlineTicket />}
          <span>Ticketing</span>
        </button>

        <button
          onClick={() => setActiveMobileMenu(activeMobileMenu === 'Inventory' ? null : 'Inventory')}
          className={activeMobileMenu === 'Inventory' ? 'active' : ''}
        >
          {activeMobileMenu === 'Inventory' ? <HiArchiveBox /> : <HiOutlineArchiveBox />}
          <span>Inventory</span>
        </button>

        <button
          onClick={() => setActiveMobileMenu(activeMobileMenu === 'Settings' ? null : 'Settings')}
          className={activeMobileMenu === 'Settings' ? 'active' : ''}
        >
          {activeMobileMenu === 'Settings' ? <HiCog6Tooth /> : <HiOutlineCog6Tooth />}
          <span>Setting</span>
        </button>
      </footer>

    </div>
  );
}