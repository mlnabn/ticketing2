import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Komponen ini akan membuat "children" (konten di dalamnya)
 * muncul dengan animasi fade-in-up SETIAP KALI di-scroll ke tampilan.
 */
const AnimateOnScroll = ({ children, delay = 0, className = "" }) => { // Tambah prop className
    const { ref, inView } = useInView({
        threshold: 0.1,
    });

    const variants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: delay
            },
        },
    };

    return (
        // Tambahkan className ke motion.div
        <motion.div
            ref={ref}
            animate={inView ? "visible" : "hidden"}
            initial={false}
            variants={variants}
            className={className} // Terapkan className di sini
        >
            {children}
        </motion.div>
    );
};

export default AnimateOnScroll;

