import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';
import { FaTrash, FaSpinner } from 'react-icons/fa';

export default function UrgencyKeywordManagement() {
  const { showToast } = useOutletContext();
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil daftar kata kunci dari API
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

  // Fungsi untuk menangani penambahan kata kunci baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) {
      showToast('Kata kunci tidak boleh kosong.', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/urgency-keywords', { keyword: newKeyword });
      showToast('Kata kunci berhasil ditambahkan.', 'success');
      setNewKeyword(''); // Kosongkan input setelah berhasil
      fetchKeywords(); // Muat ulang daftar
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal menambahkan kata kunci.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menghapus kata kunci
  const handleDelete = async (keywordId) => {
    if (window.confirm('Anda yakin ingin menghapus kata kunci ini?')) {
      try {
        await api.delete(`/urgency-keywords/${keywordId}`);
        showToast('Kata kunci berhasil dihapus.', 'success');
        fetchKeywords(); // Muat ulang daftar
      } catch (error) {
        showToast('Gagal menghapus kata kunci.', 'error');
      }
    }
  };

  return (
    <div className="user-management-container">
      <h1 className="page-title">Manajemen Kata Kunci Urgensi</h1>
      <p className="page-description">
        Tambahkan atau hapus kata kunci yang akan menandai sebuah tiket sebagai "URGENT" secara otomatis.
      </p>

      {/* Form untuk menambah kata kunci baru */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} className="keyword-form">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Masukkan kata kunci baru (mis: server down)"
            disabled={isSubmitting}
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <i className="fas fa-plus" style={{marginRight: '8px'}}></i>
            {isSubmitting ? <><FaSpinner className="spin" /> Menambahkan...</> : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Tabel untuk menampilkan daftar kata kunci */}
      <div className="card">
        <h2 className="card-header">Daftar Kata Kunci Saat Ini</h2>
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</p>
        ) : (
          <div className="keyword-list-container">
            {keywords.length > 0 ? (
              <ul className="keyword-list">
                {keywords.map((kw) => (
                  <li key={kw.id} className="keyword-item">
                    <span>{kw.keyword}</span>
                    <button onClick={() => handleDelete(kw.id)} className="btn-delete-icon">
                      <FaTrash />
                    </button>
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