import React, { useEffect, useState } from "react";
import "../styles/Home.css";

const Home = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;
      setScrollPercent(scrollRatio);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container" style={{ background: `linear-gradient(to bottom, rgba(245, 245, 220, ${scrollPercent}), rgba(210, 180, 140, 1))` }}>
      {/* Blokk 1 */}
      <div className="section">
        <div className="image-container">
          <img src="/images/home_haz_1.jpg" alt="Modern ház" className="house-image offset-left" />
        </div>
        <div className="text-container">
          <h2>Modern home designs</h2>
          <p>Simple, fast, and visually stunning floor plan creation - anytime, anywhere.</p>
        </div>
      </div>

      {/* Blokk 2 */}
      <div className="section reverse">
        <div className="text-container">
          <h2>Innovative & Customizable</h2>
          <p>A wide range of tools and possibilities to design your dream home exactly how you imagine it.</p>
        </div>
        <div className="image-container">
          <img src="/images/home_haz_2.jpg" alt="Luxus villa" className="house-image offset-right" />
        </div>
      </div>

      {/* Blokk 3 */}
      <div className="section">
        <div className="image-container">
          <img src="/images/home_haz_3.jpg" alt="Modern villa" className="house-image offset-left" />
        </div>
        <div className="text-container">
          <h2>Design Your Own Home</h2>
          <p>Whether it's an apartment or a family house, you can bring your vision to life with ease.</p>
        </div>
      </div>

      {/* Nagy CTA gomb az alján */}
      <div className="final-cta">
        <h2>Tervezze meg saját otthonát most!</h2>
        <a href="/plan" className="big-cta-button">Kezdje el a tervezést</a>
      </div>
    </div>
  );
};

export default Home;
