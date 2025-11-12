import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { motion, useIsPresent, AnimatePresence } from 'framer-motion';
import PurchaseProposalModal from './PurchaseProposalModal';
import { saveAs } from 'file-saver';
import PurchaseDetailModal from './PurchaseDetailModal';

function useMediaQuery(query) {
    const [matches, setMatches] = React.useState(false);
    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
}

const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.1 } } };
const staggerItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };
const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

function PurchaseProposalPage() {
    const isPresent = useIsPresent();
    const { showToast } = useOutletContext();
    const isMobile = useMediaQuery('(max-width: 1290px)');
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proposalDetails, setProposalDetails] = useState(null);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const listRef = useRef(null);
    const mobileListRef = useRef(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProposalForDetail, setSelectedProposalForDetail] = useState(null);

    const fetchProposals = useCallback(async (page = 1) => {
        if (page === 1) setLoading(true); else setIsLoadingMore(true);

        try {
            const res = await api.get(`/purchase-proposals?page=${page}`);
            setProposals(prev => page === 1 ? res.data.data : [...prev, ...res.data.data]);
            setPagination({
                currentPage: res.data.current_page,
                totalPages: res.data.last_page,
                total: res.data.total
            });
        } catch (error) {
            showToast('Gagal memuat catatan pengajuan.', 'error');
        } finally {
            if (page === 1) setLoading(false); else setIsLoadingMore(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (isPresent) fetchProposals(1);
    }, [fetchProposals, isPresent]);

    useEffect(() => {
        if (selectedProposal && selectedProposal.id) {
            setDetailLoading(true);

            api.get(`/purchase-proposals/${selectedProposal.id}`)
                .then(res => {
                    setProposalDetails(res.data);
                })
                .catch(error => {
                    showToast('Gagal memuat detail catatan.', 'error');
                    setSelectedProposal(null);
                })
                .finally(() => {
                    setDetailLoading(false);
                });
        }
    }, [selectedProposal, showToast]);

    const handleItemClick = (proposal) => {
        if (selectedProposal && selectedProposal.id === proposal.id) {
            setSelectedProposal(null);
            setProposalDetails(null);
            return;
        }
        setSelectedProposal(proposal);
        setProposalDetails(null);
        setDetailLoading(true);
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;
        if (nearBottom && !loading && !isLoadingMore && pagination.currentPage < pagination.totalPages) {
            fetchProposals(pagination.currentPage + 1);
        }
    };

    const handleSaveSuccess = (newProposal) => {
        setIsModalOpen(false);
        fetchProposals(1);
        handleItemClick(newProposal);
    };

    const handleExport = async (exportType) => {
        if (!selectedProposal) return;

        if (exportType === 'excel') setExportingExcel(true);
        else setExportingPdf(true);

        try {
            const response = await api.get(`/purchase-proposals/${selectedProposal.id}/export`, {
                params: { type: exportType },
                responseType: 'blob',
            });
            const extension = exportType === 'excel' ? 'xlsx' : 'pdf';
            const safeTitle = selectedProposal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
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

    const handleCloseDetailModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setTimeout(() => {
            setSelectedProposalForDetail(null);
        }, 300);
    }, []);

    const handleItemClickDesktop = useCallback((proposal) => {
        if (!proposal || (selectedProposal && selectedProposal.id === proposal.id)) {
            setSelectedProposal(null);
            setProposalDetails(null);
            return;
        }
        setSelectedProposal(proposal);
    }, [selectedProposal]);

    const handleItemClickMobile = useCallback((proposal) => {
        setSelectedProposalForDetail(proposal);
        setIsDetailModalOpen(true);
    }, []);

    const handleProposalClick = (proposal) => {
        if (isMobile) {
            handleItemClickMobile(proposal);
        } else {
            handleItemClickDesktop(proposal);
        }
    };

    return (
        <>
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={staggerItem} className="user-management-container">
                    <h1 className="page-title">Catatan Pengajuan Pembelian</h1>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                        Buat Catatan Baru
                    </button>
                </motion.div>

                <motion.div variants={staggerItem} className={`split-view-container ${selectedProposal ? 'split-view-active' : ''}`}>

                    <div className="list-panel">
                        <div className="job-list-container">
                            {/*Destop View Table*/}
                            {!isMobile && (
                                <div className="table-scroll-container">
                                    <table className="job-table">
                                        <thead>
                                            <tr>
                                                <th>Judul Catatan</th>
                                                <th className={selectedProposal ? 'hide-on-narrow' : ''}>Dibuat Oleh</th>
                                                <th className={selectedProposal ? 'hide-on-narrow' : ''}>Tgl Dibuat</th>
                                                <th className={selectedProposal ? 'hide-on-narrow' : ''}>Total Estimasi</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div
                                        ref={listRef}
                                        onScroll={handleScroll}
                                        style={{ overflowY: 'auto', maxHeight: 'calc(65vh - 45px)' }}
                                    >
                                        <table className="job-table">
                                            <tbody>
                                                {loading && (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Memuat data...</td></tr>
                                                )}
                                                {!loading && proposals.map(proposal => (
                                                    <tr
                                                        key={proposal.id}
                                                        onClick={() => handleProposalClick(proposal)}
                                                        style={{ cursor: 'pointer' }}
                                                        className={`hoverable-row ${selectedProposal?.id === proposal.id ? 'selected-row' : ''}`}
                                                    >
                                                        <td>{proposal.title}</td>
                                                        <td className={selectedProposal ? 'hide-on-narrow' : ''}>{proposal.created_by_user?.name || 'N/A'}</td>
                                                        <td className={selectedProposal ? 'hide-on-narrow' : ''}>{formatDate(proposal.created_at)}</td>
                                                        <td className={selectedProposal ? 'hide-on-narrow' : ''}>{formatCurrency(proposal.total_estimated_cost)}</td>
                                                    </tr>
                                                ))}
                                                {isLoadingMore && (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                                                )}
                                                {!loading && proposals.length === 0 && (
                                                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Belum ada catatan pengajuan.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Total Data untuk Desktop */}
                                    {!loading && proposals.length > 0 && (
                                        <table className="job-table">
                                            <tfoot>
                                                <tr className="subtotal-row">
                                                    <td colSpan={3}>Total Catatan</td>
                                                    <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                                                        {pagination.total} Data
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* Mobile View Cards */}
                            {isMobile && (
                                <div
                                    className="job-list-mobile"
                                    ref={mobileListRef}
                                    onScroll={handleScroll}
                                    style={{ overflowY: 'auto', maxHeight: '65vh' }}
                                >
                                    {loading ? (<p style={{ textAlign: 'center' }}>Memuat...</p>) : proposals.length > 0 ? (
                                        proposals.map(proposal => (
                                            <div
                                                key={proposal.id}
                                                className={`ticket-card-mobile clickable-row ${selectedProposal?.id === proposal.id ? 'selected-row' : ''}`}
                                                onClick={() => handleProposalClick(proposal)}
                                            >
                                                <div className="card-row">
                                                    <div className="data-group single">
                                                        <span className="label">Judul Catatan</span>
                                                        <span className="value description">{proposal.title}</span>
                                                    </div>
                                                </div>
                                                <div className="card-row">
                                                    <div className="data-group">
                                                        <span className="label">Dibuat Oleh</span>
                                                        <span className="value">{proposal.created_by_user?.name || 'N/A'}</span>
                                                    </div>
                                                    <div className="data-group">
                                                        <span className="label">Tgl Dibuat</span>
                                                        <span className="value">{formatDate(proposal.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="card-row">
                                                    <div className="data-group single">
                                                        <span className="label">Total Estimasi</span>
                                                        <span className="value" style={{ fontWeight: 'bold' }}>{formatCurrency(proposal.total_estimated_cost)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<p style={{ textAlign: 'center' }}>Belum ada catatan pengajuan.</p>)}
                                    {isLoadingMore && (<p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>)}
                                </div>
                            )}
                            {/* Total Data Mobile */}

                            {isMobile && (
                                <div className='job-list-mobile'>
                                    {!loading && !isLoadingMore && proposals.length > 0 && (
                                        <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                            <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Catatan</span>
                                            <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                                {pagination.total} Data
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedProposal && !isMobile && (
                            <motion.div
                                className="history-panel"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="history-panel-header">
                                    <h4>Detail: {selectedProposal.title}</h4>
                                    <button onClick={() => handleProposalClick(null)} className="close-button">&times;</button>
                                </div>

                                <div className="history-panel-controls">
                                    <div className="download-buttons">
                                        <button onClick={() => handleExport('excel')} className="btn-download excel" disabled={exportingExcel}>
                                            <i className="fas fa-file-excel"></i> {exportingExcel ? '...' : 'Ekspor Excel'}
                                        </button>
                                        <button onClick={() => handleExport('pdf')} className="btn-download pdf" disabled={exportingPdf}>
                                            <i className="fas fa-file-pdf"></i> {exportingPdf ? '...' : 'Ekspor PDF'}
                                        </button>
                                    </div>
                                </div>

                                <div className="history-list-scroll">
                                    {detailLoading ? (
                                        <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat detail...</p>
                                    ) : proposalDetails && proposalDetails.items && proposalDetails.items.length > 0 ? (
                                        proposalDetails.items.map((item) => (
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
                                            {proposalDetails ? 'Catatan ini tidak memiliki barang.' : 'Pilih catatan untuk melihat detail.'}
                                        </p>
                                    )}
                                </div>

                                {!detailLoading && proposalDetails && proposalDetails.items.length > 0 && (
                                    <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', borderTop: '1px solid #4A5568', borderRadius: '12px' }}>
                                        <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Barang dalam Catatan</span>
                                        <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                            {proposalDetails.items.length} Item
                                        </span>
                                    </div>
                                )}

                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </motion.div>

            <PurchaseProposalModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveSuccess={handleSaveSuccess}
                showToast={showToast}
            />
            <PurchaseDetailModal
                show={isDetailModalOpen} 
                proposal={selectedProposalForDetail} 
                onClose={handleCloseDetailModal}
                showToast={showToast}
            />
        </>
    );
}

export default PurchaseProposalPage;