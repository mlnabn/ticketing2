import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHomeUser from './WelcomeHomeUser';

export default function WelcomeHomeUserWrapper() {
  const navigate = useNavigate();

  // Fungsi inilah yang akan kita teruskan ke tombol "Jelajahi"
  const handleGetStarted = () => {
    navigate('/login');
  };

  return <WelcomeHomeUser onGetStarted={handleGetStarted} />;
}