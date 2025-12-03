import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import yourLogok from '../Image/DTECH-Logo.png';
import { useAuth } from '../AuthContext';
import WelcomeHomeUser from '../components/WelcomeHomeUser';
import FeaturesPage from '../components/FeaturesPage';
import FAQPage from '../components/FAQPage';
import AboutUsPage from '../components/AboutUsPage';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function LandingLayout() {
  const { loggedIn, login } = useAuth();
  const navigate = useNavigate();

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: "#0a0f1e"
      }
    },
    fpsLimit: 30,
    interactivity: {
      events: {
        onHover: {
          enable: false,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#3b82f6",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: "bounce",
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 45,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

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

  const handleScrollTo = (e, id) => {
    let targetId;
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      targetId = id;
    } else if (typeof e === 'string') {
      targetId = e;
    }
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  return (
    <div className="landing-page-container">
      <Particles
        id="tsparticles-landing"
        init={particlesInit}
        options={particlesOptions}
        className="particles-background"
      />
      <div className="landing-scroll-content">
        <header className="main-header-user landing-header sticky-header">
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <nav className="header-nav">
            <a href="#home" onClick={(e) => handleScrollTo(e, 'home')}>Home</a>
            <a href="#features" onClick={(e) => handleScrollTo(e, 'features')}>Features</a>
            <a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')}>FAQ</a>
            <a href="#about" onClick={(e) => handleScrollTo(e, 'about')}>About Us</a>
          </nav>
          <div className="header-right-group">
            <button onClick={() => navigate('/login')} className="btn-btn2">
              <i className="fas fa-user-circle"></i>
              <span>Login</span>
            </button>
          </div>
        </header>
        <main className="public-content-singlepage">
          <section id="home" className="landing-section full-height">
            <WelcomeHomeUser
              onGetStarted={() => handleScrollTo('features')}
            />
          </section>
          <section id="features" className="landing-section">
            <FeaturesPage />
          </section>
          <section id="faq" className="landing-section">
            <FAQPage />
          </section>
          <section id="about" className="landing-section">
            <AboutUsPage />
          </section>

        </main>
        <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-400 text-xs sm:text-sm relative z-10 mt-12">
          © 2025 Politeknik Negeri Semarang. All rights reserved.
        </footer>
      </div>
    </div>
  );
}