import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// ================================================================
// BARU: Import komponen dari Recharts
// ================================================================
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell
} from 'recharts';

// Komponen UI (tidak perlu diubah)
const NavigationCard = ({ title, description, linkTo, icon }) => (
    <Link to={linkTo} className="nav-card-report">
        <div className="nav-card-report-icon"><i className={`fas ${icon}`}></i></div>
        <div className="nav-card-report-content"><h4>{title}</h4><p>{description}</p></div>
    </Link>
);
const KpiCard = ({ title, value, iconClass, colorClass }) => (
    <div className={`info-card ${colorClass}`}><div className="card-header"><p className="card-label">{title}</p><div className={`card-icon ${colorClass}-icon`}><i className={iconClass}></i></div></div><h3 className="card-value">{value}</h3></div>
);

export default function FinancialReport() {
    const [reportData, setReportData] = useState(null);
    // ================================================================
    // BARU: State untuk menampung data mentah dari API untuk chart
    // ================================================================
    const [chartApiData, setChartApiData] = useState({ bar: null, pie: null });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [kpiRes, categoryRes, doughnutRes] = await Promise.all([
                api.get('/financial-report/inventory'),
                api.get('/financial-report/value-by-category'),
                api.get('/financial-report/asset-composition')
            ]);

            setReportData(kpiRes.data);

            // Simpan data mentah dari API ke state
            setChartApiData({
                bar: { labels: categoryRes.data.labels, data: categoryRes.data.data },
                pie: { labels: doughnutRes.data.labels, data: doughnutRes.data.data }
            });

        } catch (error) {
            console.error("Gagal memuat data laporan keuangan:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ================================================================
    // BARU: Transformasi data ke format yang dibutuhkan Recharts
    // Ini dilakukan dengan useMemo agar tidak dihitung ulang setiap render
    // ================================================================
    const transformedBarData = useMemo(() => {
        if (!chartApiData.bar) return [];
        return chartApiData.bar.labels.map((label, index) => ({
            name: label,
            // Pastikan nilainya dikonversi menjadi Angka
            "Total Nilai Pembelian": Number(chartApiData.bar.data[index])
        }));
    }, [chartApiData.bar]);

    const transformedPieData = useMemo(() => {
        if (!chartApiData.pie) return [];
        return chartApiData.pie.labels.map((label, index) => ({
            name: label,
            value: chartApiData.pie.data[index]
        }));
    }, [chartApiData.pie]);

    // Definisikan warna untuk Pie/Doughnut Chart
    const PIE_COLORS = ['#4BC0C0', '#FF9F40']; // Setara dengan rgba(75, 192, 192, 0.6) dan rgba(255, 159, 64, 0.6)

    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const stats = reportData || {};

    // ================================================================
    // BARU: Custom formatter untuk tooltip dan Y-Axis
    // ================================================================
    const yAxisFormatter = (value) => `Rp ${value / 1000000} Jt`;
    const tooltipFormatter = (value) => `${formatCurrency(value)}`;

    return (
        <div className="user-management-container">
            <h1>Laporan Keuangan Inventaris</h1>
            <div className="info-cards-grid">
                <KpiCard title="Total Nilai Aset" value={isLoading ? '...' : formatCurrency(stats.total_asset_value)} iconClass="fas fa-landmark" colorClass="blue-card" />
                <KpiCard title="Nilai Aset Bersih (Net)" value={isLoading ? '...' : formatCurrency(stats.net_asset_value)} iconClass="fas fa-shield-alt" colorClass="green-card" />
                <KpiCard title="Pembelian (30 Hari)" value={isLoading ? '...' : formatCurrency(stats.new_asset_value)} iconClass="fas fa-cart-plus" colorClass="yellow-card" />
                <KpiCard title="Kerugian (30 Hari)" value={isLoading ? '...' : formatCurrency(stats.problematic_asset_value)} iconClass="fas fa-exclamation-triangle" colorClass="red-card" />
            </div>

            <div className="dashboard-container-financial">
                <div className="dashboard-row-financial">
                    {/* --- Chart Utama: Nilai per Kategori (Recharts) --- */}
                    <div className="nilai-card kategori-card">
                        <h4>Total Nilai Pembelian per Kategori</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p className="loading-text">Memuat grafik...</p> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={transformedBarData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={tooltipFormatter} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                                        <Bar dataKey="Total Nilai Pembelian" fill="rgba(153, 102, 255, 0.8)" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* --- Chart Kedua: Komposisi Aset (Recharts) --- */}
                    <div className="nilai-card komposisi-card">
                        <h4>Komposisi Nilai Aset</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p className="loading-text">Memuat grafik...</p> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={transformedPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // ini yang membuatnya jadi Doughnut
                                            outerRadius={90}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {transformedPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={tooltipFormatter} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="navigation-section">
                <h1>Lihat Laporan Detail</h1>
                <div className="report-navigation-cards">
                    <NavigationCard title="Pembelian Baru (Aset Masuk)" description="Lihat semua data aset yang baru dibeli berdasarkan periode." linkTo="/admin/financial-report/new-acquisitions" icon="fa-dolly-flatbed" />
                    <NavigationCard title="Potensi Kerugian (Aset Rusak/Hilang)" description="Lacak semua aset yang berstatus rusak atau hilang." linkTo="/admin/financial-report/problematic-assets" icon="fa-heart-broken" />
                </div>
            </div>
        </div>
    );
}