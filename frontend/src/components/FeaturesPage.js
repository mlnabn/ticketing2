// FeaturesPage.js
import React from 'react';

const FeaturesPage = () => {
  return (
    <div className="features-container">
      {/* Bagian 1: Buat & Kelola Tiket */}
      <div className="features-group">
        <h2>Kelola Tiket Anda dengan Mudah</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-plus-circle"></i>
            <h3>Buat Tiket Baru</h3>
            <p>Ajukan permintaan atau laporkan masalah hanya dengan beberapa klik. Proses pembuatan tiket cepat dan sederhana.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-list"></i>
            <h3>Daftar Tiket Pribadi</h3>
            <p>Lihat semua tiket yang pernah Anda buat dalam satu tempat. Tidak ada lagi permintaan yang tercecer.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-file-alt"></i>
            <h3>Detail Kendala</h3>
            <p>Jelaskan secara rinci masalah yang Anda hadapi. Semakin lengkap informasi yang Anda berikan, semakin cepat tim support dapat membantu.</p>
          </div>
        </div>
      </div>

      {/* Bagian 2: Pelacakan Tiket */}
      <div className="features-group">
        <h2>Pantau Status Tiket</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-eye"></i>
            <h3>Pelacakan Real-time</h3>
            <p>Ketahui status tiket Anda (baru, diproses, selesai) kapan saja secara real-time.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-bell"></i>
            <h3>Notifikasi Otomatis</h3>
            <p>Dapatkan notif instan saat ada update atau pemberitahuan dari Tim Support.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-history"></i>
            <h3>Riwayat Lengkap</h3>
            <p>Akses arsip tiket lama Anda dengan mudah untuk referensi di masa depan.</p>
          </div>
        </div>
      </div>

      {/* Bagian 3: Komunikasi dengan Support */}
      <div className="features-group">
        <h2>Komunikasi Lebih Mudah</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-comments"></i>
            <h3>Asisten ChatBot Otomatis</h3>
            <p>Butuh bantuan? Sampaikan kendala Anda langsung melalui ChatWA Bot di menu Kontak halaman About Us.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-reply"></i>
            <h3>Respon Cepat</h3>
            <p>Kendala Anda langsung diproses oleh sistem AI dan dibuatkan tiket secara otomatis tanpa perlu menunggu lama.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-check-circle"></i>
            <h3>Kepastian Solusi</h3>
            <p>Setiap tiket akan ditindaklanjuti hingga tuntas dengan solusi yang jelas, sehingga masalah Anda benar-benar terselesaikan.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </div>
  );
};

export default FeaturesPage;
