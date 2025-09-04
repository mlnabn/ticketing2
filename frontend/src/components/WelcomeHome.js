// src/components/WelcomeHome.js
import React from 'react';
import backgroundImage from '../Image/Welcome.svg';

const WelcomeHome = ({ userRole, userName, onExploreClick }) => {
  const isAdmin = userRole && userRole.toLowerCase() === 'admin';

  return (
    <div 
    >
      <h1 className="welcome-title">Selamat Datang, {userName}!</h1>



      {/* <button 
        className="welcome-button"
        onClick={onExploreClick}
      >
        Mulai Jelajahi
      </button> */}
    </div>
  );
};

export default WelcomeHome;
