// AvatarUploader.jsx
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const AvatarUploader = ({ initialAvatar, onFileSelect, onRemoveAvatar }) => {
  const [preview, setPreview] = useState(initialAvatar || null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    setPreview(initialAvatar || null);
  }, [initialAvatar]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onRemoveAvatar && onRemoveAvatar();
  };

  return (
    <div className="avatar-uploader">
      {/* Avatar kecil */}
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

      {/* Ganti avatar */}
      <label htmlFor="avatarInput">Ganti Avatar</label>
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Hapus avatar */}
      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="btn btn-danger"
          style={{ marginTop: 8 }}
        >
          Hapus Avatar
        </button>
      )}

      {/* Modal full preview */}
      {showFullPreview && (
        <div
          className="avatar-modal-overlay"
          onClick={() => setShowFullPreview(false)}
        >
          <div
            className="avatar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={preview} alt="Full Avatar" />
            <button
              className="btn-ttp"
              onClick={() => setShowFullPreview(false)}
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
