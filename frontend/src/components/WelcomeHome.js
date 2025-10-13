// src/components/WelcomeHome.js
import React from 'react';

const WelcomeHome = ({ userRole, userName, onExploreClick }) => {

  return (
    <div 
    >
      <h1 className="welcome-title">Selamat Datang, {userName}!</h1>
    </div>
  );
};

export default WelcomeHome;
