import React, { useState } from 'react';
import { useFinancialReport } from './useFinancialReport';

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

    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    const problematicAssetsSubtotal = detailedData.problematic_assets.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);

    const handleExportWrapper = async (type) => {
        if (type === 'pdf') setExportingPdf(true);
        else setExportingExcel(true);
        
        await handleExport(type, 'problematic_assets'); 
        
        if (type === 'pdf') setExportingPdf(false);
        else setExportingExcel(false);
    };

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
                <button onClick={() => handleExportWrapper('excel')} disabled={exportingExcel} className="btn-download excel">
                    <i className="fas fa-file-excel" style={{ marginRight: '8px' }}></i>
                    {exportingExcel ? 'Mengekspor...' : 'Ekspor Excel'}
                </button>
                <button onClick={() => handleExportWrapper('pdf')} disabled={exportingPdf} className="btn-download pdf">
                    <i className="fas fa-file-pdf" style={{ marginRight: '8px' }}></i>
                    {exportingPdf ? 'Mengekspor...' : 'Ekspor PDF'}
                </button>
            </div>
            <div className="job-list-container">
                {/* Desktop View */}
                <table className="job-table">
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
                {/* Mobile View */}
                <div className="job-list-mobile">
                    {/* Tampilkan pesan loading jika data sedang dimuat */}
                    {isLoading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Memuat data...</p>
                        </div>
                    ) : detailedData.problematic_assets.length > 0 ? (
                        <>
                            {/* Loop melalui setiap item aset bermasalah dan buat card */}
                            {detailedData.problematic_assets.map(item => (
                                <div key={`mobile-prob-${item.kode_unik}`} className="ticket-card-mobile">
                                    {/* Baris 1: Nama Barang */}
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Nama Barang</span>
                                            <span className="value description">
                                                {item.master_barang.nama_barang}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Baris 2: Kode Unik & User Terkait */}
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Kode Unik</span>
                                            <span className="value">{item.kode_unik}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">User Terkait</span>
                                            <span className="value">{item.user_perusak?.name || item.user_penghilang?.name || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Baris 3: Tanggal & Status */}
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Tanggal</span>
                                            <span className="value">{formatDate(item.tanggal_rusak || item.tanggal_hilang)}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">Status</span>
                                            <span className="value">
                                                <span className={`status-badge status-${item.status_detail?.nama_status.toLowerCase()}`}>
                                                    {item.status_detail?.nama_status}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Baris 4: Nilai Kerugian (Paling Penting) */}
                                    <div className="card-row value-row-financial">
                                        <div className="data-group single" style={{ textAlign: 'right' }}>
                                            <span className="label">Nilai Kerugian</span>
                                            <span className="value value-loss">
                                                ({formatCurrency(parseFloat(item.harga_beli))})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Tampilkan Card untuk Subtotal di bagian bawah */}
                            <div className="subtotal-card-mobile">
                                <span className="subtotal-label">Subtotal Potensi Kerugian</span>
                                <span className="subtotal-value value-loss">
                                    ({formatCurrency(problematicAssetsSubtotal)})
                                </span>
                            </div>
                        </>
                    ) : (
                        // Tampilkan pesan jika tidak ada data
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada aset bermasalah pada periode ini.</p>
                        </div>
                    )}
                </div>


            </div>

        </div>
    );
}
