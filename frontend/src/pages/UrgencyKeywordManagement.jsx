import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';
import { FaSpinner, FaTrash } from 'react-icons/fa';

export default function UrgencyKeywordManagement() {
  const { showToast } = useOutletContext();
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newScore, setNewScore] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKeywords = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/urgency-keywords');
      setKeywords(response.data);
    } catch (error) {
      showToast('Gagal memuat kata kunci.', 'error');
      console.error('Error fetching keywords:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) {
      showToast('Kata kunci tidak boleh kosong.', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/urgency-keywords', { keyword: newKeyword, score: newScore });
      showToast('Kata kunci berhasil ditambahkan.', 'success');
      setNewKeyword(''); 
      setNewScore(1);
      fetchKeywords();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal menambahkan kata kunci.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (keywordId) => {
    if (window.confirm('Anda yakin ingin menghapus kata kunci ini?')) {
      try {
        await api.delete(`/urgency-keywords/${keywordId}`);
        showToast('Kata kunci berhasil dihapus.', 'success');
        fetchKeywords();
      } catch (error) {
        showToast('Gagal menghapus kata kunci.', 'error');
      }
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score > 0) return 'score-badge positive';
    if (score < 0) return 'score-badge negative';
    return 'score-badge neutral';
  };

  return (
    <div className="user-management-container">
      <h1 className="page-title">Manajemen Kata Kunci Urgensi</h1>
      <p className="page-description">
        Tambahkan kata kunci dan skornya. Tiket akan dianggap URGENT jika total skor
        mencapai <b>{process.env.REACT_APP_URGENCY_THRESHOLD || 5}</b>.
        <br/>
        <b>Contoh:</b> "server down" (Skor: 10), "tidak" (Skor: -5), "lemot" (Skor: 3).
      </p>

      {/* Form untuk menambah kata kunci baru */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} className="keyword-form">
          {/* PERUBAHAN: Form sekarang punya 2 input */}
          <div className="keyword-form-inputs">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Masukkan kata kunci (mis: server down)"
              disabled={isSubmitting}
            />
            <input
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(parseInt(e.target.value, 10))}
              disabled={isSubmitting}
              className="score-input"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}> {/* (modified) */}
            {isSubmitting ? <><FaSpinner className="spin" /> Menambahkan...</> : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Tabel untuk menampilkan daftar kata kunci */}
      <div className="global-notification-history card">
        <h2 className="page-title2">Daftar Kata Kunci Saat Ini</h2>
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</p>
        ) : (
          <div className="keyword-list-container">
            {keywords.length > 0 ? (
              <ul className="history-list">
                {keywords.map((kw) => (
                  <li key={kw.id} className="history-item">
                    <span>{kw.keyword}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={getScoreBadgeClass(kw.score)}>{kw.score}</span>
                      <button onClick={() => handleDelete(kw.id)} className="btn-delete-icon">
                        <FaTrash /> {/* (modified) */}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', padding: '20px' }}>Belum ada kata kunci yang ditambahkan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}