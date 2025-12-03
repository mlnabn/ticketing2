import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";


const FadeInWhenVisible = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, 
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