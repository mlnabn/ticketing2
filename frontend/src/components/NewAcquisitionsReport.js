import React, { useState } from 'react';
import { useFinancialReport } from './useFinancialReport';
import AcquisitionDetailModal from './AcquisitionDetailModal';

export default function NewAcquisitionsReport() {
    const {
        detailedData,
        filters,
        filterType,
        isLoading,
        // isExporting,
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
    const [selectedItem, setSelectedItem] = useState(null);
    const newAcquisitionsSubtotal = detailedData.new_acquisitions.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);
    const handleExportWrapper = async (type) => {
        if (type === 'pdf') setExportingPdf(true);
        else setExportingExcel(true);

        await handleExport(type, 'new_acquisitions');

        if (type === 'pdf') setExportingPdf(false);
        else setExportingExcel(false);
    };

    const handleRowClick = (e, item) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.action-buttons-group')) {
            return;
        }
        setSelectedItem(item);
    };

    return (
        <div className="user-management-container">
            <div className="report-header-controls">
                <h1 className="page-title">Laporan Pembelian Baru (Aset Masuk)</h1>
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
            {/* Tabel Pembelian Baru */}
            <div className="job-list-container">
                {/* Desktop View */}
                <div className="table-scroll-container">
                    <table className="job-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Kode Unik</th>
                                <th>Nama Barang</th>
                                <th style={{ textAlign: 'right' }}>Nilai</th>
                            </tr>
                        </thead>
                    </table>
                    <div className="table-body-scroll">
                        <table className="job-table">
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                ) : detailedData.new_acquisitions.length > 0 ? (
                                    <>
                                        {detailedData.new_acquisitions.map(item => (
                                            <tr key={`new-${item.kode_unik}`} className="hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                                <td>{formatDate(item.tanggal_pembelian)}</td>
                                                <td>{item.kode_unik}</td>
                                                <td>{item.master_barang.nama_barang}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.harga_beli))}</td>
                                            </tr>
                                        ))}
                                    </>
                                ) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada pembelian baru pada periode ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {detailedData.new_acquisitions.length > 0 && (
                        <table className="job-table">
                            <tfoot><tr className="subtotal-row">
                                <td colSpan="3">Subtotal</td>
                                <td style={{ textAlign: 'right' }}>
                                    {formatCurrency(newAcquisitionsSubtotal)}
                                </td>
                            </tr></tfoot>
                        </table>
                    )}
                </div>

                {/* Mobile View  */}
                <div
                    className='job-list-mobile'
                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                >
                    {isLoading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Memuat data...</p>
                        </div>
                    ) : detailedData.new_acquisitions.length > 0 ? (
                        <>
                            {detailedData.new_acquisitions.map(item => (
                                <div key={`mobile-new-${item.kode_unik}`} className="ticket-card-mobile hoverable-row" onClick={(e) => handleRowClick(e, item)}>
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Nama Barang</span>
                                            <span className="value description">
                                                {item.master_barang.nama_barang}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-row">
                                        <div className="data-group">
                                            <span className="label">Kode Unik</span>
                                            <span className="value">{item.kode_unik}</span>
                                        </div>
                                        <div className="data-group">
                                            <span className="label">Tanggal Beli</span>
                                            <span className="value">{formatDate(item.tanggal_pembelian)}</span>
                                        </div>
                                    </div>
                                    <div className="card-row value-row-financial">
                                        <div className="data-group single" style={{ textAlign: 'right' }}>
                                            <span className="label">Nilai Pembelian</span>
                                            <span className="value value-acquisition">
                                                {formatCurrency(parseFloat(item.harga_beli))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </>
                    ) : (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada pembelian baru pada periode ini.</p>
                        </div>
                    )}
                </div>
                <div className='job-list-mobile'>
                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Subtotal Pembelian</span>
                        <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {formatCurrency(newAcquisitionsSubtotal)}
                        </span>
                    </div>
                </div>
                <AcquisitionDetailModal
                    show={Boolean(selectedItem)}
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            </div>
        </div>
    );
}
