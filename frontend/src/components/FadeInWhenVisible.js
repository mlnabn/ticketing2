// src/components/FadeInWhenVisible.js

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Komponen ini akan membuat "children" (konten di dalamnya)
 * muncul dengan animasi fade-in-up saat di-scroll ke tampilan.
 */
const FadeInWhenVisible = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Hanya animasi sekali saat pertama kali terlihat
    threshold: 0.1,    // Muncul saat 10% elemen terlihat
  });

  const variants = {
    // Posisi awal: tersembunyi, 40px di bawah
    hidden: { opacity: 0, y: 40 },
    // Posisi akhir: terlihat, di posisi y: 0
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={inView ? "visible" : "hidden"}
      initial="hidden"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default FadeInWhenVisible;