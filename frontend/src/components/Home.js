import React, { useState, useEffect } from "react";

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger the fade-in effect after the component mounts
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {/* Heading with fade-in effect */}
      <h1
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 1s ease, transform 1s ease",
        }}
      >
        Welcome to the Inventory Management System
      </h1>
      <h2
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 1s ease, transform 1s ease",
          transitionDelay: "0.5s", // Delay for smoother effect
        }}
      >
        Bapatla Engineering College
      </h2>
      <p
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1s ease, transform 1s ease",
          transitionDelay: "1s", // Delay for smoother effect
        }}
      >
        This system helps manage inventory efficiently for various departments.
      </p>
    </div>
  );
};

export default Home;