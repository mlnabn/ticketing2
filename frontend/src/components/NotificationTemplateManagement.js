import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import NotificationTemplateFormModal from './NotificationTemplateFormModal';
import ConfirmationModal from './ConfirmationModal';

export default function NotificationTemplateManagement() {
  const { showToast } = useOutletContext();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const desktopListRef = useRef(null);
  const mobileListRef = useRef(null);

  const fetchTemplates = useCallback(async (page = 1) => {
    if (page === 1) setLoading(true);

    try {
      const response = await api.get('/notification-templates', { params: { page } });
      if (page === 1) {
        setTemplates(response.data.data);
      } else {
        setTemplates(prev => [...prev, ...response.data.data]);
      }
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        total: response.data.total
      });
    } catch (error) {
      console.error("Gagal mengambil data template:", error);
      showToast('Gagal memuat data template.', 'error');
    } finally {
      if (page === 1) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTemplates(1);
  }, [fetchTemplates]);

  const handleAddClick = () => {
    setTemplateToEdit(null);
    setShowFormModal(true);
  };

  const handleEditClick = (template) => {
    setTemplateToEdit(template);
    setShowFormModal(true);
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setShowConfirmModal(true);
  };

  const handleSave = async (formData) => {
    const isEditMode = Boolean(templateToEdit);
    const url = isEditMode ? `/notification-templates/${templateToEdit.id}` : '/notification-templates';
    const method = isEditMode ? 'put' : 'post';

    try {
      await api[method](url, formData);
      showToast(`Template berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`, 'success');
      setShowFormModal(false);
      fetchTemplates(1);
    } catch (error) {
      console.error("Gagal menyimpan template:", error);
      showToast('Gagal menyimpan template.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await api.delete(`/notification-templates/${templateToDelete.id}`);
      showToast('Template berhasil dihapus.', 'success');
      setShowConfirmModal(false);
      fetchTemplates(1);
    } catch (error) {
      console.error("Gagal menghapus template:", error);
      showToast('Gagal menghapus template.', 'error');
    }
  };

  const loadMoreItems = async () => {
    if (isLoadingMore || !pagination || pagination.currentPage >= pagination.totalPages) {
      return;
    }
    setIsLoadingMore(true);
    await fetchTemplates(pagination.currentPage + 1);
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
      <h1>Manajemen Template Notifikasi</h1>
      <button onClick={handleAddClick} className="btn-primary">
        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
        Tambah Template Baru
      </button>

      {loading && templates.length === 0 ? (
        <p>Memuat data...</p>
      ) : (
        <>
          <div className="table-scroll-container">
            <table className='job-table'>
              <thead>
                <tr>
                  <th>Judul Template</th>
                  <th>Isi Pesan</th>
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
                  {templates.length === 0 && !isLoadingMore ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>Belum ada template yang dibuat.</td></tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id} className="hoverable-row">
                        <td>{template.title}</td>
                        <td style={{ whiteSpace: 'pre-wrap', maxWidth: '400px' }}>{template.message}</td>
                        <td>
                          <div className="action-buttons-group">
                            <button onClick={() => handleEditClick(template)} className="btn-user-action btn-edit">Edit</button>
                            <button onClick={() => handleDeleteClick(template)} className="btn-user-action btn-delete">Hapus</button>
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
            {!loading && templates.length > 0 && pagination && (
              <table className="job-table">
                <tfoot>
                  <tr className="subtotal-row">
                    <td colSpan={2}>Total Template</td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem', fontWeight: 'bold' }}>
                      {pagination.total} Data
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div
            className="notification-template-list-mobile"
            ref={mobileListRef}
            onScroll={handleScroll}
            style={{ maxHeight: '65vh', overflowY: 'auto' }}
          >
            {templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="ticket-card-mobile hoverable-row">
                  <div className="card-row">
                    <div className="data-group single">
                      <span className="label">JUDUL TEMPLATE</span>
                      <span className="value">{template.title}</span>
                    </div>
                  </div>
                  {template.message && (
                    <div className="card-row">
                      <div className="data-group single">
                        <span className="label">ISI PESAN</span>
                        <span className="value" style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                          {template.message}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="action-row">
                    <div className="action-buttons-group">
                      <button onClick={() => handleEditClick(template)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDeleteClick(template)} className="btn-delete">Hapus</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !isLoadingMore && <div className="card" style={{ padding: '20px', textAlign: 'center' }}><p>Belum ada template yang dibuat.</p></div> // <-- UBAH
            )}


            {isLoadingMore && (
              <p style={{ textAlign: 'center' }}>Memuat lebih banyak...</p>
            )}
          </div>
          {!loading && !isLoadingMore && templates.length > 0 && pagination && (
            <div className='notification-template-list-mobile'>
              <div className="subtotal-card-mobile acquisition-subtotal" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <span className="subtotal-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Template</span>
                <span className="subtotal-value value-acquisition" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {pagination.total} Data
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {showFormModal && (
        <NotificationTemplateFormModal
          templateToEdit={templateToEdit}
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message={`Anda yakin ingin menghapus template "${templateToDelete?.title}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}