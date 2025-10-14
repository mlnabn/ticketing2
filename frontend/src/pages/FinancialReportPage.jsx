import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Komponen Kartu KPI untuk menampilkan angka (tidak perlu diubah)
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

export default function FinancialReportPage() {
    const [detailedData, setDetailedData] = useState({ new_acquisitions: [], problematic_assets: [] });
    const [filterType, setFilterType] = useState('month');
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: '',
        start_date: '',
        end_date: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // --- Data Fetching ---
    const fetchReport = useCallback(async () => {
        setIsLoading(true);
        let params = {};
        if (filterType === 'month') {
            params = { year: filters.year, month: filters.month };
        } else if (filterType === 'date_range') {
            if (filters.start_date && filters.end_date) {
                params = { start_date: filters.start_date, end_date: filters.end_date };
            }
        }

        try {
            const [kpiResponse, detailsResponse] = await Promise.all([
                api.get('/financial-report/inventory', { params }),
                api.get('/financial-report/inventory/details', { params })
            ]);
            setReportData(kpiResponse.data);
            setDetailedData(detailsResponse.data);
        } catch (error) {
            console.error("Gagal mengambil laporan keuangan:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, filterType]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    // --- Handlers ---
    const handleFilterChange = (e) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleFilterTypeChange = (e) => {
        const newType = e.target.value;
        setFilterType(newType);

        const getTodayString = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setFilters({
            year: new Date().getFullYear().toString(),
            month: '',
            start_date: '',
            end_date: newType === 'date_range' ? getTodayString() : ''
        });
    };

    const handleExport = async (type) => {
        setIsExporting(true);
        let params = { type };
        if (filterType === 'month') {
            params = { ...params, year: filters.year, month: filters.month };
        } else if (filterType === 'date_range') {
            params = { ...params, start_date: filters.start_date, end_date: filters.end_date };
        }
        
        try {
            const response = await api.get('/financial-report/export', {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = type === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `laporan-keuangan-aset-${new Date().toISOString().split('T')[0]}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Gagal mengekspor laporan:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // --- Helper & Variables ---
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

    const newAcquisitionsSubtotal = detailedData.new_acquisitions.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);
    const problematicAssetsSubtotal = detailedData.problematic_assets.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);

    return (
        <div className="user-management-container">
            <div className="report-header-controls">
                <h1 className="page-title">Laporan Keuangan Inventaris</h1>
            </div>

            <div className="info-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <KpiCard
                    title="Total Nilai Aset (Hingga Periode Ini)"
                    value={isLoading ? '...' : formatCurrency(reportData?.total_asset_value)}
                    iconClass="fas fa-landmark"
                    colorClass="blue-card"
                />
                <KpiCard
                    title="Nilai Aset Bersih (Net)"
                    value={isLoading ? '...' : formatCurrency(reportData?.net_asset_value)}
                    iconClass="fas fa-shield-alt"
                    colorClass="green-card"
                />
                <KpiCard
                    title="Nilai Pembelian Baru (Periode Ini)"
                    value={isLoading ? '...' : formatCurrency(reportData?.new_asset_value)}
                    iconClass="fas fa-cart-plus"
                    colorClass="yellow-card"
                />
                <KpiCard
                    title="Potensi Kerugian (Aset Rusak/Hilang)"
                    value={isLoading ? '...' : formatCurrency(reportData?.problematic_asset_value)}
                    iconClass="fas fa-exclamation-triangle"
                    colorClass="red-card"
                />
            </div>

            <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <select value={filterType} onChange={handleFilterTypeChange}>
                    <option value="month">Filter per Bulan</option>
                    <option value="date_range">Filter per Tanggal</option>
                </select>
                {filterType === 'month' && (
                    <>
                        <select name="month" value={filters.month} onChange={handleFilterChange}>
                            <option value="">Semua Bulan</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                        <select name="year" value={filters.year} onChange={handleFilterChange}>
                            <option value="">Semua Tahun</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </>
                )}
                {filterType === 'date_range' && (
                    <>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
                        <span style={{alignSelf: 'center'}}>s/d</span>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
                    </>
                )}
            </div>

            <div className="export-buttons">
                <button onClick={() => handleExport('excel')} disabled={isExporting} className="btn-download excel" style={{ marginRight: '0.5rem' }}>
                    <i className="fas fa-file-excel"></i>{isExporting ? '...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExport('pdf')} disabled={isExporting} className="btn-download pdf">
                    <i className="fas fa-file-pdf"></i>{isExporting ? '...' : 'Ekspor PDF'}
                </button>
            </div>

            {/* Tabel 1: Pembelian Baru */}
            <div className="report-table-container">
                <table className="job-table report-table">
                    <thead>
                        <tr className="table-section-header"><th colSpan="4">Pembelian Baru (Aset Masuk)</th></tr>
                        <tr>
                            <th>Tanggal</th><th>Kode Unik</th><th>Nama Barang</th><th style={{ textAlign: 'right' }}>Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : detailedData.new_acquisitions.length > 0 ? (
                            detailedData.new_acquisitions.map(item => (
                                <tr key={`new-${item.kode_unik}`}>
                                    <td>{formatDate(item.tanggal_pembelian)}</td>
                                    <td>{item.kode_unik}</td>
                                    <td>{item.master_barang.nama_barang}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.harga_beli))}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada pembelian baru pada periode ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="table-subtotal" style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 'bold' }}>
                <span>Subtotal: {isLoading ? '...' : formatCurrency(newAcquisitionsSubtotal)}</span>
            </div>

            {/* Tabel 2: Potensi Kerugian */}
            <div className="report-table-container">
                <table className="job-table report-table">
                    <thead>
                        <tr className="table-section-header">
                            <th colSpan="6">Potensi Kerugian (Aset Rusak/Hilang)</th>
                        </tr>
                        <tr>
                            <th>Tanggal</th>
                            <th>Kode Unik</th>
                            <th>Nama Barang</th>
                            <th>Status</th>
                            <th>User Terkait</th>
                            <th style={{ textAlign: 'right' }}>Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6">Memuat data...</td></tr>
                        ) : detailedData.problematic_assets.length > 0 ? (
                            detailedData.problematic_assets.map(item => (
                                <tr key={`prob-${item.kode_unik}`}>
                                    <td>{formatDate(item.tanggal_rusak || item.tanggal_hilang)}</td>
                                    <td>{item.kode_unik}</td>
                                    <td>{item.master_barang.nama_barang}</td>
                                    <td>
                                        <span className={`status-badge status-${item.status_detail?.nama_status.toLowerCase()}`}>
                                            {item.status_detail?.nama_status}
                                        </span>
                                    </td>
                                    <td>{item.user_perusak?.name || item.user_penghilang?.name || 'N/A'}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--red-color)' }}>
                                        ({formatCurrency(parseFloat(item.harga_beli))})
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada aset bermasalah pada periode ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* PERBARUI subtotal agar sesuai */}
            <div className="table-subtotal" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem', fontWeight: 'bold' }}>
                <span style={{color: 'var(--red-color)'}}>Subtotal: ({formatCurrency(problematicAssetsSubtotal)})</span>
            </div>
        </div>
    );
}