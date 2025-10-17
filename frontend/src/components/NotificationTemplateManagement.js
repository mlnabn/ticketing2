import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/notification-templates');
      setTemplates(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal mengambil data template:", error);
      showToast('Gagal memuat data template.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTemplates();
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
      fetchTemplates();
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
      fetchTemplates();
    } catch (error) {
      console.error("Gagal menghapus template:", error);
      showToast('Gagal menghapus template.', 'error');
    }
  };

  return (
    <div className="user-management-container">
      <h1>Manajemen Template Notifikasi</h1>
      <button onClick={handleAddClick} className="btn-primary">
        <i className="fas fa-plus" style={{marginRight: '8px'}}></i>
        Tambah Template Baru
      </button>

      {loading ? (
        <p>Memuat data...</p>
      ) : templates.length === 0 ? (
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <p>Belum ada template yang dibuat.</p>
        </div>
      ) : (
        <>
          <div className="job-list-table" style={{ marginTop: '20px' }}>
            <table className='job-table'>
              <thead>
                <tr>
                  <th>Judul Template</th>
                  <th>Isi Pesan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.title}</td>
                    <td style={{ whiteSpace: 'pre-wrap', maxWidth: '400px' }}>{template.message}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button onClick={() => handleEditClick(template)} className="btn-user-action btn-edit">Edit</button>
                        <button onClick={() => handleDeleteClick(template)} className="btn-user-action btn-delete">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="notification-template-list-mobile">
            {templates.map((template) => (
              <div key={template.id} className="ticket-card-mobile">
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
            ))}
          </div>
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