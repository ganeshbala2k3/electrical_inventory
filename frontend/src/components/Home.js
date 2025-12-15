import React, { useState, useEffect } from "react";
import { ReconciliationOutlined, ContainerOutlined } from "@ant-design/icons"; // Using appropriate Ant Design icons

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger the fade-in effect after the component mounts
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // --- Styles Object ---
  const styles = {
    // 1. Container: Institutional Feel
    container: {
      minHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start", // Start content higher up
      alignItems: "center",
      padding: "50px 30px",
      backgroundColor: "#ffffff", // Pure white for a clean, academic look
      borderRadius: "10px",
      border: "1px solid #e8e8e8", // Subtle border
    },
    
    // 2. Icon Header Section
    headerIcon: {
      fontSize: "4rem",
      color: "#003366", // Deep Navy Blue (Primary college color)
      marginBottom: "20px",
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? "scale(1)" : "scale(0.5)",
      transition: "opacity 1s ease, transform 1s ease",
    },
    
    // 3. Heading: Prominent and Formal
    heading: {
      fontSize: "2.8rem",
      fontWeight: 800,
      color: "#003366",
      letterSpacing: "1px",
      marginBottom: "5px",
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? "translateY(0)" : "translateY(-20px)",
      transition: "opacity 1s ease, transform 1s ease",
    },
    
    // 4. Subheading: Institutional Identity
    subheading: {
      fontSize: "1.5rem",
      fontWeight: 500,
      color: "#ffc107", // Gold/Yellow Accent (Secondary color)
      textTransform: 'uppercase',
      marginBottom: "40px",
      paddingBottom: "10px",
      borderBottom: '2px solid #ffc107',
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? "translateY(0)" : "translateY(-20px)",
      transition: "opacity 1s ease, transform 1s ease",
      transitionDelay: "0.5s",
    },
    
    // 5. Paragraph: Clear Objectives
    paragraph: {
      fontSize: "1.1rem",
      color: "#555555",
      maxWidth: "800px",
      lineHeight: 1.8,
      textAlign: 'left',
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 1s ease, transform 1s ease",
      transitionDelay: "1s",
    },

    // 6. Feature List Styling
    featureSection: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        textAlign: 'left',
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 1s ease",
        transitionDelay: "1.5s",
    },
    featureItem: {
        fontSize: '1rem',
        marginBottom: '10px',
        color: '#003366',
        fontWeight: 'bold',
    },
    featureIcon: {
        marginRight: '10px',
        color: '#ffc107',
    }
  };
  // --- End Styles Object ---

  return (
    <div style={styles.container}>
      
      {/* Icon Header */}
      <ReconciliationOutlined style={styles.headerIcon} />
      
      {/* Heading */}
      <h1 style={styles.heading}>
         Stock Management System
      </h1>
      
      <h2 style={styles.subheading}>
        BAPATLA ENGINEERING COLLEGE
      </h2>
      
      {/* Objective Paragraph */}
      <p style={styles.paragraph}>
        This system is designed to provide seamless, auditable control over institutional assets and consumables. It ensures transparency in material flow—from procurement to utilization—supporting the academic and operational needs of all departments.
      </p>

      {/* Feature List */}

      
    </div>
  );
};

export default Home;