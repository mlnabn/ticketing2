import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AnimatePresence } from 'framer-motion';
import { FaUser } from 'react-icons/fa';

import Toast from '../components/Toast';
import yourLogok from '../Image/DTECH-Logo.png';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState(user?.name || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const toggleSidebar = () => setIsSidebarOpen(v => !v);
  const toggleDarkMode = () => setDarkMode(v => !v);
  const handleLogout = useCallback(() => { logout?.(); }, [logout]);

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
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
                <i className="fas fa-warehouse"></i><span className="nav-text">Tambah SKU</span>
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/admin/stock" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-boxes"></i><span className="nav-text">Stok Barang</span>
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/admin/financial-report" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-file-invoice-dollar"></i><span className="nav-text">Laporan Keuangan</span>
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/admin/inventory-reports" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}>
                <i className="fas fa-chart-line"></i><span className="nav-text">Laporan Inventory</span>
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
      </aside>

      {isSidebarOpen && <div className="content-overlay" onClick={toggleSidebar}></div>}

      <main className="main-content">
        <header className="main-header">
          <div className="header-left-group">
            <button className="hamburger-menu-button" onClick={toggleSidebar}><span /><span /><span /></button>
            <h1 className="dashboard-header-title">Admin Dashboard</h1>
          </div>
          <div className="admin-user-info-container">
            <div className="user-info">
              <button onClick={toggleDarkMode} className="theme-toggle-button" aria-label="Toggle Dark Mode">
                {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
              </button>
              <div className="user-profile-clickable" onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
                <div className="user-avatar"><FaUser /></div>
                <span><strong>{userName || "User"}</strong></span>
              </div>
            </div>
            {isAdminDropdownOpen && (
              <>
                <div className="dropdown-overlay" onClick={() => setIsAdminDropdownOpen(false)}></div>
                <div className="admin-dropdown"><button onClick={handleLogout}><i className="fas fa-sign-out-alt"></i><span>Logout</span></button></div>
              </>
            )}
          </div>
        </header>
        <div className="content-area">
          <Outlet context={{ showToast }} />
        </div>
      </main>
    </div>
  );
}