// src/components/NotificationForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';

const API_URL = 'http://127.0.0.1:8000/api';

const notificationTemplates = [
    { title: 'Pemberitahuan Maintenance', message: 'Akan diadakan maintenance sistem pada pukul XX:XX. Mohon untuk menyimpan pekerjaan Anda.' },
    { title: 'Update Aplikasi', message: 'Aplikasi telah diupdate ke versi terbaru. Silakan refresh browser Anda.' },
    { title: 'Pengumuman Penting', message: '' },
];

function NotificationForm({ users }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all'); // 'all' atau user id
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleTemplateClick = (template) => {
        setTitle(template.title);
        setMessage(template.message);
    };

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
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setFeedback('Notifikasi berhasil dikirim!');
            setTitle('');
            setMessage('');
            setTarget('all');
        } catch (error) {
            console.error("Gagal mengirim notifikasi:", error);
            setFeedback('Gagal mengirim notifikasi. Coba lagi.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    return (
        <div className="notification-form-container card">
            <h2>Kirim Notifikasi Baru</h2>

            <div className="templates-section">
                <h4>Gunakan Template :</h4>
                {notificationTemplates.map((template, index) => (
                    <button key={index} onClick={() => handleTemplateClick(template)} className="btn-template">
                        {template.title}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="target">Kirim Ke:</label>
                    <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
                        <option value="all">Semua Pengguna</option>
                        {users.filter(u => u.role === 'user').map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
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
                <div className="form-group">
                    <label htmlFor="message">Isi Pesan</label>
                    <textarea
                        id="message"
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Mengirim...' : 'Kirim Notifikasi'}
                </button>
                {feedback && <p className="feedback-message">{feedback}</p>}
            </form>
        </div>
    );
}

export default NotificationForm;