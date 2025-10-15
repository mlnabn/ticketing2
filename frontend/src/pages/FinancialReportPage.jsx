import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
// Import Bar dan Doughnut chart
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Daftarkan semua elemen Chart.js yang dibutuhkan
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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
    const [categoryValueData, setCategoryValueData] = useState(null); // State untuk chart baru
    const [doughnutData, setDoughnutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Panggil endpoint yang dibutuhkan. Endpoint chart bulanan sudah tidak dipanggil lagi.
            const [kpiRes, categoryRes, doughnutRes] = await Promise.all([
                api.get('/financial-report/inventory'),
                api.get('/financial-report/value-by-category'), // Endpoint untuk chart baru
                api.get('/financial-report/asset-composition')
            ]);

            setReportData(kpiRes.data);

            // Siapkan data untuk chart Nilai per Kategori
            setCategoryValueData({
                labels: categoryRes.data.labels,
                datasets: [{
                    label: 'Total Nilai Pembelian',
                    data: categoryRes.data.data,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                }]
            });

            // Siapkan data untuk chart Komposisi
            setDoughnutData({
                labels: doughnutRes.data.labels,
                datasets: [{
                    data: doughnutRes.data.data,
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)'],
                    borderColor: ['#fff'],
                }]
            });

        } catch (error) {
            console.error("Gagal memuat data laporan keuangan:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const stats = reportData || {};

    // Opsi untuk chart baru (Bar vertikal)
    const categoryChartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (value) => `Rp ${value / 1000000} Jt` } } }
    };
    const doughnutOptions = {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
    };

    if (categoryValueData) {
        categoryValueData.datasets[0].categoryPercentage = 0.5;
    }

    return (
        <div className="user-management-container">
            <h1>Laporan Keuangan Inventaris</h1>
            <div className="info-cards-grid">
                <KpiCard title="Total Nilai Aset" value={isLoading ? '...' : formatCurrency(stats.total_asset_value)} iconClass="fas fa-landmark" colorClass="blue-card" />
                <KpiCard title="Nilai Aset Bersih (Net)" value={isLoading ? '...' : formatCurrency(stats.net_asset_value)} iconClass="fas fa-shield-alt" colorClass="green-card" />
                <KpiCard title="Pembelian (30 Hari)" value={isLoading ? '...' : formatCurrency(stats.new_asset_value)} iconClass="fas fa-cart-plus" colorClass="yellow-card" />
                <KpiCard title="Kerugian (30 Hari)" value={isLoading ? '...' : formatCurrency(stats.problematic_asset_value)} iconClass="fas fa-exclamation-triangle" colorClass="red-card" />
            </div>

            {/* ======== AREA CHART DENGAN LAYOUT 2 KOLOM YANG DISEMPURNAKAN ======== */}
            <div className="dashboard-container-financial">
                <div className="dashboard-row-financial">
                    {/* --- Chart Utama: Nilai per Kategori --- */}
                    <div className="nilai-card kategori-card">
                        <h4>Total Nilai Pembelian per Kategori</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p className="loading-text">Memuat grafik...</p> : categoryValueData && <Bar options={categoryChartOptions} data={categoryValueData} />}
                        </div>
                    </div>

                    {/* --- Chart Kedua: Komposisi Aset --- */}
                    <div className="nilai-card komposisi-card">
                        <h4>Komposisi Nilai Aset</h4>
                        <div className="chart-canvas-container">
                            {isLoading ? <p className="loading-text">Memuat grafik...</p> : doughnutData && <Doughnut options={doughnutOptions} data={doughnutData} />}
                        </div>
                    </div>
                </div>
            </div>
            {/* ==================================================================== */}

            <div className="navigation-section">
                <h2>Lihat Laporan Detail</h2>
                <div className="navigation-cards-grid-report">
                    <NavigationCard title="Pembelian Baru (Aset Masuk)" description="Lihat semua data aset yang baru dibeli berdasarkan periode." linkTo="/admin/financial-report/new-acquisitions" icon="fa-dolly-flatbed" />
                    <NavigationCard title="Potensi Kerugian (Aset Rusak/Hilang)" description="Lacak semua aset yang berstatus rusak atau hilang." linkTo="/admin/financial-report/problematic-assets" icon="fa-heart-broken" />
                </div>
            </div>
        </div>
    );
}

