import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useFinancialReport } from '../components/useFinancialReport';

// ================================================================
// Komponen UI
// ================================================================

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
        <div className="nav-card-report-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="nav-card-report-content">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    </Link>
);

const KpiCard = ({ title, value, iconClass, colorClass }) => (
    <div className={`info-card ${colorClass}`}>
        <div className="card-header">
            <p className="card-label">{title}</p>
            <div className={`card-icon ${colorClass}-icon`}>
                <i className={iconClass}></i>
            </div>
        </div>
        <h3 className="card-value">{value}</h3>
    </div>
);

// ================================================================
// KOMPONEN UTAMA
// ================================================================
export default function FinancialReportPage() {
    // 1. PANGGIL HOOK UNTUK MENDAPATKAN SEMUA DATA & FUNGSI
    const {
        summaryData, chartData, isLoading,
        formatCurrency
    } = useFinancialReport();

    // 2. HAPUS SEMUA MOCK DATA & GUNAKAN DATA ASLI DARI HOOK
    const transformedBarData = useMemo(() => {
        if (!chartData.bar?.data) return [];
        const initialData = chartData.bar.labels.map((label, index) => ({
            name: label,
            "Total Nilai": Number(chartData.bar.data[index])
        }));
        return initialData.sort((a, b) => b["Total Nilai"] - a["Total Nilai"]).slice(0, 10);
    }, [chartData.bar]);

    const transformedPieData = useMemo(() => {
        if (!chartData.pie?.data) return [];
        return chartData.pie.labels.map((label, index) => ({
            name: label,
            value: chartData.pie.data[index]
        }));
    }, [chartData.pie]);

    const PIE_COLORS = ['#36A2EB', '#FF6384'];
    const yAxisFormatter = (value) => `Rp ${value / 1000000} Jt`;
    const tooltipFormatter = (value) => `${formatCurrency(value)}`;

    return (
        <motion.div
            className="user-management-container"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.h1 variants={staggerItem}>Laporan Keuangan Inventaris</motion.h1>

            {/* 4. HUBUNGKAN KARTU KPI DENGAN DATA ASLI */}
            <motion.div variants={staggerItem} className="info-cards-grid">
                <KpiCard title="Total Nilai Aset" value={isLoading ? '...' : formatCurrency(summaryData.total_asset_value)} iconClass="fas fa-landmark" colorClass="blue-card" />
                <KpiCard title="Nilai Aset Bersih (Net)" value={isLoading ? '...' : formatCurrency(summaryData.net_asset_value)} iconClass="fas fa-shield-alt" colorClass="green-card" />
                <KpiCard title="Pembelian (30 Hari Terakhir)" value={isLoading ? '...' : formatCurrency(summaryData.new_asset_value_30_days)} iconClass="fas fa-cart-plus" colorClass="yellow-card" />
                <KpiCard title="Kerugian (Periode)" value={isLoading ? '...' : formatCurrency(summaryData.problematic_asset_value)} iconClass="fas fa-exclamation-triangle" colorClass="red-card" />
            </motion.div>

            {/* 5. HUBUNGKAN CHART DENGAN DATA ASLI */}
            <motion.div variants={staggerItem} className="dashboard-container-financial">
                <div className="dashboard-row-financial">
                    <div className="nilai-card kategori-card">
                        <h4>Top 10 Kategori Berdasarkan Nilai Aset</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p>Memuat grafik...</p> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={transformedBarData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                                        <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={tooltipFormatter} />
                                        <Bar dataKey="Total Nilai"
                                            fill="rgba(153, 102, 255, 0.8)"
                                            barSize={30}
                                            cursor="pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    <div className="nilai-card komposisi-card">
                        <h4>Komposisi Nilai Aset (Total)</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p>Memuat grafik...</p> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={transformedPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            cursor="pointer">
                                            {transformedPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={tooltipFormatter} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Section (tidak berubah) */}
            <motion.div variants={staggerItem} className="navigation-section" style={{ marginTop: '25px' }}>
                <motion.h1 variants={staggerItem}>Lihat Laporan Detail</motion.h1>
                <div className="report-navigation-cards">
                    <NavigationCard title="Pembelian Baru (Aset Masuk)" description="Lihat semua data aset yang baru dibeli berdasarkan periode." linkTo="/admin/financial-report/new-acquisitions" icon="fa-dolly-flatbed" />
                    <NavigationCard title="Potensi Kerugian (Aset Rusak/Hilang)" description="Lacak semua aset yang berstatus rusak atau hilang." linkTo="/admin/financial-report/problematic-assets" icon="fa-heart-broken" />
                </div>
            </motion.div>
        </motion.div>
    );
}
