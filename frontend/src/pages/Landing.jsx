// src/layouts/Landing.jsx (atau di mana file Anda berada)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../Image/homeBg.jpg';
import yourLogok from '../Image/DTECH-Logo.png';
import { useAuth } from '../AuthContext';

// 1. Import semua komponen halaman
import WelcomeHomeUser from '../components/WelcomeHomeUser';
import FeaturesPage from '../components/FeaturesPage';
import FAQPage from '../components/FAQPage';
import AboutUsPage from '../components/AboutUsPage';


export default function LandingLayout() {
  const { loggedIn, login } = useAuth();
  const navigate = useNavigate();

  // (Logika useEffect untuk Google Login Anda tetap sama)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const userParam = params.get('user');
    const expires_in = params.get('expires_in');

    if (access_token && userParam && expires_in) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login({ access_token, user, expires_in });
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Gagal mem-parsing data dari URL di Landing:', e);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [login]);

  useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, navigate]);

  // 3. Fungsi untuk smooth-scroll
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div
      className="dashboard-container no-sidebar landing-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <main className="main-content">
        <header className="main-header-user landing-header sticky-header">
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <div className="header-right-group">
            <button onClick={() => navigate('/login')} className="btn-btn2">
              <i className="fas fa-user-circle"></i>
              <span>Login</span>
            </button>
          </div>
        </header>

        {/* 6. Konten Halaman BARU: Semua komponen di-render di sini */}
        <div className="public-content-singlepalanding-section full-heightge">

          {/* Section 1: Home (Selamat Datang) */}
          <section id="home" className="">
            <WelcomeHomeUser
              onGetStarted={() => handleScrollTo('features')}
            />
          </section>

          {/* Section 2: Features */}
          <section id="features" className="landing-section">
            <FeaturesPage />
          </section>

          {/* Section 3: FAQ */}
          <section id="faq" className="landing-section">
            <FAQPage />
          </section>

          {/* Section 4: About Us */}
          <section id="about" className="landing-section">
            <AboutUsPage />
          </section>
        </div>

        {/* 7. Footer SATU KALI di paling bawah */}
        <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10 mt-12">
          © 2025 Politeknik Negeri Semarang. All rights reserved.
        </footer>
      </main>
    </div>
  );
}