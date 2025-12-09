import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModalUser from '../components/ConfirmationModalUser';
import RejectionInfoModal from '../components/RejectionInfoModal';
import ViewProofModal from '../components/ViewProofModal';
import TicketDetailModalUser from '../components/TicketDetailModalUser';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
};

const buttonHoverTap = {
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95 }
};

const tabContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
};

export default function UserHistoryPage() {
    const { logout } = useAuth();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const historyListRef = useRef(null);
    const [createdTicketsData, setCreatedTicketsData] = useState({ data: [], current_page: 1, last_page: 1 });

    // Modal States
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [ticketToShowReason, setTicketToShowReason] = useState(null);
    const [showRejectionInfoModal, setShowRejectionInfoModal] = useState(false);
    const [ticketToShowProof, setTicketToShowProof] = useState(null);
    const [showViewProofModal, setShowViewProofModal] = useState(false);
    const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

    const createdTicketsOnPage = useMemo(() => (createdTicketsData ? createdTicketsData.data : []), [createdTicketsData]);

    const handleLogout = useCallback(() => { logout(); }, [logout]);

    const fetchCreatedTickets = useCallback(async (page = 1, isLoadMore = false) => {
        const targetPage = isLoadMore ? page : 1;
        try {
            const response = await api.get('/tickets/created-by-me', { params: { page: targetPage } });

            if (isLoadMore) {
                setCreatedTicketsData(prev => {
                    const newTickets = response.data.data.filter(
                        newItem => !prev.data.some(existingItem => existingItem.id === newItem.id)
                    );
                    return { ...response.data, data: [...prev.data, ...newTickets] };
                });
            } else {
                setCreatedTicketsData(response.data);
            }
        } catch (error) {
            console.error("Gagal mengambil tiket yang dibuat:", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            isLoadMore && setIsLoadingMore(false);
        }
    }, [handleLogout]);

    const loadMoreItems = async () => {
        if (isLoadingMore || createdTicketsData.current_page >= createdTicketsData.last_page) return;
        setIsLoadingMore(true);
        const nextPage = createdTicketsData.current_page + 1;
        await fetchCreatedTickets(nextPage, true);
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;
        if (nearBottom && !isLoadingMore && createdTicketsData.current_page < createdTicketsData.last_page) {
            loadMoreItems();
        }
    };

    // --- Handlers ---
    const handleRowClick = (e, ticket) => {
        if (e.target.closest('button')) return;
        setSelectedTicketForDetail(ticket);
    };

    const handleDeleteClick = (ticket) => {
        setTicketToDelete(ticket);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        try {
            await api.delete(`/tickets/${ticketToDelete.id}`);
            fetchCreatedTickets(1);
            setShowConfirmModal(false);
            setShowViewProofModal(false);
            setShowRejectionInfoModal(false);
            setTicketToDelete(null);

            alert('Tiket berhasil dihapus.');
        } catch (error) {
            console.error("Gagal hapus tiket:", error);
            alert(error.response?.data?.error || "Gagal menghapus tiket.");
        } finally {
            setShowConfirmModal(false);
            setTicketToDelete(null);
        }
    };

    useEffect(() => {
        fetchCreatedTickets(1);
        const intervalId = setInterval(() => {
            fetchCreatedTickets(1, false);
        }, 60000);
        return () => clearInterval(intervalId);
    }, [fetchCreatedTickets]);
    const columnStyles = {
        col1: { width: '200px', textAlign: 'center' },
        col2: { width: '100px', textAlign: 'center' },
        col3: { width: '100px', textAlign: 'center' },
        col4: { width: '100px', textAlign: 'center' },
        col5: { width: '200px', textAlign: 'center' },
        col6: { width: '150px', textAlign: 'center' },

        col7: { width: '200px', textAlign: 'left' },
        col8: { width: '100px', textAlign: 'left' },
        col9: { width: '100px', textAlign: 'left' },
        col10: { width: '100px', textAlign: 'left' },
        col11: { width: '200px', textAlign: 'center' },
        col12: { width: '150px', textAlign: 'center' },
    };

    return (
        <motion.div
            className="history-tab"
            variants={tabContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ padding: '0 10px' }} 
        >
            <motion.h2 variants={itemVariants} style={{ marginBottom: '20px' }}>Your Tickets</motion.h2>
            <div className="desktop-header-container">
                <table className="job-table-user user-history-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={columnStyles.col1}>Deskripsi</th>
                            <th style={columnStyles.col2}>Workshop</th>
                            <th style={columnStyles.col3}>Tanggal Dibuat</th>
                            <th style={columnStyles.col4}>Waktu Pengerjaan</th>
                            <th style={columnStyles.col5}>Status</th>
                            <th style={columnStyles.col6}>Aksi</th>
                        </tr>
                    </thead>
                </table>
            </div>

            <motion.div
                className="job-list table-body-scroll"
                ref={historyListRef}
                onScroll={handleScroll}
                style={{ marginTop: '0px', maxHeight: '60vh', overflowY: 'auto' }}
                variants={itemVariants}
            >
                <table className="job-table-user user-history-table" style={{ width: '100%' }}>
                    <tbody>
                        {!createdTicketsData ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Memuat riwayat tiket...</td></tr>
                        ) : createdTicketsOnPage.length > 0 ? (
                            createdTicketsOnPage.map(ticket => (
                                <tr
                                    key={ticket.id}
                                    className="clickable-row"
                                    onClick={(e) => handleRowClick(e, ticket)}
                                >
                                    <td data-label="Deskripsi" style={columnStyles.col7}>
                                        <span className="description-cell">{ticket.title}</span>
                                    </td>
                                    <td data-label="Workshop" style={columnStyles.col8}>
                                        {ticket.workshop ? ticket.workshop.name : 'N/A'}
                                    </td>
                                    <td data-label="Tanggal Dibuat" style={columnStyles.col9}>
                                        {format(new Date(ticket.created_at), 'dd MMM yyyy')}
                                    </td>
                                    <td data-label="Waktu Pengerjaan" style={columnStyles.col10}>
                                        {(() => {
                                            if (ticket.started_at) {
                                                return ticket.completed_at
                                                    ? `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`
                                                    : `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
                                            }
                                            const datePart = ticket.requested_date ? format(new Date(ticket.requested_date), 'dd-MM-yy') : '';
                                            const timePart = ticket.requested_time || '';
                                            return ticket.requested_date || ticket.requested_time ? `Request: ${datePart} ${timePart}`.trim() : 'Waktu Fleksibel';
                                        })()}
                                    </td>
                                    <td data-label="Status" style={columnStyles.col11}>
                                        <span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td data-label="Aksi" style={columnStyles.col12}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                            {ticket.status === 'Selesai' && ticket.proof_description ? (
                                                <motion.button
                                                    variants={buttonHoverTap}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTicketToShowProof(ticket);
                                                        setShowViewProofModal(true);
                                                    }}
                                                    className="btn-action btn-start">
                                                    Lihat Bukti
                                                </motion.button>
                                            ) : ticket.status === 'Ditolak' ? (
                                                <motion.button
                                                    variants={buttonHoverTap}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTicketToShowReason(ticket);
                                                        setShowRejectionInfoModal(true);
                                                    }}
                                                    className="btn-action btn-start">
                                                    Alasan
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    variants={buttonHoverTap}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(ticket);
                                                    }}
                                                    className="btn-action btn-delete-small">
                                                    Hapus
                                                </motion.button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Anda belum membuat tiket.</td></tr>
                        )}
                        {isLoadingMore && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>Memuat lebih banyak...</td></tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Footer Total */}
            {createdTicketsData && createdTicketsData.total > 0 && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        marginTop: '10px',
                        padding: '15px 20px',
                        background: 'linear-gradient(90deg, rgba(46, 39, 112, 0.6) 0%, rgba(30, 67, 137, 0.6) 100%)',
                        border: '1px solid #5a6d8d',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#FFFFFF',
                        width: '100%', 
                        boxSizing: 'border-box' 
                    }}
                >
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>Total Tiket Saya</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>{createdTicketsData.total}</span>
                </motion.div>
            )}

            <AnimatePresence>
                {showViewProofModal && ticketToShowProof && (
                    <ViewProofModal
                        key="viewProofModal"
                        ticket={ticketToShowProof}
                        onClose={() => setShowViewProofModal(false)}
                        onDelete={handleDeleteClick}
                    />
                )}
                {showRejectionInfoModal && ticketToShowReason && (
                    <RejectionInfoModal
                        key="rejectionModal"
                        ticket={ticketToShowReason}
                        onClose={() => setShowRejectionInfoModal(false)}
                        onDelete={handleDeleteClick}
                    />
                )}
                {showConfirmModal && ticketToDelete && (
                    <ConfirmationModalUser
                        key="confirmModal"
                        message={`Yakin ingin menghapus tiket "${ticketToDelete.title}"?`}
                        onConfirm={confirmDelete}
                        onCancel={() => { setShowConfirmModal(false); setTicketToDelete(null); }}
                    />
                )}
                {selectedTicketForDetail && (
                    <TicketDetailModalUser
                        key="detailModal"
                        ticket={selectedTicketForDetail}
                        onClose={() => setSelectedTicketForDetail(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}