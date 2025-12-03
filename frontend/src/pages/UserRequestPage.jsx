import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobFormUser from '../components/JobFormUser';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

const tabContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export default function UserRequestPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/all');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar pengguna:", error);
    }
  }, []);

  const addTicket = useCallback(async (formData) => {
    try {
      await api.post('/tickets', formData);
      alert('Tiket berhasil dibuat.');
      // Navigasi ke halaman history setelah sukses
      navigate('/user/history'); 
    } catch (error) {
      console.error("Gagal menambah tiket:", error);
      alert('Gagal menambah tiket. Mohon coba lagi.');
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <motion.div
      className="request-tab"
      variants={tabContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h2 variants={itemVariants}>Submit a Request</motion.h2>
      <motion.p variants={itemVariants}>Please fill in the job details below.</motion.p>
      <br />
      <motion.div variants={itemVariants}>
        <JobFormUser users={users} addTicket={addTicket} />
      </motion.div>
    </motion.div>
  );
}