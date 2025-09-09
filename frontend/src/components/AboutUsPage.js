import React from 'react';
import teamworkImage from "../Image/teamwork.jpg";
import teamworkImage2 from "../Image/teamwork2.jpg";
import profil from "../Image/Profil.jpg";



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
        <h1>Tentang Perusahaan</h1>
      </header>

      {/* Mission */}
      <section className="about-us-section mission-section">
        <div className="text-content">
          <h2>Dtech Engineering</h2>
          <h3>Redefine Technology</h3>
          <div className="underline"></div>
          <p>
            DTECH-ENGINEERING adalah perusahaan riset dan teknologi yang didirikan pada tahun 2009, dengan spesialisasi di bidang teknik mesin, manufaktur, serta riset dan pengembangan produk konsumen.
          </p>
          <p>
            Kami telah mengembangkan tim kelas dunia untuk memberikan layanan terbaik bagi pelanggan kami di seluruh dunia. Tim kami bekerja tanpa lelah demi memberikan pelayanan terbaik di industri ini, dengan dukungan yang tiada duanya.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="about-us-section team-section">
        <h2>Team Support</h2>
        <div className="underline"></div>

        <div className="team-grid">
          {/* Baris pertama: 3 orang */}
          {adminsToDisplay.slice(0, 3).map((admin, index) => (
            <div key={index} className="team-member-card">
              <img
                src={admin.avatar}
                alt={`Profile of ${admin.name}`}
                className="member-avatar"
              />
              <h3>{admin.name}</h3>
              <p>{admin.role}</p>
            </div>
          ))}

          {/* Baris kedua: 2 orang */}
          <div className="team-row-2">
            {adminsToDisplay.slice(3, 5).map((admin, index) => (
              <div key={index} className="team-member-card">
                <img
                  src={admin.avatar}
                  alt={`Profile of ${admin.name}`}
                  className="member-avatar"
                />
                <h3>{admin.name}</h3>
                <p>{admin.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Values */}
      <section className="about-us-section values-and-image-section">
        <div className="values-grid">
          <h2>Values</h2>
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
                Kami membawa energi dan antusiasme dalam setiap hal yang kami lakukan, mengubah tantangan menjadi peluang dan ide menjadi dampak nyata.
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
                Kepercayaan adalah inti dari pekerjaan kami. Kami bertindak dengan jujur, transparan, dan penuh tanggung jawab di setiap langkah.
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
                Kami merangkul kreativitas dan pemikiran ke depan, terus mencari cara baru untuk menghadirkan solusi yang lebih cerdas dan lebih baik.
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
                Kami percaya kerja sama tim melipatgandakan kekuatan. Dengan berbagi pengetahuan dan saling mendukung, kami mencapai kesuksesan yang lebih besar bersama.
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
                Kami berkomitmen untuk selalu unggul dalam segala hal yang kami lakukan, menetapkan standar tinggi dan terus meningkatkan diri demi memberikan hasil terbaik.
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
            Di balik layar coding, tim kami tetap fokus penuh untuk menghadirkan solusi terbaik. Kantor bukan sekadar ruang kerja.
          </p>
          <p>
            Melainkan pusat kolaborasi di mana setiap ide dibagikan, disempurnakan, dan diwujudkan menjadi inovasi nyata.
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
            Kerja keras selalu diimbangi dengan momen penuh keceriaan. Di sela-sela tugas, ada tawa, canda, dan kebersamaan yang membuat pekerjaan tidak hanya produktif tetapi juga menyenangkan.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="about-us-section contact-section">
        <h2>Contact & Social Media</h2>
        <div className="underline"></div>
        <p>If you need assistance or want to connect with us, you can find us on:</p>
        <div className="social-links">
          <a href="https://wa.me/+628978830033" target="_blank" rel="noopener noreferrer">
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
