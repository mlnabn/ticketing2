import React from "react";
import { HelpCircle, Clock, FileText } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";
// import './WelcomeHomeUser.css'; // Hapus jika CSS sudah dipindah ke App.css atau tidak dipakai

const WelcomeHomeUser = ({ user, onGetStarted }) => {
  return (
    <div className="text-white px-4 sm:px-6 relative overflow-hidden w-full">
      <main className="flex-1 flex flex-col items-center pt-20 pb-12">
        <AnimateOnScroll className="w-full max-w-6xl">
          <h1
            className="text-4xl leading-snug font-bold mb-4 text-center 
               bg-[linear-gradient(90deg,#6366f1,#3b82f6)] 
               bg-clip-text text-transparent"
          >
            Selamat Datang di "Ticketing System"
          </h1>
        </AnimateOnScroll>


        <AnimateOnScroll delay={0.1} className="w-full max-w-6xl">
          <p className="text-sm sm:text-base md:text-lg text-gray-300 text-center mb-12 relative z-10">
            Permudah tugas harian Anda dan kelola pekerjaan lebih efisien.
          </p>
        </AnimateOnScroll>

        {/* Card Konten */}
        <AnimateOnScroll delay={0.2} className="w-full max-w-6xl">
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg shadow-2xl transition-all duration-300 mx-2 sm:mx-4">
            {/* Konten Card */}
            <div className="relative z-10 space-y-5 text-left">
              {/* ✅ Animasi elemen di dalam card */}
              <AnimateOnScroll delay={0.25}>
                <p className="text-sm font-medium bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                  Butuh Bantuan?
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.3}>
                <p className="text-sm sm:text-base text-gray-300">
                  Platform ini dirancang untuk menyederhanakan tugas harian Anda dan
                  meningkatkan efisiensi. Jika mengalami kendala, Anda dapat:
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.35}>
                <ul className="space-y-4 text-sm sm:text-base">
                  {/* Animasi per list item jika mau (lebih detail) */}
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
                      Meninjau riwayat lengkap dari semua permintaan yang pernah Anda ajukan.
                    </span>
                  </li>
                </ul>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.4}>
                <p className="text-gray-300 text-sm sm:text-base">
                  Antarmuka yang ramah pengguna memudahkan Anda mengajukan atau memantau permintaan.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={0.45}>
                <div className="flex justify-center">
                  <button
                    onClick={onGetStarted}
                    className="mt-6 px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/40 text-sm sm:text-base text-white font-semibold transition-all hover:scale-105 active:scale-95"
                  >
                    🚀 Jelajahi
                  </button>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </AnimateOnScroll>
      </main>
    </div>
  );
};

export default WelcomeHomeUser;