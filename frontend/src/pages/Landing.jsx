import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import bgImage from '../Image/homeBg.jpg';
import yourLogok from '../Image/DTECH-Logo.png';
import { useAuth } from '../AuthContext';

export default function LandingLayout() {
  const { loggedIn, setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  // Efek untuk menangani callback Google Login (HANYA MENGATUR STATE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlAccessToken = params.get('access_token');
    const userParam = params.get('user');

    if (urlAccessToken && userParam) {
      try {
        const u = JSON.parse(decodeURIComponent(userParam));
        setAccessToken(urlAccessToken);
        setUser(u);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Gagal mem-parsing data user dari URL di Landing:', e);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [setAccessToken, setUser]);

  // --- TAMBAHAN PENTING ---
  // Efek ini sekarang menangani navigasi SETELAH state 'loggedIn' diperbarui.
  useEffect(() => {
    if (loggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [loggedIn, navigate]);


  // Render layout seperti biasa
  return (
    <div
      className="dashboard-container no-sidebar landing-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <main className="main-content">
        <header className="main-header-user landing-header">
          <div className="header-left-group">
            <img src={yourLogok} alt="Logo" className="header-logo" />
          </div>
          <nav className="header-nav">
            <Link to="/">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/about">About Us</Link>
          </nav>
          <div className="header-right-group">
            <button onClick={() => navigate('/login')} className="btn-btn2">
              <i className="fas fa-user-circle"></i>
              <span>Login</span>
            </button>
          </div>
        </header>

        <div className="public-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}