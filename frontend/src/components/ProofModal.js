import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

function ProofModal({ show, ticket, onSave, onClose }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const [currentTicket, setCurrentTicket] = useState(ticket);

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
        maxSizeMB: 1,  
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg"
      };
      try {
        // Proses Kompresi
        const compressedFile = await imageCompression(originalFile, options);
        
        // Debugging: Cek ukuran file di console
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

  const handleCloseClick = () => {
      if (onClose) {
          onClose();
      }
  };

  if (!shouldRender) return null;
  if (!currentTicket) return null;

  const animationClass = isClosing ? 'closing' : '';

  return (
    <div 
      className={`modal-backdrop ${animationClass}`}
      onClick={handleCloseClick}
    >
      <div 
        className={`modal-content-detail ${animationClass}`}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{fontSize:'2rem'}}>Bukti Pengerjaan: {currentTicket.title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="proof-modal__group">
            <label htmlFor="proof_description">Deskripsi Pengerjaan</label>
            <textarea
              id="proof_description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="detail-edit-textarea"
            ></textarea>
          </div>
          <div className="proof-modal__group" style={{marginTop:'15px'}}>
            <label htmlFor="proof_image">Foto Bukti</label>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <input
                id="proof_image"
                type="file"
                accept="image/*"
                capture="environment" 
                onChange={handleImageChange}
                disabled={isCompressing}
                />
                {isCompressing && <span style={{fontSize:'0.8rem', color:'#666'}}>Memproses gambar...</span>}
            </div>
            <small style={{color: '#888', fontStyle: 'italic', marginTop: '5px', display:'block'}}>
                *Bisa langsung ambil foto dari kamera. Ukuran otomatis diperkecil.
            </small>
          </div>

          {preview && (
            <div className="image-preview" style={{marginTop: '15px'}}>
              <p style={{marginBottom:'5px', fontWeight:'600'}}>Preview:</p>
              <img 
                src={preview} 
                alt="Preview Bukti" 
                style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd' 
                }} 
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={handleCloseClick} className="btn-cancel">Batal</button>
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