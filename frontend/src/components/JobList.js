import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useDebounce } from 'use-debounce';
import api from '../services/api';
import { format } from 'date-fns';
import AssignAdminModal from './AssignAdminModal';
import RejectTicketModal from './RejectTicketModal';
import ProofModal from './ProofModal';
import ConfirmationModal from './ConfirmationModal';
import TicketDetailModal from './TicketDetailModal';
import ReturnItemsModal from './ReturnItemsModal';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1, // Jeda antar item
    },
  },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export default function JobList() {
  // --- 1. SETUP & STATE MANAGEMENT ---
  const { showToast } = useOutletContext();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const isMyTicketsPage = location.pathname.includes('/my-tickets');
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // State untuk data dan UI
  const [ticketData, setTicketData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedIds, setSelectedIds] = useState([]);

  // State untuk data pendukung modal
  const [adminList, setAdminList] = useState([]);
  const [itemList, setItemList] = useState([]);

  // State untuk mengontrol semua modal
  const [ticketToAssign, setTicketToAssign] = useState(null);
  const [ticketToReject, setTicketToReject] = useState(null);
  const [ticketForProof, setTicketForProof] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
  const [ticketToReturn, setTicketToReturn] = useState(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const desktopListRef = useRef(null);
  const mobileListRef = useRef(null);

  const loadingStateRef = useRef({
    isLoading,
    isLoadingMore,
    currentPage: ticketData ? ticketData.current_page : 1
  });

  const ticketsOnPage = useMemo(() => ticketData?.data ?? [], [ticketData]);

  const fetchTickets = useCallback(async (isPoll = false) => {
    if (!isPoll) {
      setIsLoading(true);
    }
    const endpoint = isMyTicketsPage ? '/tickets/my-tickets' : '/tickets';

    const params = {
      page: 1,
      search: debouncedSearchTerm,
      status: searchParams.get('status'),
      admin_id: searchParams.get('adminId'),
      date: searchParams.get('date'),
      id: searchParams.get('ticketId'),
    };

    try {
      const response = await api.get(endpoint, { params });
      setTicketData(response.data);
    } catch (e) {
      console.error('Gagal mengambil data tiket:', e);
      showToast('Gagal memuat data tiket.', 'error');
      if (e.response?.status === 401) logout();
      setTicketData({ data: [], current_page: 1, last_page: 1 });
    }
    finally {
      setIsLoading(false);
    }
  }, [isMyTicketsPage, debouncedSearchTerm, logout, showToast, searchParams]);

  const fetchPrerequisites = useCallback(async () => {
    try {
      if (isAdmin) {
        const [adminsRes, itemsRes] = await Promise.all([
          api.get('/admins'),
          api.get('/inventory/items-flat?all=true')
        ]);
        setAdminList(adminsRes.data);
        const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data.data || []);
        if (Array.isArray(itemsData)) setItemList(itemsData);
      }
    } catch (e) {
      console.error("Gagal mengambil data prasyarat:", e);
      showToast('Gagal memuat data admin atau barang.', 'error');
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    fetchTickets(false);
  }, [fetchTickets]);

  useEffect(() => {
    fetchPrerequisites();
  }, [fetchPrerequisites]);

  useEffect(() => {
    const POLLING_INTERVAL = 30000;

    const intervalId = setInterval(() => {
      const { isLoading, isLoadingMore, currentPage } = loadingStateRef.current;
      if (isLoading || isLoadingMore || currentPage > 1) {
        console.log(`Polling skipped: loading=${isLoading}, loadingMore=${isLoadingMore}, page=${currentPage}`);
        return;
      }

      console.log("Polling data tiket terbaru (Halaman 1)...");
      fetchTickets(true);
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchTickets]);

  useEffect(() => {
    setSelectedIds([]);
  }, [ticketsOnPage]);


  useEffect(() => {
    loadingStateRef.current = {
      isLoading,
      isLoadingMore,
      currentPage: ticketData ? ticketData.current_page : 1
    };
  }, [isLoading, isLoadingMore, ticketData]);

  const loadMoreItems = async () => {
    if (isLoadingMore || !ticketData || ticketData.current_page >= ticketData.last_page) return;

    setIsLoadingMore(true);
    const endpoint = isMyTicketsPage ? '/tickets/my-tickets' : '/tickets';
    const nextPage = ticketData.current_page + 1;

    const params = {
      page: nextPage,
      search: debouncedSearchTerm,
      status: searchParams.get('status'),
      admin_id: searchParams.get('adminId'),
      date: searchParams.get('date'),
      id: searchParams.get('ticketId'),
    };

    try {
      const response = await api.get(endpoint, { params });
      setTicketData(prev => ({
        ...response.data,
        data: [...prev.data, ...response.data.data]
      }));
    } catch (e) {
      console.error('Gagal memuat data tiket tambahan:', e);
      showToast('Gagal memuat lebih banyak tiket.', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    if (target.scrollHeight <= target.clientHeight) {
      return;
    }

    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

    if (nearBottom && ticketData && !isLoading && !isLoadingMore && ticketData.current_page < ticketData.last_page) {
      loadMoreItems();
    }
  };

  const updateTicketStatus = async (ticket, newStatus) => {

    if (newStatus === 'Selesai') {
      if (ticket.user_id && ticket.user_id !== user.id) {
        showToast('Anda tidak berhak menyelesaikan tiket ini, hanya admin yang ditugaskan.', 'error');
        return;
      }
      setTicketToReturn(ticket);

    } else {
      if (ticket.user_id && ticket.user_id !== user.id && (newStatus === 'Sedang Dikerjakan' || newStatus === 'Ditunda')) {
        showToast('Anda tidak berhak mengubah status tiket ini.', 'error');
        return;
      }
      try {
        await api.patch(`/tickets/${ticket.id}/status`, { status: newStatus }); //
        showToast('Status tiket berhasil diupdate.', 'success');
        fetchTickets();
      } catch (e) {
        showToast(e.response?.data?.error || 'Gagal mengupdate status tiket.', 'error'); //
      }
    }
  };

  const handleConfirmAssign = async (ticketId, adminId, stokIds) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { user_id: adminId, stok_barang_ids: stokIds });
      setTicketToAssign(null);
      fetchTickets();
      showToast('Tiket berhasil ditugaskan.', 'success');
    } catch (e) {
      const errorMsg = e.response?.data?.errors?.tools || e.response?.data?.message || 'Gagal menugaskan tiket.';
      showToast(errorMsg, 'error');
    }
  };

  const handleConfirmReject = async (ticketId, reason) => {
    try {
      await api.patch(`/tickets/${ticketId}/reject`, { reason });
      setTicketToReject(null);
      fetchTickets();
      showToast('Tiket berhasil ditolak.', 'success');
    } catch (e) {
      showToast('Gagal menolak tiket.', 'error');
    }
  };

  const handleSaveProof = async (ticketId, formData) => {
    try {
      await api.post(`/tickets/${ticketId}/submit-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Bukti pengerjaan berhasil disimpan.', 'success');
      setTicketForProof(null);
      fetchTickets();
    } catch (e) {
      const errorMessage = e.response?.data?.error || 'Gagal menyimpan bukti.';
      showToast(errorMessage, 'error');
    }
  };

  const handleConfirmReturn = async (ticketId, items) => {
    try {
      await api.post(`/tickets/${ticketId}/process-return`, { items });
      showToast('Tiket selesai dan barang telah diproses.', 'success');
      setTicketToReturn(null);
      fetchTickets();
      fetchPrerequisites();
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal memproses pengembalian.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    try {
      await api.delete(`/tickets/${ticketToDelete.id}`);
      fetchTickets();
      showToast('Tiket berhasil dihapus.', 'success');
    } catch (e) {
      const message = e.response?.data?.error || 'Gagal menghapus tiket.';
      showToast(message, 'error');
    } finally {
      setTicketToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast('Pilih setidaknya satu tiket untuk dihapus.', 'info');
      return;
    }
    if (window.confirm(`Anda yakin ingin menghapus ${selectedIds.length} tiket yang dipilih?`)) {
      try {
        await api.post('/tickets/bulk-delete', { ids: selectedIds });
        showToast(`${selectedIds.length} tiket berhasil dihapus.`, 'success');
        fetchTickets();
        setSelectedIds([]);
      } catch (e) {
        showToast('Terjadi kesalahan saat mencoba menghapus tiket.', 'error');
      }
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(ticketId => ticketId !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? ticketsOnPage.map(t => t.id) : []);
  };

  const handleRowClick = (e, ticket) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('.action-buttons-group')) return;
    setSelectedTicketForDetail(ticket);
  };
  const renderActionButtons = (ticket) => {
    if (!isAdmin) { return null; }
    switch (ticket.status) {
      case 'Belum Dikerjakan':
        if (!ticket.user) {
          return (
            <>
              <button onClick={() => setTicketToAssign(ticket)} className="btn-action btn-start">Mulai Kerjakan</button>
              <button onClick={() => setTicketToReject(ticket)} className="btn-action btn-cancel-aksi">Tolak</button>
            </>
          );
        }
        return <button onClick={() => updateTicketStatus(ticket, 'Sedang Dikerjakan')} className="btn-action btn-start">Mulai Kerjakan</button>;
      case 'Sedang Dikerjakan':
        return (
          <>
            <button onClick={() => updateTicketStatus(ticket, 'Selesai')} className="btn-action btn-finish">Selesaikan</button>
            <button onClick={() => updateTicketStatus(ticket, 'Ditunda')} className="btn-action btn-pause">Tunda</button>
          </>
        );
      case 'Ditunda':
        return <button onClick={() => updateTicketStatus(ticket, 'Sedang Dikerjakan')} className="btn-action btn-start">Lanjutkan</button>;
      case 'Selesai':
        return (
          <>
            {!ticket.proof_description && (
              <button onClick={() => setTicketForProof(ticket)} className="btn-action btn-start">Bukti</button>
            )}
            <button onClick={() => setTicketToDelete(ticket)} className="btn-action btn-delete-small">Hapus</button>
          </>
        );
      case 'Ditolak':
        return <button onClick={() => setTicketToDelete(ticket)} className="btn-action btn-delete-small">Hapus</button>;
      default:
        return null;
    }
  };

  const formatWorkTime = (ticket) => {
    if (ticket.started_at && ticket.completed_at) return `${format(new Date(ticket.started_at), 'HH:mm')} - ${format(new Date(ticket.completed_at), 'HH:mm')}`;
    if (ticket.started_at) return `Mulai: ${format(new Date(ticket.started_at), 'HH:mm')}`;
    if (ticket.requested_date && ticket.requested_time) return `Diminta: ${format(new Date(ticket.requested_date), 'dd MMM')}, ${ticket.requested_time}`;
    if (ticket.requested_date) return `Tgl Diminta: ${format(new Date(ticket.requested_date), 'dd MMM yyyy')}`;
    if (ticket.requested_time) return `Waktu Diminta: ${ticket.requested_time}`;
    return 'Jadwal Fleksibel';
  };

  return (
    <>
      <motion.div
        className="user-management-container"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={staggerItem} className="page-title">
          {isMyTicketsPage ? 'Tiket yang Saya Kerjakan' : 'Daftar Semua Tiket'}
        </motion.h1>

        {!isMyTicketsPage && isAdmin && (
          <motion.div variants={staggerItem}>
            <div className="filters-container report-filters" style={{ margin: '20px 0' }}>
              <input
                type="text"
                placeholder="Cari tiket, deskripsi, nama, workshop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              className="bulk-action-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button onClick={handleBulkDelete} className="btn-clear">Hapus {selectedIds.length} Tiket yang Dipilih</button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && !ticketData ? (
          <motion.p variants={staggerItem}>Memuat data tiket...</motion.p>
        ) : (
          <>
            <motion.div variants={staggerItem} className="table-scroll-container" >
              <table className="job-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" onChange={handleSelectAll} checked={ticketsOnPage.length > 0 && selectedIds.length === ticketsOnPage.length} /></th>
                    <th>Pengirim</th>
                    <th>Dikerjakan Oleh</th>
                    <th>Workshop</th>
                    <th>Deskripsi</th>
                    <th>Tanggal Dibuat</th>
                    <th>Waktu Pengerjaan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
              </table>
              <div
                className="table-body-scroll"
                ref={desktopListRef}
                onScroll={handleScroll}
                style={{ overflowY: 'auto', maxHeight: '70vh' }}
              >
                <table className="job-table">
                  <tbody>
                    {ticketsOnPage.length > 0 ? (
                      ticketsOnPage.map(ticket => (
                        <tr
                          key={ticket.id}
                          className={`${selectedIds.includes(ticket.id) ? 'selected-row' : ''}
                        ${(ticket.is_urgent && ticket.status !== 'Selesai' && ticket.status !== 'Ditolak') ? 'urgent-row' : ''}
                        clickable-row`}
                          onClick={(e) => handleRowClick(e, ticket)}
                        >
                          <td style={{ width: '40px' }}><input type="checkbox" checked={selectedIds.includes(ticket.id)} onChange={() => handleSelect(ticket.id)} /></td>
                          <td>{ticket.creator ? ticket.creator.name : 'N/A'}</td>
                          <td>{ticket.user ? ticket.user.name : '-'}</td>
                          <td>{ticket.workshop ? ticket.workshop.name : 'N/A'}</td>
                          <td><span className="description-cell">{ticket.is_urgent ? <span className="urgent-badge">URGENT</span> : null}{ticket.title}</span></td>
                          <td>{format(new Date(ticket.created_at), 'dd MMM yyyy')}</td>
                          <td>{formatWorkTime(ticket)}</td>
                          <td><span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span></td>
                          <td><div className="action-buttons-group">{renderActionButtons(ticket)}</div></td>
                        </tr>
                      ))
                    ) : (
                      !isLoadingMore && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Tidak ada pekerjaan yang ditemukan.</td></tr> // <-- DIUBAH
                    )}
                    {isLoadingMore && (
                      <tr><td colSpan={9} style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && ticketData && ticketData.total > 0 && (
                <table className="job-table">
                  <tfoot>
                    <tr className="subtotal-row">
                      <td colSpan={8} style={{ textAlign: 'left', paddingLeft: '1.25rem', fontWeight: 'bold' }}>
                        Total Tiket
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {ticketData.total}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* Mobile View */}

              <motion.div variants={staggerItem}>
                <div
                  className="job-list-mobile"
                  ref={mobileListRef}
                  onScroll={handleScroll}
                  style={{ maxHeight: '65vh', overflowY: 'auto' }}
                >

                  {ticketsOnPage.length > 0 ? (
                    ticketsOnPage.map(ticket => (
                      <div
                        key={ticket.id}
                        className={`ticket-card-mobile clickable-row ${(ticket.is_urgent && ticket.status !== 'Selesai' && ticket.status !== 'Ditolak') ? 'urgent-row' : ''}`}
                        onClick={(e) => handleRowClick(e, ticket)}
                      >
                        <div className="card-row">
                          <div className="data-group"><span className="label">Pengirim</span><span className="value">{ticket.creator ? ticket.creator.name : 'N/A'}</span></div>
                          <div className="data-group"><span className="label">Dikerjakan Oleh</span><span className="value">{ticket.user ? ticket.user.name : '-'}</span></div>
                        </div>
                        <div className="card-row"><div className="data-group single"><span className="label">Workshop</span><span className="value">{ticket.workshop ? ticket.workshop.name : 'N/A'}</span></div></div>
                        <div className="card-row">
                          <div className="data-group single">
                            <span className="label">Deskripsi</span>
                            <span className="value description">
                              <span className="value description">
                                <span className="description-cell">
                                  {ticket.is_urgent ? <span className="urgent-badge">URGENT</span> : null}
                                  {ticket.title}
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="card-row">
                          <div className="data-group"><span className="label">Tanggal Dibuat</span><span className="value">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</span></div>
                          <div className="data-group"><span className="label">Waktu Pengerjaan</span><span className="value">{formatWorkTime(ticket)}</span></div>
                        </div>
                        <div className="card-row status-row"><span className={`status-badge status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span></div>
                        <div className="card-row action-row"><div className="action-buttons-group">{renderActionButtons(ticket)}</div></div>
                      </div>
                    ))
                  ) : (
                    !isLoadingMore && <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Tidak ada pekerjaan yang ditemukan.</p></div>
                  )}
                  {isLoadingMore && (
                    <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
                  )}
                </div>

                <div className='job-list-mobile'>
                  {!isLoading && !isLoadingMore && ticketData && ticketData.total > 0 && (
                    <div className="subtotal-card-mobile"
                      style={{ marginTop: '1rem', marginBottom: '1rem' }}
                    >
                      <span className="subtotal-label"
                        style={{ fontSize: '13px', fontWeight: 'bold' }}
                      >Total Tiket</span>

                      <span className="subtotal-value"
                        style={{ fontSize: '13px', fontWeight: 'bold' }}
                      >
                        {ticketData.total}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )
        }
        <AnimatePresence>

        <AssignAdminModal
            show={Boolean(ticketToAssign)}
            key="assignModal"
            ticket={ticketToAssign}
            admins={adminList}
            items={itemList}
            onAssign={handleConfirmAssign}
            onClose={() => setTicketToAssign(null)}
            showToast={showToast}
        />
        
        <RejectTicketModal
            show={Boolean(ticketToReject)}
            key="rejectModal"
            ticket={ticketToReject}
            onReject={handleConfirmReject}
            onClose={() => setTicketToReject(null)}
            showToast={showToast}
        />
        
        <ProofModal
            show={Boolean(ticketForProof)}
            key="proofModal"
            ticket={ticketForProof}
            onSave={handleSaveProof}
            onClose={() => setTicketForProof(null)}
        />
        
        <ConfirmationModal
            show={Boolean(ticketToDelete)}
            key="confirmDeleteModal"
            message={`Hapus pekerjaan "${ticketToDelete?.title}"?`}
            onConfirm={confirmDelete}
            onCancel={() => setTicketToDelete(null)}
        />

        <TicketDetailModal
            show={Boolean(selectedTicketForDetail)}
            key="detailModal"
            ticket={selectedTicketForDetail}
            onClose={() => setSelectedTicketForDetail(null)}
        />

        <ReturnItemsModal
            show={Boolean(ticketToReturn)}
            key="returnModal"
            ticket={ticketToReturn}
            onSave={handleConfirmReturn}
            onClose={() => setTicketToReturn(null)}
            showToast={showToast}
        />
      </AnimatePresence>
      </motion.div>
    </>
  );
}