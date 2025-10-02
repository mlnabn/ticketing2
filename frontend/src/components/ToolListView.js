// src/components/ToolListView.jsx
import React from 'react';

function ToolListView({ tools, lostItems, loading, onBack, onAdd, onEdit, onDelete, onRecover }) {
    return (
        <>
            <div className="user-management-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="back-btn" onClick={onBack}>
                        Kembali
                    </button>
                    <button className="add-btn" onClick={onAdd}>
                        Tambah Alat Baru
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Memuat data alat...</p>
            ) : (
                <>
                    {/* TABLE VIEW untuk Desktop */}
                    <div className="job-list-table">
                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>Nama Alat</th>
                                    <th>Stok Tersedia</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.length > 0 ? tools.map(tool => (
                                    <tr key={tool.id}>
                                        <td>
                                            {tool.name}
                                            {lostItems[tool.id] && (
                                                <div className="lost-item-summary">
                                                    <small style={{ color: 'red' }}>
                                                        {lostItems[tool.id].reduce((sum, item) => sum + item.quantity_lost, 0)} item hilang,{' '}
                                                    </small>
                                                    <button className="btn-recover-small" onClick={() => onRecover(tool, lostItems[tool.id][0])}>
                                                        Pulihkan
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td>{tool.stock}</td>
                                        <td>
                                            <div className="action-buttons-group">
                                                <button className="btn-user-action btn-edit" onClick={() => onEdit(tool)}>Edit</button>
                                                <button className="btn-user-action btn-delete" onClick={() => onDelete(tool.id)}>Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>Belum ada data alat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* CARD VIEW untuk Mobile */}
                    <div className="user-list-mobile">
                        {tools.length > 0 ? tools.map((tool) => (
                            <div key={tool.id} className="ticket-card-mobile">
                                <div className="card-row">
                                    <div className="data-group">
                                        <span className="label">NAMA ALAT</span>
                                        <span className="value">{tool.name}</span>
                                    </div>
                                    <div className="data-group">
                                        <span className="label">STOK</span>
                                        <span className="value">{tool.stock}</span>
                                    </div>
                                </div>

                                {lostItems[tool.id] && (
                                    <div className="card-row">
                                        <div className="data-group single">
                                            <span className="label">BARANG HILANG</span>
                                            <span className="value" style={{ color: 'red' }}>
                                                {lostItems[tool.id].reduce((sum, item) => sum + item.quantity_lost, 0)} item
                                            </span>
                                            <button
                                                className="btn-recover-small"
                                                style={{ marginTop: '5px' }}
                                                onClick={() => onRecover(tool, lostItems[tool.id][0])}
                                            >
                                                Pulihkan
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="action-row">
                                    <div className="action-buttons-group">
                                        <button onClick={() => onEdit(tool)} className="btn-edit">Edit</button>
                                        <button onClick={() => onDelete(tool.id)} className="btn-delete">Hapus</button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center' }}>Belum ada data alat.</p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

export default ToolListView;
