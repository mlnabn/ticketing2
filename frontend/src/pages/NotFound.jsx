// src/components/NotFound.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Ikon besar untuk daya tarik visual */}
        <FaExclamationTriangle className="not-found-icon cute-chibi" />

        {/* Judul 404 dengan animasi shake */}
        <h1 className="not-found-title">404</h1>

        {/* Pesan utama */}
        <p className="not-found-message">Halaman Tidak Ditemukan</p>

        {/* Subteks */}
        <p className="not-found-subtext">
          Oops! Halaman yang kamu cari tidak ditemukan.<br />
          Mungkin alamat yang dimasukkan salah.
        </p>

        <Link to="/" className="not-found-link-btn kembali-btn">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
