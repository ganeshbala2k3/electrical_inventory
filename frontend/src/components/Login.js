import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { port } from "./porturl";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${port}login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        const role = res.data.user.role;

        localStorage.setItem("user_id", res.data.user.id);
        localStorage.setItem("user_name", res.data.user.username);
        localStorage.setItem("user_role", res.data.user.role);
        localStorage.setItem("login_time", new Date().toISOString()); // Store login time
        alert(`Hello ${role.toUpperCase()}, successfully logged in!`);

        switch (role) {
          case "Admin":
          case "Manager":
          case "Staff":
            navigate("/dash");
            break;
          default:
            alert("Unknown role");
        }
      }
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 style={styles.heading}>BAPATLA ENGINEERING COLLEGE</h2>
        <h3 style={styles.subheading}>Inventory Management System</h3>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button 
          onClick={handleLogin} 
          style={styles.button}
          // Note: In React, true hover effects are usually done via CSS modules or styled-components, 
          // but for inline styles, we simulate a small visual change on click or focus for better UX.
          onMouseDown={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
          onMouseUp={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
        >
          Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  // 1. Centering the entire content
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9', // Light, professional background
  },
  
  // 2. Main Form Container
  container: {
    textAlign: "center",
    width: "350px", // Slightly wider for a better look
    padding: "30px 40px", // More internal padding
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)", // Stronger, modern shadow
  },

  // 3. Typography
  heading: { 
    color: "#1e3d59", // Dark blue/navy
    marginBottom: "8px", 
    fontSize: "20px",
  },
  subheading: { 
    color: "#6c757d", // Muted gray
    marginBottom: "30px", 
    fontSize: "16px",
    fontWeight: "400",
  },

  // 4. Input Fields
  input: {
    width: "100%",
    padding: "12px 15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: "16px",
    transition: 'border-color 0.2s',
  },

  // 5. Button (Primary Color)
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff", // Primary blue
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "17px",
    marginTop: "20px",
    fontWeight: "bold",
    transition: 'background-color 0.2s',
  },
  
  // Simulated hover state (for better accessibility)
  buttonHover: {
    backgroundColor: "#0056b3", // Darker blue on interaction
  }
};

export default Login;