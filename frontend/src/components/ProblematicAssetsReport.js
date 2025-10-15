// import { Link } from 'react-router-dom';
import { useFinancialReport } from '../pages/useFinancialReport';

export default function ProblematicAssetsReport() {
    const {
        detailedData,
        filters,
        filterType,
        isLoading,
        isExporting,
        handleFilterChange,
        handleFilterTypeChange,
        handleExport,
        formatCurrency,
        formatDate,
        years,
        months
    } = useFinancialReport();

    const problematicAssetsSubtotal = detailedData.problematic_assets.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);

    return (
        <div className="user-management-container">
            <div className="report-header-controls">
                <h1 className="page-title">Laporan Potensi Kerugian (Aset Rusak/Hilang)</h1>
            </div>
            <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <select value={filterType} onChange={handleFilterTypeChange} className="filter-select">
                    <option value="month">Filter per Bulan</option>
                    <option value="date_range">Filter per Tanggal</option>
                </select>
                {filterType === 'month' && (
                    <>
                        <select name="month" value={filters.month} onChange={handleFilterChange} className="filter-select">
                            <option value="">Semua Bulan</option>
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                        <select name="year" value={filters.year} onChange={handleFilterChange} className="filter-select">
                            <option value="">Semua Tahun</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </>
                )}
                {filterType === 'date_range' && (
                    <>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="filter-select-date" />
                        <span style={{ alignSelf: 'center' }}>-</span>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="filter-select-date" />
                    </>
                )}
            </div>

            <div className="download-buttons">
                <button onClick={() => handleExport('excel')} disabled={isExporting} className="btn-download excel">
                    <i className="fas fa-file-excel"></i>{isExporting ? '...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExport('pdf')} disabled={isExporting} className="btn-download pdf">
                    <i className="fas fa-file-pdf"></i>{isExporting ? '...' : 'Ekspor PDF'}
                </button>
            </div>
            <div className="report-table-container">
                <table className="job-table report-table">
                    <thead>
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
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : detailedData.problematic_assets.length > 0 ? (
                            <>
                                {detailedData.problematic_assets.map(item => (
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
                                ))}
                                <tr className="subtotal-row">
                                    <td colSpan="5">Subtotal</td>
                                    <td style={{ textAlign: 'right', color: 'var(--red-color)' }}>
                                        ({formatCurrency(problematicAssetsSubtotal)})
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Tidak ada aset bermasalah pada periode ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
