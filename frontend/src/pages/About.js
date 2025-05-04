// About Us page for HomeLy
// Basic structure and styling for the page with a testimonial section
import React, { useEffect, useState } from "react";

const testimonials = [
  { text: "This tool helped us design our dream home in a weekend!", author: "Clara B.", rating: 5 },
  { text: "Super intuitive and surprisingly powerful. Great for beginners too.", author: "Jake L.", rating: 4 },
  { text: "We saved thousands by planning everything ourselves!", author: "The Morgans", rating: 5 },
  { text: "The best floor plan editor I've ever used.", author: "Samantha K.", rating: 5 },
  { text: "Simple, clean, and effective — exactly what we needed.", author: "Martin G.", rating: 4 },
];

const About = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { text, author, rating } = testimonials[currentTestimonial];

  return (
    <div
      style={{
        background: `linear-gradient(to bottom, rgba(245, 245, 220, ${scrollPercent}), rgba(210, 180, 140, 1))`,
        padding: "40px",
        fontFamily: "Poppins, sans-serif",
        transition: "background 0.3s ease-in-out",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", lineHeight: "1.8", fontSize: "8px", textAlign: "justify" }}>

        <h1 style={{ fontWeight: "normal" }}>
          At <strong>HomeLy</strong>, we believe that architectural creativity should be accessible to everyone. Our mission is to tear down the barriers of traditional design software and provide a modern, intuitive floor plan editor that empowers homeowners, students, and professionals alike. You don't need a degree in architecture to start designing — just a vision and a few clicks.
        </h1>
        <h1 style={{ fontWeight: "normal" }}>
          From small apartments to multi-level family homes, our platform is built to adapt to your ideas. You can start with a blank canvas or use our smart templates to speed things up. Place walls, doors, and windows with pixel-level precision, and watch your design come to life instantly. With built-in alignment guides, dimensioning tools, and real-time feedback, even the most complex layouts feel manageable.
        </h1>
        <h1 style={{ fontWeight: "normal" }}>
          What makes DreamPlan Studio truly unique is the seamless fusion of usability and power. Behind its clean interface lies a robust engine capable of handling multi-floor projects, dynamic resizing, and interactive elements like stairs and zones. Whether you want to export blueprints, generate 3D walkthroughs, or collaborate in real time — everything is just a click away.
        </h1>
        <h1 style={{ fontWeight: "normal" }}>
          We've also built our platform with educators and learners in mind. In classrooms around the world, DreamPlan Studio is being used to introduce students to the core concepts of space planning and interior architecture. With built-in learning tips, visual guidance, and unlimited undo history, it's a safe environment for experimentation and discovery.
        </h1>
        <h1 style={{ fontWeight: "normal" }}>
          But perhaps the most important part of our journey is you — our community. Every update we release is influenced by your feedback, your stories, and your creativity. Whether you're a first-time user or a seasoned planner, we're here to support your vision and help bring your dream spaces to life. Together, we're reimagining how design is done.
        </h1>

        <div style={{ display: "flex", justifyContent: "space-around", margin: "50px 0", flexWrap: "wrap", gap: "20px" }}>
          <img src="/images/creativity.jpg" alt="Editor screenshot" style={{ width: "30%", borderRadius: "12px" }} />
          <img src="/images/teamwork.jpg" alt="Design process" style={{ width: "30%", borderRadius: "12px" }} />
          <img src="/images/design_process.avif" alt="Team working" style={{ width: "30%", borderRadius: "12px" }} />
        </div>
      </div>

      <div
        style={{
          marginTop: "60px",
          padding: "30px",
          background: "rgba(210, 180, 135, 0.8)",
          textAlign: "center",
          fontStyle: "italic",
          fontSize: "1.3rem",
          borderRadius: "12px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minHeight: "100px",
        }}
      >
        <div style={{ marginBottom: "10px" }}>{`“${text}”`}</div>
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{author}</div>
        <div>
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
      </div>
    </div >
  );
};

export default About;