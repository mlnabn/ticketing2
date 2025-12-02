import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const AvatarUploader = ({ initialAvatar, onFileSelect, onRemoveAvatar, onPreviewToggle }) => {
  const [preview, setPreview] = useState(initialAvatar || null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    setPreview(initialAvatar || null);
  }, [initialAvatar]);

  useEffect(() => {
    onPreviewToggle && onPreviewToggle(showFullPreview);
  }, [showFullPreview, onPreviewToggle]);

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

  const handleOpenPreview = () => {
    if (preview) {
      setShowFullPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowFullPreview(false);
  };

  return (
    <div className="avatar-uploader">
      <div
        className="avatar-preview"
        onClick={handleOpenPreview}
        style={{ cursor: preview ? "pointer" : "default" }}
      >
        {preview ? (
          <img src={preview} alt="avatar preview" />
        ) : (
          <span>No Avatar</span>
        )}
      </div>

      <label htmlFor="avatarInput">Ganti Avatar</label>
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="btn btn-danger"
        >
          Hapus Avatar
        </button>
      )}

      {showFullPreview && (
        <div
          className="avatar-modal-overlay"
          onClick={handleClosePreview}
        >
          <div
            className="avatar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={preview} alt="Full Avatar" />
            <button
              className="btn-ttp"
              onClick={handleClosePreview}
            >
              <IoClose size={30} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
