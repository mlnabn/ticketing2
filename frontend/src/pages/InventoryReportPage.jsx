import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import InventoryLineChart from '../components/InventoryLineChart';

const NavigationCard = ({ title, description, linkTo, icon }) => (
    <Link to={linkTo} className="nav-card-report">
        <div className="nav-card-report-icon"><i className={`fas ${icon}`}></i></div>
        <div className="nav-card-report-content">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    </Link>
);

const TrendIndicator = ({ trend }) => {
    if (!trend) return <p className="card-trend trend-stable">...</p>;
    const isStable = trend.direction === 'stable';
    const trendIcon = isStable ? 'fa-minus' : `fa-arrow-${trend.direction}`;
    const trendClass = `trend-${trend.direction}`;
    return (
        <p className={`card-trend ${trendClass}`}>
            <i className={`fas ${trendIcon}`}></i>
            {isStable ? 'Stabil' : `${trend.difference} dari 30 hari lalu`}
        </p>
    );
};

export default function InventoryReportPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async (year) => {
        setLoading(true);
        try {
            const response = await api.get('/reports/inventory/dashboard', {
                params: { year }
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Gagal memuat data laporan", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedYear);
    }, [selectedYear, fetchData]);

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    // Gunakan data kosong sementara saat loading
    const stats = dashboardData?.stats || {
        total_sku: '...',
        active_sku: '...',
        stok_tersedia: '...',
        persentase_stok_tersedia: '...',
        total_unit_barang: '...',
        barang_masuk_30_hari: '...',
        barang_keluar_30_hari: '...',
        trend: null,
    };

    const chartData = dashboardData?.chartData || [];
    const mostActiveItems = dashboardData?.mostActiveItems || [];
    const availableYears = dashboardData?.availableYears || [selectedYear];

    return (
        <div className="user-management-container">
            <h1>Laporan Inventaris</h1>

            {/* Kartu Statistik */}
            <div className="info-cards-grid">
                <div className="info-card blue-card">
                    <div className="card-header">
                        <p className="card-label">Total SKU</p>
                        <div className="card-icon blue-icon"><i className="fas fa-tags"></i></div>
                    </div>
                    <h3 className="card-value">{stats.total_sku}</h3>
                    <p className="card-subtext">{stats.active_sku !== '...' ? `${stats.active_sku} SKU Aktif` : '...'}</p>
                </div>

                <div className="info-card green-card">
                    <div className="card-header">
                        <p className="card-label">Stok Tersedia</p>
                        <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
                    </div>
                    <h3 className="card-value">
                        {stats.stok_tersedia !== '...' ? `${stats.stok_tersedia} (${stats.persentase_stok_tersedia}%)` : '...'}
                    </h3>
                </div>

                <div className="info-card yellow-card">
                    <div className="card-header">
                        <p className="card-label">Total Unit Barang</p>
                        <div className="card-icon yellow-icon"><i className="fas fa-box-open"></i></div>
                    </div>
                    <h3 className="card-value">{stats.total_unit_barang}</h3>
                    <p className="card-subtext">{stats.barang_masuk_30_hari !== '...' ? `${stats.barang_masuk_30_hari} unit masuk (30 hari)` : '...'}</p>
                </div>

                <div className="info-card red-card">
                    <div className="card-header">
                        <p className="card-label">Barang Keluar (30 Hari)</p>
                        <div className="card-icon red-icon"><i className="fas fa-sign-out-alt"></i></div>
                    </div>
                    <h3 className="card-value">{stats.barang_keluar_30_hari}</h3>
                    <TrendIndicator trend={stats.trend} />
                </div>

                <div className="info-card purple-card">
                    <div className="card-header">
                        <p className="card-label">Barang Masuk (30 Hari)</p>
                        <div className="card-icon purple-icon"><i className="fas fa-dolly"></i></div>
                    </div>
                    <h3 className="card-value">{stats.barang_masuk_30_hari}</h3>
                </div>
            </div>

            {/* Grafik */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <div className="chart-header">
                    <h4>Pergerakan Barang Masuk vs Keluar</h4>
                    <select className="year-filter" value={selectedYear} onChange={handleYearChange}>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Memuat grafik...</div>
                ) : (
                    <InventoryLineChart chartData={chartData} />
                )}
            </div>

            {/* Barang paling aktif */}
            <div className="dashboard-card most-active-widget">
                <h4>5 Barang Paling Sering Keluar (Tahun Ini)</h4>
                <ul className="active-items-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '1rem' }}>Memuat data...</p>
                    ) : mostActiveItems.length > 0 ? (
                        mostActiveItems.map((item, index) => (
                            <li key={item.master_barang_id}>
                                <div className="active-item">
                                    <div className="item-info">
                                        <span className="item-rank">{index + 1}.</span>
                                        <span className="item-name">{item.master_barang.nama_barang}</span>
                                    </div>
                                    <span className="item-count">{item.total_keluar} kali</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', padding: '1rem' }}>Belum ada data barang keluar tahun ini.</p>
                    )}
                </ul>
            </div>

            {/* Navigasi laporan */}
            <div className="navigation-cards-grid-report">
                <NavigationCard
                    title="Laporan Barang Masuk"
                    description="Lihat riwayat detail semua barang yang masuk ke gudang."
                    linkTo="/admin/inventory-reports/incoming"
                    icon="fa-arrow-down"
                />
                <NavigationCard
                    title="Laporan Barang Keluar"
                    description="Lacak semua barang yang dipinjam, digunakan, rusak, atau hilang."
                    linkTo="/admin/inventory-reports/outgoing"
                    icon="fa-arrow-up"
                />
            </div>
        </div>
    );
}
