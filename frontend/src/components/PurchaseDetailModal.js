// src/components/ProposalDetailModal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { saveAs } from 'file-saver';

// Helper functions (diambil dari PurchaseProposalPage)
const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

function ProposalDetailModal({ show, proposal, onClose, showToast }) {
    const [proposalDetails, setProposalDetails] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(show);
    const [currentProposal, setCurrentProposal] = useState(proposal);

    // Logic Animasi Modal (Mirip HistoryModal)
    useEffect(() => {
        let timer;
        if (show) {
            setCurrentProposal(proposal);
            setShouldRender(true);
            setIsClosing(false);
        } else {
            setIsClosing(true);
            // pastikan timer selalu jalan walaupun sedang closing
            timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300);
        }
        return () => clearTimeout(timer);
    }, [show, proposal]);

    // Logic Ambil Detail Proposal
    useEffect(() => {
        if (show && currentProposal?.id) {
            setDetailLoading(true);
            setProposalDetails(null); // Clear previous details

            api.get(`/purchase-proposals/${currentProposal.id}`)
                .then(res => {
                    setProposalDetails(res.data);
                })
                .catch(error => {
                    showToast('Gagal memuat detail catatan.', 'error');
                })
                .finally(() => {
                    setDetailLoading(false);
                });
        }
    }, [show, currentProposal, showToast]);

    const handleCloseClick = () => {
        if (onClose) onClose();
        setIsClosing(true);
    };   

// Logic Export (Dipindahkan dari PurchaseProposalPage)
const handleExport = async (exportType) => {
    if (!currentProposal) return;

    if (exportType === 'excel') setExportingExcel(true);
    else setExportingPdf(true);

    try {
        const response = await api.get(`/purchase-proposals/${currentProposal.id}/export`, {
            params: { type: exportType },
            responseType: 'blob',
        });
        const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
        const safeTitle = currentProposal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        const fileName = `Proposal_${safeTitle}.${extension}`;
        saveAs(response.data, fileName);
    } catch (err) {
        console.error(`Gagal mengunduh ${exportType}:`, err);
        showToast('Gagal mengunduh laporan. Mohon coba lagi.', 'error');
    } finally {
        if (exportType === 'excel') setExportingExcel(false);
        else setExportingPdf(false);
    }
};

if (!shouldRender) return null;

const animationClass = isClosing ? 'closing' : '';
const items = proposalDetails?.items || [];

return (
    <div className={`modal-backdrop-centered ${animationClass}`} onClick={handleCloseClick}>
        <div className={`modal-content-large ${animationClass}`} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={handleCloseClick} className="modal-close-btn">&times;</button>
            <h3>Detail: {currentProposal?.title || 'Memuat...'}</h3>

            {/* --- Kontrol Panel (Download Buttons) --- */}
            <div className="history-panel-controls" style={{ padding: '0 0 10px 0', borderBottom: '1px solid #333' }}>
                <div className="download-buttons">
                    <button onClick={() => handleExport('excel')} className="btn-download excel" disabled={exportingExcel}>
                        <i className="fas fa-file-excel"></i> {exportingExcel ? '...' : 'Ekspor Excel'}
                    </button>
                    <button onClick={() => handleExport('pdf')} className="btn-download pdf" disabled={exportingPdf}>
                        <i className="fas fa-file-pdf"></i> {exportingPdf ? '...' : 'Ekspor PDF'}
                    </button>
                </div>
            </div>

            {/* --- Detail Item List (Isi dari history-panel) --- */}
            <div className="history-list-scroll" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px 0' }}>
                {detailLoading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat detail...</p>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="history-log-item">
                            <div className="form-row2">
                                <div className="info-row" style={{ borderBottom: '1px solid #4A5568', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <span className="info-value-info" style={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'left' }}>
                                        {item.master_barang.nama_barang}
                                    </span>
                                    <span className="info-label" style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                                        ({item.master_barang.master_kategori?.nama_kategori} / {item.master_barang.sub_kategori?.nama_sub})
                                    </span>
                                </div>
                                <div className="info-row" style={{ marginBottom: '10px' }}><span className="info-label">Jumlah</span><span className="info-value-info">{item.quantity} Unit</span></div>
                            </div>
                            <div className="form-row2">
                                <div className="info-row"><span className="info-label">Estimasi Harga</span><span className="info-value-info">{formatCurrency(item.estimated_price)}</span></div>
                                <div className="info-row" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                                    <span className="info-label" style={{ color: '#9CA3AF' }}>Total Harga Barang</span>
                                    <span className="info-value-info" style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                                        {formatCurrency(item.estimated_price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                            <div className="info-row full-width" style={{ marginTop: '10px' }}>
                                <span className="info-label">Keterangan</span>
                                <span className="info-value-info" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{item.notes || '-'}</span>
                            </div>
                            {item.link && (
                                <div className="info-row full-width" style={{ marginTop: '10px' }}>
                                    <span className="info-label">Link</span>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#60a5fa',
                                            wordBreak: 'break-all',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {item.link}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>
                        {detailLoading ? 'Memuat detail...' : 'Catatan ini tidak memiliki barang.'}
                    </p>
                )}

                {/* Total Riwayat Item */}
                {!detailLoading && items.length > 0 && (
                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', borderTop: '1px solid #4A5568', borderRadius: '12px' }}>
                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Barang dalam Catatan</span>
                        <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                            {items.length} Item
                        </span>
                    </div>
                )}
            </div>

            <div className="modal-actions">
                <button onClick={handleCloseClick} className="btn-cancel">Tutup</button>
            </div>
        </div>
    </div>
);
}

export default ProposalDetailModal;