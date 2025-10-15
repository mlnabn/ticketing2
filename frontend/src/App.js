import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { injectAuthHooks } from './services/api';

// Halaman & Layout Utama
import LandingLayout from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import PublicTicketPage from './pages/PublicTicketPage';

// Komponen Halaman Publik
import WelcomeHomeUserWrapper from './components/WelcomeHomeUserWrapper';
import AboutPage from './components/AboutUsPage';
import FeaturesPage from './components/FeaturesPage';
import FAQPage from './components/FAQPage';

// Komponen Halaman di dalam AdminDashboard
import WelcomeHome from './components/WelcomeHome';
import JobList from './components/JobList';
import UserManagement from './components/UserManagement';
import ToolManagement from './components/ToolManagement';
import StokBarangView from './components/StokBarangView';
import InventoryReportPage from './pages/InventoryReportPage';
import DetailedReportPage from './components/DetailedReportPage';
import WorkshopManagement from './components/WorkshopManagement';
import FinancialReportPage from './pages/FinancialReportPage';
import TicketReportAdminList from './components/TicketReportAdminList';
import ComprehensiveReportPage from './components/ComprehensiveReportPage';
import TicketReportDetail from './components/TicketReportDetail';
import NotificationForm from './components/NotificationForm';
import NotificationTemplateManagement from './components/NotificationTemplateManagement';

// Route Guards
import RequireAuth from './routes/RequireAuth';
import RequireRole from './routes/RequireRole';
import './App.css';

// Komponen helper tidak berubah
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
}

const AuthInjector = () => {
  const { setAccessToken, logout } = useAuth();
  React.useEffect(() => {
    injectAuthHooks({ setAccessToken, logout });
  }, [setAccessToken, logout]);
  return null;
};

// --- Komponen Utama Aplikasi ---
export default function RootApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthInjector />
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<LandingLayout />}>
            <Route index element={<WelcomeHomeUserWrapper />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="faq" element={<FAQPage />} />
          </Route>
          <Route path="/history/:ticketCode" element={<PublicTicketPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rute Terproteksi */}
          <Route path="/dashboard" element={<RequireAuth><DashboardRedirect /></RequireAuth>} />
          <Route path="/user/*" element={<RequireRole role="user"><UserDashboard /></RequireRole>} />

          {/* === PERUBAHAN UTAMA: RUTE ADMIN DENGAN ANAK-ANAKNYA === */}
          <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>}>
            <Route index element={<WelcomeHome />} />
            <Route path="tickets" element={<JobList />} />
            <Route path="my-tickets" element={<JobList />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notifications" element={<NotificationForm />} />
            <Route path="reports">
              <Route index element={<TicketReportAdminList />} />
              <Route path="all" element={<ComprehensiveReportPage />} />
              <Route path="handled" element={<ComprehensiveReportPage />} />
              <Route path="admin/:adminId" element={<TicketReportDetail />} />
            </Route>
            <Route path="templates" element={<NotificationTemplateManagement />} />
            <Route path="inventory" element={<ToolManagement />} />
            <Route path="stock" element={<StokBarangView />} />
            <Route path="inventory-reports" element={<InventoryReportPage />} />
            <Route path="inventory-reports/incoming" element={<DetailedReportPage type="in" title="Laporan Barang Masuk" />} />
            <Route path="inventory-reports/outgoing" element={<DetailedReportPage type="out" title="Laporan Barang Keluar" />} />
            <Route path="inventory-reports/available" element={<DetailedReportPage type="available" title="Laporan Barang Tersedia" />} />
            <Route path="inventory-reports/accountability" element={<DetailedReportPage type="accountability" title="Laporan Barang Hilang & Rusak" />} />
            <Route path="workshops" element={<WorkshopManagement />} />
            <Route path="financial-report" element={<FinancialReportPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}