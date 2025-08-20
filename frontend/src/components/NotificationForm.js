// src/components/NotificationForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import { format } from 'date-fns';

const API_URL = 'http://127.0.0.1:8000/api';

const notificationTemplates = [
  {
    title: 'Pemberitahuan Maintenance',
    message:
      'Akan diadakan maintenance sistem pada pukul XX:XX. Mohon untuk menyimpan pekerjaan Anda.',
  },
  {
    title: 'Update Aplikasi',
    message:
      'Aplikasi telah diupdate ke versi terbaru. Silakan refresh browser Anda.',
  },
  { title: 'Pengumuman Penting', message: '' },
];

function NotificationForm({ users }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all'); // 'all' atau user id
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [globalNotifications, setGlobalNotifications] = useState([]);

  // Ambil daftar global notifikasi
  const fetchGlobalNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/global`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setGlobalNotifications(response.data);
    } catch (error) {
      console.error('Gagal mengambil riwayat notifikasi:', error);
    }
  };

  useEffect(() => {
    fetchGlobalNotifications();
  }, []);

  // Hapus notifikasi global
  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus pengumuman ini secara permanen?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchGlobalNotifications(); // Refresh daftar setelah berhasil hapus
    } catch (error) {
      console.error('Gagal menghapus notifikasi:', error);
      alert('Gagal menghapus notifikasi.');
    }
  };

  // Isi form pakai template
  const handleTemplateClick = (template) => {
    setTitle(template.title);
    setMessage(template.message);
  };

  // Kirim notifikasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback('');

    try {
      const payload = {
        title,
        message,
        target_user_id: target === 'all' ? null : target,
      };

      await axios.post(`${API_URL}/notifications`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setFeedback('Notifikasi berhasil dikirim!');
      setTitle('');
      setMessage('');
      setTarget('all');

      // Jika notifikasi global, refresh daftar
      if (payload.target_user_id === null) {
        fetchGlobalNotifications();
      }
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
      setFeedback('Gagal mengirim notifikasi. Coba lagi.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <>
      {/* Form Notifikasi Baru */}
      <div className="notification-form-container card">
        <h2>Kirim Notifikasi Baru</h2>

        {/* Template */}
        <div className="templates-section">
          <h4>Gunakan Template</h4>
          {notificationTemplates.map((template, index) => (
            <button
              key={index}
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

          {/* Feedback */}
          {feedback && <p className="feedback-message">{feedback}</p>}
        </form>
      </div>

      {/* Riwayat Notifikasi Global */}
      <div className="global-notification-history card">
        <h2>Riwayat Pengumuman Global</h2>
        {globalNotifications.length > 0 ? (
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

export default NotificationForm;
