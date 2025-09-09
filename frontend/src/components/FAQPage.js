import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className={`faq-item rounded-2xl border mb-4 shadow-lg backdrop-blur-lg transition-all duration-300 ${isOpen ? "border-blue-400 bg-white/5" : "border-gray-700 bg-white/5"
        }`}
      whileHover={{ scale: 1.01 }}
    >
      {/* Pertanyaan */}
      <button
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
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5">
              <p className="text-gray-300 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQPage = () => {
  const faqs = [
    {
      question: "Bagaimana cara membuat tiket baru?",
      answer:
        "Setelah login, 'Buat Tiket' di halaman Anda dan isi formulir yang tersedia."
    },
    {
      question: "Apakah sistem ini gratis?",
      answer:
        "Ya, website ini adalah website milik perusahaan. Anda bisa menggunakannya dengan izin dari perusahaan."
    },
    {
      question: "Apakah saya bisa melacak status tiket?",
      answer:
        "Tentu, Anda dapat melacak status tiket secara real-time melalui menu 'Tracking' yang ada halaman anda di menu 'history'"
    },
    {
      question: "Siapa yang bisa menggunakan sistem ini?",
      answer:
        "Sistem ini bisa digunakan oleh semua karyawan, tim, dan User yang sudah terdaftar atau didaftarkan oleh Admin."
    },
    {
      question: "Apakah data saya aman?",
      answer:
        "Ya, semua data dilindungi dengan enkripsi end-to-end dan hanya bisa diakses oleh pengguna berwenang."
    },
    {
      question: "Bagaimana cara menghubungi admin?",
      answer:
        "Anda bisa menghubungi Kontak Admin yang tersedia di halaman AboutUs di bagian paling bawah."
    },
    {
      question: "Berapa lama tiket saya akan diproses?",
      answer:
        "Waktu penyelesaian bervariasi tergantung tingkat prioritas tiket. Anda dapat memantau progres secara langsung di sistem."
    },
    {
      question: "Apakah saya bisa melihat riwayat tiket lama?",
      answer:
        "Ya, semua tiket yang pernah Anda buat akan tersimpan di halaman 'History' untuk Anda akses kapan saja."
    }
  ];

  return (
    <motion.div
      className="FAQ"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 style={{ color: "#3aa8ff" }}>Pusat Bantuan (FAQ)</h2>
      {faqs.map((faq, i) => (
        <FAQItem key={i} question={faq.question} answer={faq.answer} />
      ))}
      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </motion.div>

  );
};

export default FAQPage;
