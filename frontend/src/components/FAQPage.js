import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// 🔹 Komponen FAQ Item
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState(null); // simpan status feedback

  return (
    <motion.div
      className={`faq-item rounded-2xl border mb-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${isOpen ? "border-blue-400 bg-white/5" : "border-gray-700 bg-white/5"
        }`}
      whileHover={{ scale: 1.01 }}
    >
      {/* Pertanyaan */}
      <button
        aria-expanded={isOpen} // ✅ status terbuka / tertutup
        aria-controls={`faq-answer-${question}`} // ✅ optional: hubungkan ke konten jawaban
        className="w-full flex justify-between items-center p-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold flex items-center gap-2 text-blue-300 hover:text-blue-400 transition">
          <HelpCircle className="w-5 h-5" />
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-blue-400" />
        </motion.span>
      </button>

      {/* Jawaban */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
           id={`faq-answer-${question}`}
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5">
              <p className="text-gray-300 leading-relaxed">{answer}</p>

              {/* Feedback Section */}
              <div className="mt-4 text-sm text-gray-400 flex items-center gap-3">
                {feedback === null ? (
                  <>
                    <span>Apa jawaban ini membantu?</span>
                    <button
                      onClick={() => setFeedback("yes")}
                      className="flex items-center gap-1 text-green-400 hover:text-green-300 transition"
                    >
                      <ThumbsUp size={16} /> Ya
                    </button>
                    <button
                      onClick={() => setFeedback("no")}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                    >
                      <ThumbsDown size={16} /> Tidak
                    </button>
                  </>
                ) : feedback === "yes" ? (
                  <span className="text-green-400">
                    🙏 Terima kasih atas feedback Anda!
                  </span>
                ) : (
                  <span className="text-red-400">
                    ❌ Tidak membantu?{" "}
                    <a
                      href="https://wa.me/+628978830033"
                      className="text-blue-400 hover:text-blue-300 border-b border-blue-400 hover:border-blue-300 transition"
                    >
                      Hubungi Admin
                    </a>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 🔹 Komponen Halaman FAQ
const FAQPage = () => {
  // FAQ dibagi ke kategori
  const faqCategories = {
    "🎟️ Tiket & Layanan": [
      {
        question: "Bagaimana cara membuat tiket baru?",
        answer:
          "Setelah login, klik 'Buat Tiket' di halaman Anda dan isi formulir yang tersedia.",
      },
      {
        question: "Berapa lama tiket saya akan diproses?",
        answer:
          "Waktu penyelesaian bervariasi tergantung tingkat prioritas tiket. Anda dapat memantau progres secara langsung di sistem.",
      },
    ],
    "🔒 Keamanan & Privasi": [
      {
        question: "Apakah data saya aman?",
        answer:
          "Ya, semua data dilindungi dengan enkripsi end-to-end dan hanya bisa diakses oleh pengguna berwenang.",
      },
    ],
    "👤 Akun & Login": [
      {
        question: "Siapa yang bisa menggunakan sistem ini?",
        answer:
          "Sistem ini bisa digunakan oleh semua karyawan, tim, dan User yang sudah terdaftar atau didaftarkan oleh Admin.",
      },
    ],
    "⚙️ Sistem & Teknis": [
      {
        question: "Apakah sistem ini gratis?",
        answer:
          "Ya, website ini adalah website milik perusahaan. Anda bisa menggunakannya dengan izin dari perusahaan.",
      },
      {
        question: "Apakah saya bisa melacak status tiket?",
        answer:
          "Tentu, Anda dapat melacak status tiket secara real-time melalui menu 'Tracking' yang ada di halaman 'History'.",
      },
      {
        question: "Apakah saya bisa melihat riwayat tiket lama?",
        answer:
          "Ya, semua tiket yang pernah Anda buat akan tersimpan di halaman 'History' untuk Anda akses kapan saja.",
      },
    ],
  };

  // FAQ Populer
  const popularFaqs = [
    faqCategories["🎟️ Tiket & Layanan"][0],
    faqCategories["⚙️ Sistem & Teknis"][1],
    faqCategories["🔒 Keamanan & Privasi"][0],
  ];

  return (
    <motion.div
      className="faq-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-3xl font-bold text-blue-400 mb-6">
        Pusat Bantuan (FAQ)
      </h2>

      {/* FAQ Populer */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-blue-300 mb-4">
          ⭐ Pertanyaan Populer
        </h3>
        {popularFaqs.map((faq, i) => (
          <FAQItem key={`popular-${i}`} {...faq} />
        ))}
      </section>

      {/* FAQ per kategori */}
      {Object.keys(faqCategories).map((category, idx) => (
        <section key={idx} className="mb-10">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            {category}
          </h3>
          {faqCategories[category].map((faq, i) => (
            <FAQItem key={`${category}-${i}`} {...faq} />
          ))}
        </section>
      ))}

      {/* CTA jika belum ketemu jawaban */}
      <div className="text-center mt-10">
        <p className="text-gray-300 mb-4">
          Tidak menemukan jawaban yang Anda cari?
        </p>
        <a
          href="https://wa.me/+628978830033"
          className="inline-block px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md transition"
        >
          Hubungi Admin
        </a>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10 mt-12">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </motion.div>
  );
};

export default FAQPage;
