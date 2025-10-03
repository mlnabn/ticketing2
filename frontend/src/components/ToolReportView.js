// src/components/ToolReportView.jsx
import React from 'react';

function ToolReportView({ reportData, loading, onBack }) {
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
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="11" style={{ textAlign: 'center' }}>Memuat laporan...</td></tr>
                        ) : reportData.length > 0 ? reportData.map((item) => (
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
                            </tr>
                        )) : (
                            <tr><td colSpan="11" style={{ textAlign: 'center' }}>Tidak ada data kehilangan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Mobile Card View --- */}
            <div className="job-list-mobile">
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Memuat laporan...</p>
                ) : reportData.length > 0 ? reportData.map((item) => (
                    <div key={`${item.ticket_id}-${item.tool_id}`} className="ticket-card-mobile">
                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Barang</span>
                                <span className="value">{item.tool_name}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Admin</span>
                                <span className="value">{item.admin_name || '-'}</span>
                            </div>
                        </div>

                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Tiket</span>
                                <span className="value">
                                    <span className="description-cell">{item.ticket_title}</span>
                                </span>
                            </div>
                            <div className="data-group">
                                <span className="label">Pinjam</span>
                                <span className="value">{new Date(item.borrowed_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Selesai</span>
                                <span className="value">{item.returned_at ? new Date(item.returned_at).toLocaleDateString('id-ID') : 'Proses'}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Stok Awal</span>
                                <span className="value">{item.stock_awal}</span>
                            </div>
                        </div>

                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Dipinjam</span>
                                <span className="value">{item.dipinjam}</span>
                            </div>
                            <div className="data-group">
                                <span className="label">Hilang</span>
                                <span className="value" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                    {item.quantity_lost}
                                </span>
                            </div>
                        </div>

                        <div className="card-row">
                            <div className="data-group">
                                <span className="label">Dipulihkan</span>
                                <span className="value" style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                                    {item.quantity_recovered}
                                </span>
                            </div>
                            <div className="data-group">
                                <span className="label">Stok Akhir</span>
                                <span className="value">{item.stock_akhir}</span>
                            </div>
                        </div>

                        <div className="card-row">
                            <div className="data-group single">
                                <span className="label">Keterangan</span>
                                <span className="value">{item.keterangan || '-'}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center' }}>Tidak ada data kehilangan.</p>
                )}
            </div>
        </>
    );
}

export default ToolReportView;
