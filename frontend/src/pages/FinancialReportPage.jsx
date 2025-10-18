import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ================================================================
// Import komponen dari Recharts
// ================================================================
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// ================================================================
// Komponen UI
// ================================================================
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
// DATA MOCK: Menggantikan panggilan API yang gagal
// ================================================================
const mockKpiData = {
    total_asset_value: 1250000000,
    net_asset_value: 1100000000,
    new_asset_value: 75000000,
    problematic_asset_value: 15000000,
};

const mockCategoryData = {
    labels: [
        'Monitor', 'Peralatan Dapur', 'Otomotif', 'Anime', 'Vapors', 'Buku',
        'Skateboard', 'Headset', 'Mouse', 'Sports', 'Music', 'Bag', 'Style'
    ],
    data: [
        52000000, 25000000, 15000000, 12000000, 9000000, 8000000,
        5000000, 4500000, 3000000, 2500000, 2000000, 1500000, 1000000
    ],
};

const mockDoughnutData = {
    labels: ['Aset Produktif', 'Aset Konsumtif'],
    data: [950000000, 300000000],
};

// ================================================================
// KOMPONEN UTAMA
// ================================================================
export default function FinancialReport() {
    const [reportData, setReportData] = useState(null);
    const [chartApiData, setChartApiData] = useState({ bar: null, pie: null });

    // Simulasi pengambilan data saat komponen dimuat
    useEffect(() => {
        setReportData(mockKpiData);
        setChartApiData({
            bar: {
                labels: mockCategoryData.labels,
                data: mockCategoryData.data
            },
            pie: {
                labels: mockDoughnutData.labels,
                data: mockDoughnutData.data
            }
        });
    }, []);

    // ================================================================
    // DIPERBARUI: Transformasi data untuk Bar Chart
    // ================================================================
    const transformedBarData = useMemo(() => {
        if (!chartApiData.bar) return [];

        // 1. Ubah data mentah menjadi format yang lebih mudah diolah
        const initialData = chartApiData.bar.labels.map((label, index) => ({
            name: label,
            "Total Nilai Pembelian": Number(chartApiData.bar.data[index])
        }));

        // 2. Urutkan data dari nilai terbesar ke terkecil
        const sortedData = initialData.sort(
            (a, b) => b["Total Nilai Pembelian"] - a["Total Nilai Pembelian"]
        );

        // 3. Ambil 10 data teratas
        return sortedData.slice(0, 10);
    }, [chartApiData.bar]);

    // Transformasi data untuk Pie Chart
    const transformedPieData = useMemo(() => {
        if (!chartApiData.pie) return [];
        return chartApiData.pie.labels.map((label, index) => ({
            name: label,
            value: chartApiData.pie.data[index]
        }));
    }, [chartApiData.pie]);

    // ================================================================
    // Definisikan warna untuk Pie/Doughnut Chart
    // ================================================================
    const PIE_COLORS = ['#4BC0C0', '#FF9F40'];

    // ================================================================
    // Formatter
    // ================================================================
    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const yAxisFormatter = (value) => `Rp ${value / 1000000} Jt`;
    const tooltipFormatter = (value) => `${formatCurrency(value)}`;
    const stats = reportData || {};

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="user-management-container">
            <h1>Laporan Keuangan Inventaris</h1>

            {/* KPI Cards */}
            <div className="info-cards-grid">
                <KpiCard
                    title="Total Nilai Aset"
                    value={!reportData ? '...' : formatCurrency(stats.total_asset_value)}
                    iconClass="fas fa-landmark"
                    colorClass="blue-card"
                />
                <KpiCard
                    title="Nilai Aset Bersih (Net)"
                    value={!reportData ? '...' : formatCurrency(stats.net_asset_value)}
                    iconClass="fas fa-shield-alt"
                    colorClass="green-card"
                />
                <KpiCard
                    title="Pembelian (30 Hari)"
                    value={!reportData ? '...' : formatCurrency(stats.new_asset_value)}
                    iconClass="fas fa-cart-plus"
                    colorClass="yellow-card"
                />
                <KpiCard
                    title="Kerugian (30 Hari)"
                    value={!reportData ? '...' : formatCurrency(stats.problematic_asset_value)}
                    iconClass="fas fa-exclamation-triangle"
                    colorClass="red-card"
                />
            </div>

            {/* Dashboard Chart Section */}
            <div className="dashboard-container-financial">
                <div className="dashboard-row-financial">
                    {/* --- Chart Utama: Nilai per Kategori --- */}
                    <div className="nilai-card kategori-card">
                        <h4>Top 10 Kategori Pembelian Terbesar</h4>
                        <div className="chart-canvas-container">
                            {!chartApiData.bar ? (
                                <p className="loading-text">Memuat grafik...</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={transformedBarData}
                                        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={tooltipFormatter}
                                            cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                                        />
                                        <Bar
                                            dataKey="Total Nilai Pembelian"
                                            fill="rgba(153, 102, 255, 0.8)"
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* --- Chart Kedua: Komposisi Aset --- */}
                    <div className="nilai-card komposisi-card">
                        <h4>Komposisi Nilai Aset</h4>
                        <div className="chart-canvas-container">
                            {!chartApiData.pie ? (
                                <p className="loading-text">Memuat grafik...</p>
                            ) : (
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
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                />
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

            {/* Navigation Section */}
            <div className="navigation-section">
                <h1>Lihat Laporan Detail</h1>
                <div className="report-navigation-cards">
                    <NavigationCard
                        title="Pembelian Baru (Aset Masuk)"
                        description="Lihat semua data aset yang baru dibeli berdasarkan periode."
                        linkTo="/admin/financial-report/new-acquisitions"
                        icon="fa-dolly-flatbed"
                    />
                    <NavigationCard
                        title="Potensi Kerugian (Aset Rusak/Hilang)"
                        description="Lacak semua aset yang berstatus rusak atau hilang."
                        linkTo="/admin/financial-report/problematic-assets"
                        icon="fa-heart-broken"
                    />
                </div>
            </div>
        </div>
    );
}
