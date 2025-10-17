import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/workshops');
      setWorkshops(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal mengambil data workshop:", error);
      showToast('Gagal memuat data workshop.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWorkshops();
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
      fetchWorkshops();
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
      fetchWorkshops();
    } catch (error) {
      console.error("Gagal menghapus workshop:", error);
      showToast('Gagal menghapus workshop. Pastikan tidak ada tiket yang terkait.', 'error');
    }
  };

  return (
    <div className="user-management-container">
      <h1>Manajemen Workshop</h1>
      <button onClick={handleAddClick} className="btn-primary">
        <i className="fas fa-plus" style={{marginRight: '8px'}}></i>
        Tambah Workshop Baru
      </button>
      
      {loading ? <p>Memuat data...</p> : workshops.length === 0 ? (
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p>Belum ada workshop yang ditambahkan.</p>
        </div>
      ) : (
        <>
          <div className="job-list-table">
            <table className='job-table'>
              <thead>
                <tr>
                  <th>Nama Workshop</th>
                  <th>Kode Tiket</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map((ws) => (
                  <tr key={ws.id}>
                    <td>{ws.name}</td>
                    <td>{ws.code}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button onClick={() => handleEditClick(ws)} className="btn-user-action btn-edit">Edit</button>
                        <button onClick={() => handleDeleteClick(ws)} className="btn-user-action btn-delete">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="workshop-list-mobile">
            {workshops.map((ws) => (
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
            ))}
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