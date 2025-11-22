import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

// 🔹 Komponen FAQ Item
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Tidak perlu motion.div wrapper luar lagi
  return (
    <div
      className={`faq-item rounded-2xl border mb-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${isOpen
        ? "border-blue-400 bg-white/5"
        : "border-gray-700 bg-white/5"
        }`}
    >
      {/* Animasikan tombol pertanyaan */}
      {/* Kita tidak perlu AnimateOnScroll di sini karena parent-nya sudah dianimasikan */}
      <button
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question}`}
        className="w-full flex justify-between items-center p-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold flex items-center gap-2 text-blue-300 hover:text-blue-400 transition">
          <HelpCircle className="w-5 h-5" />
          {question}
        </span>
        {/* Animasi chevron tetap */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-blue-400" />
        </motion.span>
      </button>

      {/* Jawaban (Animasi buka/tutup tetap) */}
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
              {/* Feedback Section (Bisa dianimasikan juga jika mau) */}
              <AnimateOnScroll delay={0.1}>
                <div className="mt-4 text-sm text-gray-400 flex items-center gap-3">
                  {feedback === null ? (
                    <>
                      <span>Apa jawaban ini membantu?</span>
                      <button onClick={() => setFeedback("yes")} className="..."> <ThumbsUp size={16} /> Ya </button>
                      <button onClick={() => setFeedback("no")} className="..."> <ThumbsDown size={16} /> Tidak </button>
                    </>
                  ) : feedback === "yes" ? (
                    <span className="text-green-400"> 🙏 Terima kasih... </span>
                  ) : (
                    <span className="text-red-400"> ❌ Tidak membantu? <a href="..." className="..."> Hubungi Admin </a> </span>
                  )}
                </div>
              </AnimateOnScroll>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
    // Container utama tidak perlu AnimateOnScroll jika isinya sudah
    <div className="faq-container">
      <AnimateOnScroll className="w-full">
        <h2>
          Pusat Bantuan (FAQ)
        </h2>
      </AnimateOnScroll>

      {/* FAQ Populer */}
      <section className="mb-8">
        <AnimateOnScroll className="w-full" delay={0.1}>
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            ⭐ Pertanyaan Populer
          </h3>
        </AnimateOnScroll>
        {/* AnimateOnScroll membungkus setiap FAQItem */}
        {popularFaqs.map((faq, i) => (
          <AnimateOnScroll key={`popular-${i}`} delay={0.15 + i * 0.05} className="w-full">
            <FAQItem {...faq} />
          </AnimateOnScroll>
        ))}
      </section>

      {/* FAQ per kategori */}
      {Object.keys(faqCategories).map((category, idx) => (
        <section key={idx} className="mb-10">
          <AnimateOnScroll className="w-full" delay={0.25 + idx * 0.1}>
            <h3 className="text-xl font-semibold text-blue-300 mb-4">
              {category}
            </h3>
          </AnimateOnScroll>
          {/* AnimateOnScroll membungkus setiap FAQItem */}
          {faqCategories[category].map((faq, i) => (
            <AnimateOnScroll key={`${category}-${i}`} delay={0.3 + idx * 0.1 + i * 0.05} className="w-full">
              <FAQItem {...faq} />
            </AnimateOnScroll>
          ))}
        </section>
      ))}

      {/* CTA */}
      <AnimateOnScroll className="w-full" delay={0.5}>
        <div className="faq-cta text-center text-gray-400">
          Tidak menemukan jawaban?
          <a
            href="https://wa.me/+628978830033"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 ml-2 border-b border-blue-400"
          >
            Hubungi Admin
          </a>
        </div>
      </AnimateOnScroll>
    </div>
  );
};

export default FAQPage;