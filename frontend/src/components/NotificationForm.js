import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';
import { format } from 'date-fns';
import { motion, useIsPresent } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
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

export default function NotificationForm() {
  const { showToast } = useOutletContext();
  const isPresent = useIsPresent();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [globalNotifPagination, setGlobalNotifPagination] = useState(null);
  const [isLoadingMoreGlobal, setIsLoadingMoreGlobal] = useState(false);
  const historyListRef = useRef(null);

  const userOptions = users.filter((u) => u.role === 'user').map((user) => ({
    value: user.id,
    label: user.name,
  }));

  const targetOptions = [
    { value: 'all', label: 'Semua Pengguna' },
    ...userOptions,
  ];

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/all');
      if (Array.isArray(response.data)) setUsers(response.data);
    } catch (e) {
      console.error('Gagal mengambil daftar semua pengguna:', e);
      showToast('Gagal memuat daftar pengguna.', 'error');
    }
  }, [showToast]);

  const fetchGlobalNotifications = useCallback(async (page = 1) => {
    if (page === 1) setIsLoading(true);

    try {
      const response = await api.get('/notifications/global', { params: { page } });
      if (page === 1) {
        setGlobalNotifications(response.data.data);
      } else {
        setGlobalNotifications(prev => [...prev, ...response.data.data]);
      }
      setGlobalNotifPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
      });
    } catch (e) {
      console.error('Gagal mengambil notifikasi global:', e);
      showToast('Gagal memuat riwayat pengumuman.', 'error');
    } finally {
      if (page === 1) setIsLoading(false);
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
    if (!isPresent) return;
    fetchAllUsers();
    fetchGlobalNotifications();
    fetchTemplates();
  }, [fetchAllUsers, fetchGlobalNotifications, fetchTemplates, isPresent]);

  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus pengumuman ini secara permanen?')) {
      return;
    }
    try {
      await api.delete(`/notifications/${id}`);
      fetchGlobalNotifications(); // Panggil ulang untuk refresh
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
        fetchGlobalNotifications();
      }
      showToast('Notifikasi berhasil dikirim.', 'success');
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
      showToast('Gagal mengirim notifikasi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreGlobalNotifications = async () => {
    if (isLoadingMoreGlobal || !globalNotifPagination || globalNotifPagination.currentPage >= globalNotifPagination.totalPages) {
      return;
    }
    setIsLoadingMoreGlobal(true);
    await fetchGlobalNotifications(globalNotifPagination.currentPage + 1);
    setIsLoadingMoreGlobal(false);
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

    if (nearBottom && !isLoading && !isLoadingMoreGlobal && globalNotifPagination && globalNotifPagination.currentPage < globalNotifPagination.totalPages) {
      loadMoreGlobalNotifications();
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="notification-form-container card">
        <h2 className="page-title">Kirim Notifikasi Baru</h2>
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
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target">Kirim Ke:</label>
              <Select
                classNamePrefix="custom-select-notif"
                options={targetOptions}
                value={targetOptions.find(option => option.value === target) || null}
                onChange={(selectedOption) => {
                  setTarget(selectedOption.value);
                }}
                isSearchable={true}
                placeholder="Pilih Penerima..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">Judul Notifikasi</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>
          <div className="form-group2">
            <label htmlFor="message">Isi Pesan</label>
            <textarea id="message" rows="5" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Mengirim...' : 'Kirim Notifikasi'}
          </button>
        </form>
      </motion.div>
      <motion.div variants={staggerItem} className="global-notification-history card">
        <h2 className="page-title2">Riwayat Pengumuman Global</h2>
        <ul
          className="history-list"
          ref={historyListRef}
          onScroll={handleScroll}
          style={{ maxHeight: '600px', overflowY: 'auto' }}
        >
          {isLoading && globalNotifications.length === 0 ? (
            <p>Memuat riwayat...</p>
          ) : globalNotifications.length > 0 ? (
            globalNotifications.map((notif) => (
              <li key={notif.id} className="history-item">
                <div className="history-item-content">
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>Dikirim pada:{' '}{format(new Date(notif.created_at), 'dd MMMM yyyy, HH:mm')}</small>
                </div>
                <button onClick={() => handleDelete(notif.id)} className="btn-delete-small" style={{ marginRight: '10px' }}>
                  <i className="fas fa-trash-alt"></i> Hapus
                </button>
              </li>
            ))
          ) : (
            !isLoadingMoreGlobal && <p>Belum ada pengumuman global yang dikirim.</p>
          )}
          {isLoadingMoreGlobal && (
            <li className="loading-indicator" style={{ textAlign: 'center', padding: '10px' }}>Memuat lebih banyak...</li>
          )}
        </ul>
      </motion.div>
    </motion.div>
  );
}