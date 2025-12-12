import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { FaCamera, FaImage } from 'react-icons/fa';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

function ProofModal({ show, ticket, onSave, onClose }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const [currentTicket, setCurrentTicket] = useState(ticket);

  // Handle browser back button
  const handleClose = useModalBackHandler(show, onClose, 'proof');

  useEffect(() => {
    if (show) {
      setCurrentTicket(ticket);
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setShouldRender(false);
        setDescription('');
        setImage(null);
        setPreview(null);
        setIsCompressing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, ticket, shouldRender]);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];

      if (!originalFile.type.startsWith('image/')) {
        alert('Mohon upload file gambar.');
        return;
      }
      setIsCompressing(true);
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.7,
        fileType: "image/jpeg"
      };
      try {
        const compressedFile = await imageCompression(originalFile, options);
        console.log(`Original: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        setImage(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Gagal melakukan kompresi gambar:", error);
        alert("Gagal memproses gambar, silakan coba lagi.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description) {
      alert('Deskripsi pengerjaan tidak boleh kosong.');
      return;
    }

    if (isCompressing) {
      alert('Mohon tunggu, gambar sedang diproses...');
      return;
    }

    const formData = new FormData();
    formData.append('proof_description', description);
    if (image) {
      formData.append('proof_image', image);
    }

    onSave(currentTicket.id, formData);
  };

  if (!shouldRender) return null;
  if (!currentTicket) return null;

  const animationClass = isClosing ? 'closing' : '';

  return (
    <div
      className={`modal-backdrop ${animationClass}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content-detail ${animationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '2rem' }}>Bukti Pengerjaan: {currentTicket.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="proof-modal__group">
            <label htmlFor="proof_description">Deskripsi Pengerjaan</label>
            <textarea
              id="proof_description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Laptop sudah diperbaiki dengan mengganti RAM yang rusak."
              required
              className="detail-edit-textarea"
            ></textarea>
          </div>
          <div className="proof-modal__group" style={{ marginTop: '20px' }}>
            <label style={{ marginBottom: '10px', display: 'block' }}>Upload Foto Bukti</label>
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              disabled={isCompressing}
              style={{ display: 'none' }}
            />
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isCompressing}
              style={{ display: 'none' }}
            />
            <div className="upload-options-container">
              <label
                htmlFor="camera-input"
                className={`btn-upload-option btn-camera ${isCompressing ? 'disabled' : ''}`}
              >
                <FaCamera size={24} />
                <span>Ambil Foto</span>
              </label>
              <label
                htmlFor="gallery-input"
                className={`btn-upload-option btn-gallery ${isCompressing ? 'disabled' : ''}`}
              >
                <FaImage size={24} />
                <span>Pilih Galeri</span>
              </label>
            </div>

            {isCompressing && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
                ⏳ Sedang memproses & memperkecil ukuran gambar...
              </p>
            )}
          </div>

          {preview && (
            <div className="image-preview" style={{ marginTop: '15px', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={preview}
                  alt="Preview Bukti"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '250px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <button
                  type="button"
                  className="btn-remove-preview"
                  onClick={() => { setImage(null); setPreview(null); }}
                  title="Hapus gambar"
                >X</button>
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">Batal</button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isCompressing}
              style={{ opacity: isCompressing ? 0.7 : 1 }}
            >
              {isCompressing ? 'Memproses...' : 'Simpan Bukti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProofModal;