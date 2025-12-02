import React from 'react';
import teamworkImage from "../Image/teamwork.jpg";
import teamworkImage2 from "../Image/teamwork2.jpg";
import profil from "../Image/Profil.jpg";
import AnimateOnScroll from './AnimateOnScroll';
// import './AboutUsPage.css'; // Hapus jika sudah di App.css

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
      <AnimateOnScroll className="w-full">
        <header className="about-us-header">
          <h1>Tentang Perusahaan</h1>
        </header>
      </AnimateOnScroll>

      {/* Mission Section */}
      <AnimateOnScroll delay={0.1} className="w-full">
        <section className="about-us-section mission-section">
          <AnimateOnScroll className="text-content" delay={0.15}>
            <AnimateOnScroll delay={0.2}><h2>Dtech Engineering</h2></AnimateOnScroll>
            <AnimateOnScroll delay={0.25}><h3>Redefine Technology</h3></AnimateOnScroll>
            <AnimateOnScroll delay={0.3}><div className="underline-2"></div></AnimateOnScroll>
            <AnimateOnScroll delay={0.35}><p>DTECH-ENGINEERING is a research and technology company founded in 2009, specializing in mechanical engineering, manufacturing, and consumer product research and development.</p></AnimateOnScroll>
            <AnimateOnScroll delay={0.4}><p>We have expanded our world-class team to provide superior services for our customers from around the globe. Our team works tirelessly as we aim to provide the best service in the industry, with support that is second to none.</p></AnimateOnScroll>
          </AnimateOnScroll>
        </section>
      </AnimateOnScroll>

      {/* Team Section */}
      <AnimateOnScroll delay={0.2} className="w-full">
        <section className="about-us-section team-section">
          <AnimateOnScroll delay={0.25}><h2>Team Support</h2></AnimateOnScroll>
          <AnimateOnScroll delay={0.3}><div className="underline"></div></AnimateOnScroll>

          <div className="team-grid">
            {adminsToDisplay.slice(0, 3).map((admin, index) => (
              <AnimateOnScroll key={index} delay={0.35 + index * 0.1} className="flex justify-center">
                <div className="team-member-card">
                  <AnimateOnScroll delay={0.4 + index * 0.1}> <img src={admin.avatar} alt={`Profile of ${admin.name}`} className="member-avatar" /> </AnimateOnScroll>
                  <AnimateOnScroll delay={0.45 + index * 0.1}><h3>{admin.name}</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.5 + index * 0.1}><p>{admin.role}</p></AnimateOnScroll>
                </div>
              </AnimateOnScroll>
            ))}
            <div className="team-row-2">
              {adminsToDisplay.slice(3, 5).map((admin, index) => (
                <AnimateOnScroll key={index + 3} delay={0.6 + index * 0.1} className="flex justify-center">
                  <div className="team-member-card">
                    <AnimateOnScroll delay={0.65 + index * 0.1}><img src={admin.avatar} alt={`Profile of ${admin.name}`} className="member-avatar" /></AnimateOnScroll>
                    <AnimateOnScroll delay={0.7 + index * 0.1}><h3>{admin.name}</h3></AnimateOnScroll>
                    <AnimateOnScroll delay={0.75 + index * 0.1}><p>{admin.role}</p></AnimateOnScroll>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Values Section */}
      <AnimateOnScroll delay={0.4} className="w-full">
        <section className="about-us-section values-and-image-section">
          <div className="values-grid">
            <AnimateOnScroll delay={0.45}><h2 style={{ textAlign: 'center' }}>Values</h2></AnimateOnScroll>
            <AnimateOnScroll delay={0.5}><div className="underline"></div></AnimateOnScroll>

            {/* Animasi per value card */}
            <AnimateOnScroll delay={0.55}>
              <div className="value-card"> {/* Passion */}
                <AnimateOnScroll delay={0.6}><div className="icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
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
                </AnimateOnScroll>
                <div>
                  <AnimateOnScroll delay={0.65}><h3>Passion</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.7}><p>Kami membawa energi dan antusiasme dalam setiap hal yang kami lakukan, mengubah tantangan menjadi peluang dan ide menjadi dampak nyata.</p></AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.6}>
              <div className="value-card"> {/* Integrity */}
                <AnimateOnScroll delay={0.65}><div className="icon-container">
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
                </AnimateOnScroll>
                <div>
                  <AnimateOnScroll delay={0.7}><h3>Integrity</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.75}><p>Kepercayaan adalah inti dari pekerjaan kami. Kami bertindak dengan jujur, transparan, dan penuh tanggung jawab di setiap langkah.</p></AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.65}>
              <div className="value-card"> {/* Innovation */}
                <AnimateOnScroll delay={0.7}><div className="icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="lucide lucide-lightbulb">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 
                   1-.9 1.5-2.2 1.5-3.5A6 6 
                   0 0 0 6 8c0 1.5.5 2.8 1.5 
                   3.5.8.8 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg></div></AnimateOnScroll>
                <div>
                  <AnimateOnScroll delay={0.75}><h3>Innovation</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.8}><p> Kami merangkul kreativitas dan pemikiran ke depan, terus mencari cara baru untuk menghadirkan solusi yang lebih cerdas dan lebih baik.</p></AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.7}>
              <div className="value-card"> {/* Collaboration */}
                <AnimateOnScroll delay={0.75}><div className="icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="lucide lucide-users">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 
                   4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg></div></AnimateOnScroll>
                <div>
                  <AnimateOnScroll delay={0.8}><h3>Collaboration</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.85}><p>Kami percaya kerja sama tim melipatgandakan kekuatan. Dengan berbagi pengetahuan dan saling mendukung, kami mencapai kesuksesan yang lebih besar bersama.</p></AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.75}>
              <div className="value-card"> {/* Excellence */}
                <AnimateOnScroll delay={0.8}><div className="icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="lucide lucide-award">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M8.21 13.89 7 23l5-3 5 
                   3-1.21-9.11" />
                </svg></div></AnimateOnScroll>
                <div>
                  <AnimateOnScroll delay={0.85}><h3>Excellence</h3></AnimateOnScroll>
                  <AnimateOnScroll delay={0.9}><p>Kami berkomitmen untuk selalu unggul dalam segala hal yang kami lakukan, menetapkan standar tinggi dan terus meningkatkan diri demi memberikan hasil terbaik.</p></AnimateOnScroll>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Office Life */}
      <AnimateOnScroll delay={0.5} className="w-full">
        <section className="aboutus-section mission office-life">
          {/* Animate image */}
          <AnimateOnScroll className="mission-image w-full md:w-auto" delay={0.55}>
            <img src={teamworkImage2} alt="Our Office Life" />
          </AnimateOnScroll>
          {/* Animate text content */}
          <AnimateOnScroll className="mission-text" delay={0.6}>
            <AnimateOnScroll delay={0.65}><h2 className="heading-gradient" style={{ textAlign: "center" }}>Office Life</h2></AnimateOnScroll>
            <AnimateOnScroll delay={0.7}><div className="underline-line"></div></AnimateOnScroll>
            <AnimateOnScroll delay={0.75}><p>Di balik layar coding, tim kami tetap fokus penuh untuk menghadirkan solusi terbaik. Kantor bukan sekadar ruang kerja.</p></AnimateOnScroll>
            <AnimateOnScroll delay={0.8}><p>Melainkan pusat kolaborasi di mana setiap ide dibagikan, disempurnakan, dan diwujudkan menjadi inovasi nyata.</p></AnimateOnScroll>
          </AnimateOnScroll>
        </section>
      </AnimateOnScroll>

      {/* Work & Fun */}
      <AnimateOnScroll delay={0.6} className="w-full">
        <section className="aboutus-section mission reverse work-fun">
          {/* Animate image */}
          <AnimateOnScroll className="mission-image w-full md:w-auto" delay={0.65}>
            <img src={teamworkImage} alt="Collaboration" />
          </AnimateOnScroll>
          {/* Animate text content */}
          <AnimateOnScroll className="mission-text" delay={0.7}>
            <AnimateOnScroll delay={0.75}><h2 className="heading-gradient" style={{ textAlign: "center" }} >Work & Fun</h2></AnimateOnScroll>
            <AnimateOnScroll delay={0.8}><div className="underline-line"></div></AnimateOnScroll>
            <AnimateOnScroll delay={0.85}><p>Kerja keras selalu diimbangi dengan momen penuh keceriaan. Di sela-sela tugas, ada tawa, canda, dan kebersamaan yang membuat pekerjaan tidak hanya produktif tetapi juga menyenangkan.</p></AnimateOnScroll>
          </AnimateOnScroll>
        </section>
      </AnimateOnScroll>

      {/* Contact */}
      <AnimateOnScroll delay={0.7} className="w-full">
        <section className="about-us-section contact-section">
          <AnimateOnScroll delay={0.75}><h2>Contact & Social Media</h2></AnimateOnScroll>
          <AnimateOnScroll delay={0.8}><div className="underline"></div></AnimateOnScroll>
          <AnimateOnScroll delay={0.85}><p>If you need assistance or want to connect with us, you can find us on:</p></AnimateOnScroll>
          <div className="social-links">
            {/* Animasi per link sosial */}
            <AnimateOnScroll delay={0.9}><a href="https://wa.me/+628978830033" target="_blank" rel="noopener noreferrer"> <i className="fab fa-whatsapp"></i> WhatsApp </a></AnimateOnScroll>
            <AnimateOnScroll delay={0.95}><a href="https://www.instagram.com/dtech.engineering?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer"> <i className="fab fa-instagram"></i> Instagram </a></AnimateOnScroll>
            <AnimateOnScroll delay={1.0}><a href="https://web.facebook.com/share/g/1BQbxU8Y3D/" target="_blank" rel="noopener noreferrer"> <i className="fab fa-facebook"></i> Facebook </a></AnimateOnScroll>
          </div>
        </section>
      </AnimateOnScroll>
    </div>
  );
};

export default AboutUsPage;