import React, { useState, useEffect } from 'react';

const AvatarUploader = ({ initialAvatar, onFileSelect }) => {
  const [preview, setPreview] = useState(initialAvatar || null);

  useEffect(() => {
    setPreview(initialAvatar || null);
  }, [initialAvatar]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file); // kirim File ke parent untuk di-append ke FormData nanti
  };

  return (
    <div className="avatar-uploader">
      <div className="avatar-preview" style={{marginBottom: 8}}>
        {preview ? (
          <img src={preview} alt="avatar preview" style={{width: 96, height: 96, borderRadius: '50%', objectFit: 'cover'}}/>
        ) : (
          <div style={{width: 96, height: 96, borderRadius: '50%', background:'#eee', display:'flex',alignItems:'center',justifyContent:'center'}}>No Avatar</div>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default AvatarUploader;
