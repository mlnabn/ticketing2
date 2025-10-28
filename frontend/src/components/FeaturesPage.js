import React from 'react';
import AnimateOnScroll from './AnimateOnScroll'; 

const FeaturesPage = () => {
  return (
    <div className="features-container">

      {/* 3. Bungkus setiap grup fitur */}
      <AnimateOnScroll>
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
      </AnimateOnScroll>

      <AnimateOnScroll>
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
      </AnimateOnScroll>

      <AnimateOnScroll>
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
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="features-group">
          <h2>Kepercayaan Pengguna</h2>
          <div className="trust-grid">
            {/* ... (Konten Card Trust Signal) ... */}
            <div className="trust-card">✅ <span className="highlight">500+</span> tiket berhasil diselesaikan tiap bulan</div>
            <div className="trust-card">⚡ <span className="highlight">95%</span> user puas dengan respon cepat</div>
            <div className="trust-card">👥 <span className="highlight">2.000+</span> pengguna aktif setiap minggu</div>
            <div className="trust-card">⏱ <span className="highlight">&lt; 5 menit</span> rata-rata respon tiket</div>
            <div className="trust-card">⭐ <span className="highlight">4.8/5</span> rating kepuasan pengguna</div>
            <div className="trust-card">🏢 Digunakan oleh <span className="highlight">30+</span> Karyawan Perusahaan</div>
          </div>
        </div>
      </AnimateOnScroll>

      {/* 4. FOOTER DIHAPUS DARI SINI */}
    </div>
  );
};

export default FeaturesPage;