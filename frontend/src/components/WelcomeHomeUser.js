// src/components/WelcomeHomeUser.js
import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, Clock, FileText } from "lucide-react";

const WelcomeHomeUser = ({ user, onGetStarted }) => {
  return (
    <div className="welcome-card-container flex flex-col min-h-screen text-white px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradient + efek bintang */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-950 to-black -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px] -z-10" />

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col items-center justify-center pb-12">
        {/* Judul */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          Selamat Datang di "Ticketing System"
        </motion.h2>

        {/* Subjudul */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg text-gray-300 text-center max-w-2xl mb-12 relative z-10"
        >
          Permudah tugas harian Anda dan kelola pekerjaan lebih efisien. 
        </motion.p>

        {/* Card Konten */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 
               p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-3xl 
               border border-indigo-500/20 hover:shadow-indigo-500/30 
               transition-all duration-500 mx-2 sm:mx-4"
        >
          {/* Glow di belakang card */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />

          {/* Konten Card */}
          <div className="relative z-10 space-y-5 text-left">
            <p
              className="text-sm font-medium 
               bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 
               bg-clip-text text-transparent"
            >
              Butuh Bantuan?
            </p>

            <p className="text-sm sm:text-base text-gray-300">
              Platform ini dirancang untuk menyederhanakan tugas harian Anda dan
              meningkatkan efisiensi. Jika mengalami kendala, Anda dapat:
            </p>

            <ul className="space-y-4 text-sm sm:text-base">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-500/20 shadow-inner">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </span>
                <span>
                  Membuat dan mengelola tiket dukungan sesuai kebutuhan Anda.
                </span>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-green-500/20 shadow-inner">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </span>
                <span>Melacak perkembangan tiket Anda secara real-time.</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-yellow-500/20 shadow-inner">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </span>
                <span>
                  Meninjau riwayat lengkap dari semua permintaan yang pernah
                  Anda ajukan.
                </span>
              </li>
            </ul>

            <p className="text-gray-300 text-sm sm:text-base">
              Antarmuka yang ramah pengguna memudahkan Anda mengajukan atau
              memantau permintaan.
            </p>

            {/* Tombol CTA */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="mt-6 px-6 md:px-8 py-2.5 md:py-3 
                     bg-gradient-to-r from-purple-600 to-indigo-600 
                     hover:from-purple-500 hover:to-indigo-500 rounded-xl 
                     shadow-lg shadow-purple-600/40 text-sm sm:text-base 
                     text-white font-semibold transition-all"
              >
                🚀 Jelajahi
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </div>
  );
};

export default WelcomeHomeUser;
