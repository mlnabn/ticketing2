import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHomeUser from './WelcomeHomeUser';

export default function WelcomeHomeUserWrapper() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
  };

  return <WelcomeHomeUser onGetStarted={handleGetStarted} />;
}