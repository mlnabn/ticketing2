import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import api from '../services/api';
import WorkshopFormModal from './WorkshopFormModal';
import ConfirmationModal from './ConfirmationModal';

export default function WorkshopManagement() {
  const { showToast } = useOutletContext();

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const desktopListRef = useRef(null);
  const mobileListRef = useRef(null);

  const fetchWorkshops = useCallback(async (page = 1) => {
    if (page === 1) setLoading(true);

    try {
      const response = await api.get('/workshops', { params: { page } });
      if (page === 1) {
        setWorkshops(response.data.data); 
      } else {
        setWorkshops(prev => [...prev, ...response.data.data]);
      }
      setPagination({
          currentPage: response.data.current_page,
          totalPages: response.data.last_page,
      });
    } catch (error) {
      console.error("Gagal mengambil data workshop:", error);
      showToast('Gagal memuat data workshop.', 'error');
    } finally {
      if (page === 1) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWorkshops(1);
  }, [fetchWorkshops]);

  const handleAddClick = () => {
    setWorkshopToEdit(null);
    setShowFormModal(true);
  };

  const handleEditClick = (workshop) => {
    setWorkshopToEdit(workshop);
    setShowFormModal(true);
  };

  const handleDeleteClick = (workshop) => {
    setWorkshopToDelete(workshop);
    setShowConfirmModal(true);
  };

  const handleSave = async (formData) => {
    const isEditMode = Boolean(workshopToEdit);
    const url = isEditMode ? `/workshops/${workshopToEdit.id}` : '/workshops';
    const method = isEditMode ? 'put' : 'post';

    try {
      await api[method](url, formData);
      showToast(`Workshop berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`, 'success');
      setShowFormModal(false);
      fetchWorkshops(1);
    } catch (error) {
      console.error("Gagal menyimpan workshop:", error);
      showToast('Gagal menyimpan workshop.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!workshopToDelete) return;
    try {
      await api.delete(`/workshops/${workshopToDelete.id}`);
      showToast('Workshop berhasil dihapus.', 'success');
      setShowConfirmModal(false);
      fetchWorkshops(1);
    } catch (error) {
      console.error("Gagal menghapus workshop:", error);
      showToast('Gagal menghapus workshop. Pastikan tidak ada tiket yang terkait.', 'error');
    }
  };

  const loadMoreItems = async () => {
    if (isLoadingMore || !pagination || pagination.currentPage >= pagination.totalPages) {
        return;
    }
    setIsLoadingMore(true);
    await fetchWorkshops(pagination.currentPage + 1);
    setIsLoadingMore(false);
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

    if (nearBottom && !loading && !isLoadingMore && pagination && pagination.currentPage < pagination.totalPages) {
        loadMoreItems();
    }
  };

  return (
    <div className="user-management-container">
      <h1>Manajemen Workshop</h1>
      <button onClick={handleAddClick} className="btn-primary">
        <i className="fas fa-plus" style={{marginRight: '8px'}}></i>
        Tambah Workshop Baru
      </button>
      
      {loading && workshops.length === 0 ? ( // <-- UBAH: Tampilkan hanya jika list kosong
        <p>Memuat data...</p>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className='job-table'>
              <thead>
                <tr>
                  <th>Nama Workshop</th>
                  <th>Kode Tiket</th>
                  <th>Aksi</th>
                </tr>
              </thead>
            </table>
            <div
                className="table-body-scroll"
                ref={desktopListRef}
                onScroll={handleScroll}
                style={{ overflowY: 'auto', maxHeight: '65vh' }}
              >
                <table className='job-table'>
                  <tbody>
                    {workshops.length === 0 && !isLoadingMore ? ( // <-- UBAH: Logika "Tidak ada data"
                      <tr><td colSpan="3" style={{ textAlign: 'center' }}>Belum ada workshop yang ditambahkan.</td></tr>
                    ) : (
                      workshops.map((ws) => (
                      <tr key={ws.id} className="hoverable-row">
                        <td>{ws.name}</td>
                        <td>{ws.code}</td>
                        <td>
                          <div className="action-buttons-group">
                            <button onClick={() => handleEditClick(ws)} className="btn-user-action btn-edit">Edit</button>
                            <button onClick={() => handleDeleteClick(ws)} className="btn-user-action btn-delete">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                    {isLoadingMore && (
                      <tr><td colSpan="3" style={{ textAlign: 'center' }}>Memuat lebih banyak...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>

          <div
            className="workshop-list-mobile"
            ref={mobileListRef}
            onScroll={handleScroll}
            style={{ maxHeight: '65vh', overflowY: 'auto' }} // Atur tinggi & scroll
          >
            {workshops.length > 0 ? (
              workshops.map((ws) => (
              <div key={ws.id} className="ticket-card-mobile">
                <div className="card-row">
                  <div className="data-group">
                    <span className="label">NAMA WORKSHOP</span>
                    <span className="value">{ws.name}</span>
                  </div>
                  <div className="data-group">
                    <span className="label">KODE</span>
                    <span className="value">{ws.code}</span>
                  </div>
                </div>
                <div className="action-row">
                  <div className="action-buttons-group">
                      <button onClick={() => handleEditClick(ws)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDeleteClick(ws)} className="btn-delete">Hapus</button>
                  </div>
                </div>
              </div>
            ))
            ) : (
               !isLoadingMore && <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Belum ada workshop yang ditambahkan.</p></div> // <-- UBAH
            )}
            {/* --- BARU: Indikator Loading More --- */}
            {isLoadingMore && (
              <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
            )}
          </div>
        </>
      )}

      {showFormModal && (
        <WorkshopFormModal
          workshopToEdit={workshopToEdit}
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message={`Anda yakin ingin menghapus workshop "${workshopToDelete?.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}