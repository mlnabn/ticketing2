import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AnimateOnScroll = ({ children, delay = 0, className = "" }) => { 
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
        <motion.div
            ref={ref}
            animate={inView ? "visible" : "hidden"}
            initial={false}
            variants={variants}
            className={className} 
        >
            {children}
        </motion.div>
    );
};

export default AnimateOnScroll;

