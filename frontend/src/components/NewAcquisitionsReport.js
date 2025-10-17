// import { Link } from 'react-router-dom';
import { useFinancialReport } from './useFinancialReport'; // Import custom hook

export default function NewAcquisitionsReport() {
    // Gunakan hook untuk mendapatkan semua state dan logika
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

    const newAcquisitionsSubtotal = detailedData.new_acquisitions.reduce((sum, item) => sum + parseFloat(item.harga_beli), 0);

    return (
        <div className="user-management-container">
            <div className="report-header-controls">
                <h1 className="page-title">Laporan Pembelian Baru (Aset Masuk)</h1>
            </div>

            {/* Filter & Export (UI diambil dari file lama) */}
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
            {/* Tabel Pembelian Baru */}
            <div className="job-list-container">
                {/* Destop View*/}
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Kode Unik</th>
                            <th>Nama Barang</th>
                            <th style={{ textAlign: 'right' }}>Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                        ) : detailedData.new_acquisitions.length > 0 ? (
                            <>
                                {detailedData.new_acquisitions.map(item => (
                                    <tr key={`new-${item.kode_unik}`}>
                                        <td>{formatDate(item.tanggal_pembelian)}</td>
                                        <td>{item.kode_unik}</td>
                                        <td>{item.master_barang.nama_barang}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.harga_beli))}</td>
                                    </tr>
                                ))}
                                {/* --- BARIS SUBTOTAL BARU --- */}
                                <tr className="subtotal-row">
                                    <td colSpan="3">Subtotal</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {formatCurrency(newAcquisitionsSubtotal)}
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Tidak ada pembelian baru pada periode ini.</td></tr>
                        )}
                    </tbody>
                </table>
                {/*Mobile View*/}
                <div className='job-list-mobile'>
                    {/* Tampilkan pesan loading jika data sedang dimuat */}
                    {isLoading ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Memuat data...</p>
                        </div>
                    ) : detailedData.new_acquisitions.length > 0 ? (
                        <>
                            {/* Loop melalui setiap item pembelian baru dan buat card */}
                            {detailedData.new_acquisitions.map(item => (
                                <div key={`mobile-new-${item.kode_unik}`} className="ticket-card-mobile">
                                    {/* Baris 1: Nama Barang */}
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">Nama Barang</span>
                                            <span className="value description">
                                                {item.master_barang.nama_barang}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Baris 2: Kode Unik & Tanggal Beli */}
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

                                    {/* Baris 3: Nilai Pembelian (Paling Penting) */}
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

                            {/* Tampilkan Card untuk Subtotal di bagian bawah */}
                            <div className="subtotal-card-mobile acquisition-subtotal">
                                <span className="subtotal-label">Subtotal Pembelian</span>
                                <span className="subtotal-value value-acquisition">
                                    {formatCurrency(newAcquisitionsSubtotal)}
                                </span>
                            </div>
                        </>
                    ) : (
                        // Tampilkan pesan jika tidak ada data
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p>Tidak ada pembelian baru pada periode ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
