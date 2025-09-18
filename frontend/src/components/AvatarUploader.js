import React, { useState, useEffect } from "react";

import { IoClose } from "react-icons/io5";

const AvatarUploader = ({ initialAvatar, onFileSelect }) => {
  const [preview, setPreview] = useState(initialAvatar || null);
  const [showFullPreview, setShowFullPreview] = useState(false); // state untuk modal preview

  useEffect(() => {
    setPreview(initialAvatar || null);
  }, [initialAvatar]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className="avatar-uploader">
      {/* Avatar kecil (klik untuk lihat full) */}
      <div
        className="avatar-preview"
        onClick={() => preview && setShowFullPreview(true)}
        style={{ cursor: preview ? "pointer" : "default" }}
      >
        {preview ? (
          <img src={preview} alt="avatar preview" />
        ) : (
          <span>No Avatar</span>
        )}
      </div>

      {/* Custom label trigger input */}
      <label htmlFor="avatarInput">Ganti Avatar</label>
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Modal full preview */}
      {showFullPreview && (
        <div className="avatar-modal-overlay" onClick={() => setShowFullPreview(false)}>
          <div
            className="avatar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={preview} alt="Full Avatar" />
            <button className="btn-ttp" onClick={() => setShowFullPreview(false)}>
              <IoClose size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
