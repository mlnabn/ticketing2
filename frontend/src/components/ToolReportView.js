import React from 'react';

// Terima props onRecoverClick
function ToolReportView({ reportData, loading, onBack, onRecoverClick }) {
    return (
        <>
            <div className="user-management-container">
                <button className="back-btn" onClick={onBack}>Kembali</button>
            </div>
            <h2 className="tool-section-title">Laporan Kehilangan Barang</h2>

            {/* --- Desktop Table --- */}
            <div className="job-list-table">
                <table className="job-table">
                    <thead>
                        <tr>
                            <th>Barang</th>
                            <th>Admin Peminjam</th>
                            <th>Untuk Tiket</th>
                            <th>Tgl Pinjam</th>
                            <th>Tgl Selesai</th>
                            <th>Stok Awal</th>
                            <th>Dipinjam</th>
                            <th>Hilang</th>
                            <th>Dipulihkan</th>
                            <th>Stok Akhir</th>
                            <th>Keterangan Hilang</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Perbaiki colSpan menjadi 12 karena ada 12 kolom
                            <tr><td colSpan="12" style={{ textAlign: 'center' }}>Memuat laporan...</td></tr>
                        ) : reportData.length > 0 ? reportData.map((item) => {
                            // Cek apakah masih ada barang yang bisa dipulihkan
                            const canRecover = item.quantity_lost > item.quantity_recovered;
                            return (
                                <tr key={`${item.ticket_id}-${item.tool_id}`}>
                                    <td>{item.tool_name}</td>
                                    <td>{item.admin_name || '-'}</td>
                                    <td><span className="description-cell">{item.ticket_title}</span></td>
                                    <td>{new Date(item.borrowed_at).toLocaleDateString('id-ID')}</td>
                                    <td>{item.returned_at ? new Date(item.returned_at).toLocaleDateString('id-ID') : 'Proses'}</td>
                                    <td>{item.stock_awal}</td>
                                    <td>{item.dipinjam}</td>
                                    <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{item.quantity_lost}</td>
                                    <td style={{ color: '#2ecc71', fontWeight: 'bold' }}>{item.quantity_recovered}</td>
                                    <td>{item.stock_akhir}</td>
                                    <td className="keterangan-cell">{item.keterangan || '-'}</td>
                                    {/* --- KOLOM AKSI UNTUK DESKTOP --- */}
                                    <td className="actions-cell">
                                        {canRecover ? (
                                            <button
                                                onClick={() => onRecoverClick(item)}
                                                className="btn-edit" // Menggunakan className 'btn-edit' yang sudah ada
                                            >
                                                Pulihkan
                                            </button>
                                        ) : (
                                            // Tampilkan status jika sudah lunas
                                            <span className="status-selesai" style={{ padding: '5px 10px', fontSize: '0.8em' }}>Lunas</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="12" style={{ textAlign: 'center' }}>Tidak ada data kehilangan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Mobile Card View --- */}
            <div className="job-list-mobile">
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Memuat laporan...</p>
                ) : reportData.length > 0 ? reportData.map((item) => {
                    // Logika yang sama untuk mengecek apakah barang bisa dipulihkan
                    const canRecover = item.quantity_lost > item.quantity_recovered;
                    return (
                        <div key={`${item.ticket_id}-${item.tool_id}`} className="ticket-card-mobile">
                            {/* ... (semua card-row yang sudah ada tidak perlu diubah) ... */}
                            <div className="card-row">
                                <div className="data-group single">
                                    <span className="label">Keterangan</span>
                                    <span className="value">{item.keterangan || '-'}</span>
                                </div>
                            </div>

                            {/* --- AREA AKSI UNTUK TAMPILAN MOBILE --- */}
                            <div className="card-actions-mobile" style={{ textAlign: 'center', marginTop: '15px' }}>
                                {canRecover ? (
                                    <button
                                        onClick={() => onRecoverClick(item)}
                                        className="btn-confirm-centered" // Menggunakan className yang sudah ada
                                    >
                                        Pulihkan Stok
                                    </button>
                                ) : (
                                    <span className="status-selesai">Sudah Lunas / Dipulihkan</span>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <p style={{ textAlign: 'center' }}>Tidak ada data kehilangan.</p>
                )}
            </div>
        </>
    );
}

export default ToolReportView;