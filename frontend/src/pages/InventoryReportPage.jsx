import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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


const NavigationCard = ({ title, description, linkTo, icon }) => (
    <Link to={linkTo} className="nav-card-report">
        <div className="nav-card-report-icon"><i className={`fas ${icon}`}></i></div>
        <div className="nav-card-report-content">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    </Link>
);

export default function InventoryReportPage() {
    const isPresent = useIsPresent();
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
        if (!isPresent) return;
        fetchData(selectedYear);
    }, [selectedYear, fetchData, isPresent]);

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const stats = dashboardData?.stats || {
        total_unit_barang: '...',
        stok_tersedia: '...',
        persentase_stok_tersedia: '...',
        rusak_hilang_total: '...',
        barang_keluar: '...',
    };

    const mostActiveItems = dashboardData?.mostActiveItems || [];
    const availableYears = dashboardData?.availableYears || [selectedYear];

    return (
        <motion.div
            className="user-management-container"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.h1 variants={staggerItem}>Laporan Inventaris</motion.h1>

            <motion.div variants={staggerItem} className="info-cards-grid">
                <div className="info-card blue-card">
                    <div className="card-header">
                        <p className="card-label">Total Unit Barang</p>
                        <div className="card-icon blue-icon"><i className="fas fa-box-open"></i></div>
                    </div>
                    <h3 className="card-value">{stats.total_unit_barang}</h3>
                </div>

                <div className="info-card green-card">
                    <div className="card-header">
                        <p className="card-label">Stok Tersedia</p>
                        <div className="card-icon green-icon"><i className="fas fa-check-circle"></i></div>
                    </div>
                    <h3 className="card-value">{stats.stok_tersedia}</h3>
                </div>

                <div className="info-card orange-card">
                    <div className="card-header">
                        <p className="card-label">Rusak & Hilang</p>
                        <div className="card-icon orange-icon"><i className="fas fa-exclamation-triangle"></i></div>
                    </div>
                    <h3 className="card-value">{stats.rusak_hilang_total}</h3>
                </div>

                <div className="info-card red-card">
                    <div className="card-header">
                        <p className="card-label">Barang Keluar</p>
                        <div className="card-icon red-icon"><i className="fas fa-shipping-fast"></i></div>
                    </div>
                    <h3 className="card-value">{stats.barang_keluar}</h3>
                </div>
            </motion.div>
            <motion.div variants={staggerItem} className="dashboard-card most-active-widget" style={{ marginTop: '2rem' }}>
                <div className="chart-header">
                    <h4>5 Barang Paling Sering Keluar</h4>
                    <select className="year-filter" value={selectedYear} onChange={handleYearChange}>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
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
            </motion.div>

            <motion.div variants={staggerItem} className="report-navigation-cards">
                <NavigationCard
                    title="Laporan Barang Masuk"
                    description="Lacak semua barang yang kembali."
                    linkTo="/admin/inventory-reports/incoming"
                    icon="fa-arrow-down"
                />
                <NavigationCard
                    title="Laporan Barang Keluar"
                    description="Lacak semua barang yang keluar atau statusnya diubah."
                    linkTo="/admin/inventory-reports/outgoing"
                    icon="fa-arrow-up"
                />
                <NavigationCard
                    title="Daftar Barang Tersedia"
                    description="Lihat semua unit barang yang saat ini siap digunakan."
                    linkTo="/admin/inventory-reports/available"
                    icon="fa-archive"
                />
                <NavigationCard
                    title="Daftar Barang Dipinjam & Digunakan"
                    description="Lihat semua barang yang sedang dipinjam atau digunakan."
                    linkTo="/admin/inventory-reports/active-loans"
                    icon="fa-user-clock"
                />
                <NavigationCard
                    title="Daftar Barang Hilang, Rusak, & Perbaikan"
                    description="Lihat semua barang yang hilang, rusak, atau sedang perbaikan."
                    linkTo="/admin/inventory-reports/accountability"
                    icon="fa-exclamation-triangle"
                />
                <NavigationCard
                    title="Riwayat Barang"
                    description="Cari atau scan qr barang untuk melihat riwayat lengkap suatu barang."
                    linkTo="/admin/inventory-reports/history"
                    icon="fa-history"
                />
            </motion.div>
        </motion.div> 
    );
}