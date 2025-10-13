import React, { useState, useEffect, useCallback } from 'react'; // BARU: Tambahkan useCallback
import api from '../services/api';
import { format } from 'date-fns';

// PENYESUAIAN: Hapus props yang tidak perlu, sisakan 'showToast'
export default function NotificationForm({ showToast }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/all');
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (e) {
      console.error('Gagal mengambil daftar semua pengguna:', e);
      showToast('Gagal memuat daftar pengguna.', 'error');
    }
  }, [showToast]); // <-- Tambahkan 'showToast'

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setGlobalNotifications(response.data.filter(n => n.user_id === null));
    } catch (e) {
      console.error('Gagal mengambil notifikasi:', e);
      showToast('Gagal memuat notifikasi.', 'error');
    }
  }, [showToast]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get('/notification-templates');
      setTemplates(response.data.data || response.data);
    } catch (e) {
      console.error('Gagal mengambil template:', e);
      showToast('Gagal memuat template notifikasi.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllUsers();
    fetchNotifications();
    fetchTemplates();
  }, [fetchAllUsers, fetchNotifications, fetchTemplates]);

  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus pengumuman ini secara permanen?')) {
      return;
    }
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications(); // Panggil ulang untuk refresh
      showToast('Notifikasi berhasil dihapus.', 'success');
    } catch (error) {
      console.error('Gagal menghapus notifikasi:', error);
      showToast('Gagal menghapus notifikasi.', 'error');
    }
  };

  const handleTemplateClick = (template) => {
    setTitle(template.title);
    setMessage(template.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { title, message, target_user_id: target === 'all' ? null : target };
      await api.post('/notifications', payload);

      setTitle('');
      setMessage('');
      setTarget('all');

      if (payload.target_user_id === null) {
        fetchNotifications(); // Panggil ulang untuk refresh
      }
      showToast('Notifikasi berhasil dikirim.', 'success');
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
      showToast('Gagal mengirim notifikasi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Form Notifikasi Baru */}
      <div className="notification-form-container card">
        <h2 className="page-title">Kirim Notifikasi Baru</h2>

        {/* Template */}
        <div className="templates-section">
          <h4>Gunakan Template</h4>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="btn-template"
            >
              {template.title}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Target */}
            <div className="form-group">
              <label htmlFor="target">Kirim Ke:</label>
              <select
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">Semua Pengguna</option>
                {users
                  .filter((u) => u.role === 'user')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Judul */}
            <div className="form-group">
              <label htmlFor="title">Judul Notifikasi</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pesan */}
          <div className="form-group2">
            <label htmlFor="message">Isi Pesan</label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Tombol Submit */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Mengirim...' : 'Kirim Notifikasi'}
          </button>
        </form>
      </div>

      {/* Riwayat Notifikasi Global */}
      <div className="global-notification-history card">
        <h2 className="page-title2">Riwayat Pengumuman Global</h2>
        {/* Gunakan state lokal 'globalNotifications' */}
        {globalNotifications && globalNotifications.length > 0 ? (
          <ul className="history-list">
            {globalNotifications.map((notif) => (
              <li key={notif.id} className="history-item">
                <div className="history-item-content">
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>
                    Dikirim pada:{' '}
                    {format(new Date(notif.created_at), 'dd MMMM yyyy, HH:mm')}
                  </small>
                </div>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="btn-delete-small"
                >
                  <i className="fas fa-trash-alt"></i> Hapus
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Belum ada pengumuman global yang dikirim.</p>
        )}
      </div>
    </>
  );
}