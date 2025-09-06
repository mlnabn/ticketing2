import React from 'react';
import teamworkImage from "../Image/teamwork.jpg";
import teamworkImage2 from "../Image/teamwork2.jpg";
import profil from "../Image/Profil.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Icons
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";



const AboutUsPage = ({ adminList }) => {
  const dummyAdmins = [
    { name: 'Aris', role: 'Leader', avatar: profil },
    { name: 'Rasya', role: 'IT Support', avatar: profil },
    { name: 'Dwian', role: 'IT Support', avatar: profil },
    { name: 'David', role: 'Web Developer', avatar: profil },
    { name: 'Bagas', role: 'Web Developer', avatar: profil },
  ];

  const adminsToDisplay = adminList && adminList.length > 0 ? adminList : dummyAdmins;

  return (
    <div className="about-us-container">
      {/* Header */}
      <header className="about-us-header">
        <h1>About Company</h1>
      </header>

      {/* Mission */}
      <section className="about-us-section mission-section">
        <div className="text-content">
          <h2>Dtech Engineering</h2>
          <h3>Redefine Technology</h3>
          <div className="underline"></div>
          <p>
            DTECH-ENGINEERING is a research and technology company founded in 2009, specializing in mechanical engineering, manufacturing, and consumer product research and development.
          </p>
          <p>
            We have expanded our world-class team to provide superior services for our customers from around the globe. Our team works tirelessly as we aim to provide the best service in the industry, with support that is second to none.
          </p>
        </div>
      </section>

      {/* Team Slider */}
      <section className="about-us-section team-section py-16 px-6 md:px-20 bg-gradient-to-b from-gray-900 to-black">
        <h2 className="text-3xl font-semibold text-center text-purple-400">
          Team Collaboration
        </h2>
        <div className="w-20 h-1 bg-purple-500 mx-auto my-4 rounded"></div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-10"
        >
          {adminsToDisplay.map((admin, index) => (
            <SwiperSlide key={index}>
              <div className="team-member-card bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center hover:scale-105 transition-transform duration-300">
                <img
                  src={admin.avatar}
                  alt={`Profile of ${admin.name}`}
                  className="w-24 h-24 mx-auto rounded-full border-4 border-purple-500 shadow-md mb-4"
                />
                <h3 className="text-lg font-semibold text-white">
                  {admin.name}
                </h3>
                <p className="text-sm text-gray-400">{admin.role}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>


      {/* Values */}
      <section className="about-us-section values-and-image-section">
        <div className="values-grid">
          <h2>Team Values</h2>
          <div className="underline"></div>

          {/* Passion */}
          <div className="value-card">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-heart">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 
                   5.5 0 0 0 16.5 3c-1.76 0-3 
                   .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 
                   5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 
                   3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <h3>Passion</h3>
              <p>
                We bring energy and enthusiasm to everything we do, turning challenges into opportunities and ideas into impact.
              </p>
            </div>
          </div>

          {/* Integrity */}
          <div className="value-card">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-shield-check">
                <path d="M20 13c0 5-3.5 8.5-4.4 
                   9.5a2.32 2.32 0 0 1-3.44 
                   0C8.5 21.5 5 18 5 
                   13V6a4 4 0 0 1 4-4h6a4 
                   4 0 0 1 4 4v7Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3>Integrity</h3>
              <p>
                Trust is at the heart of our work. We act with honesty, transparency, and responsibility in every step.
              </p>
            </div>
          </div>

          {/* Innovation */}
          <div className="value-card">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-lightbulb">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 
                   1-.9 1.5-2.2 1.5-3.5A6 6 
                   0 0 0 6 8c0 1.5.5 2.8 1.5 
                   3.5.8.8 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div>
              <h3>Innovation</h3>
              <p>
                We embrace creativity and forward-thinking, constantly exploring new ways to deliver smarter and better solutions.
              </p>
            </div>
          </div>

          {/* Collaboration */}
          <div className="value-card">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-users">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 
                   4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3>Collaboration</h3>
              <p>
                We believe teamwork multiplies strength. By sharing knowledge and supporting each other, we achieve greater success together.
              </p>
            </div>
          </div>

          {/* Excellence */}
          <div className="value-card">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-award">
                <circle cx="12" cy="8" r="6" />
                <path d="M8.21 13.89 7 23l5-3 5 
                   3-1.21-9.11" />
              </svg>
            </div>
            <div>
              <h3>Excellence</h3>
              <p>
                We strive for excellence in everything we do, setting high standards and continuously improving to deliver outstanding results.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Our Office Life */}
      <section className="aboutus-section mission office-life">
        <div className="mission-image">
          <img src={teamworkImage2} alt="Our Office Life" />
        </div>
        <div className="mission-text">
          <h2 className="heading-gradient">Office Life</h2>
          <div className="underline-line"></div>
          <p>
            Behind the screen of coding, our team stays fully focused on delivering the best solutions. The office is more than just a workspace.
          </p>
          <p>
            it’s a collaborative hub where every idea is shared, refined, and transformed into real innovation.
          </p>
        </div>
      </section>

      <section className="aboutus-section mission reverse work-fun">
        <div className="mission-image">
          <img src={teamworkImage} alt="Collaboration" />
        </div>
        <div className="mission-text">
          <h2 className="heading-gradient">Work & Fun</h2>
          <div className="underline-line"></div>
          <p>
            Hard work is always balanced with moments of joy. Between tasks, there’s laughter, jokes, and togetherness that make work not only productive but also enjoyable.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="about-us-section contact-section">
        <h2>Contact & Social Media</h2>
        <div className="underline"></div>
        <p>If you need assistance or want to connect with us, you can find us on:</p>
        <div className="social-links">
          <a href="https://wa.me/62882005944805" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i> WhatsApp
          </a>
          <a href="https://www.instagram.com/dtech.engineering?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i> Instagram
          </a>
          <a href="https://web.facebook.com/share/g/1BQbxU8Y3D/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i> Facebook
          </a>

        </div>
      </section>
            <footer className="w-full text-center py-6 border-t border-gray-800 text-gray-500 text-sm mt-10 relative z-10">
        © 2025 Politeknik Negeri Semarang. All rights reserved.
      </footer>
    </div>
  );
};

export default AboutUsPage;
