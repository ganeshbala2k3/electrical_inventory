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
      localStorage.setItem("user_role",res.data.user.role);
      localStorage.setItem("login_time", new Date().toISOString()); // Store login time
      alert(`Hello ${role.toUpperCase()}, successfully logged in!`);

      switch (role) {
        case "Admin":
          navigate("/dash");
          break;
        case "Manager":
          navigate("/managerdash");
          break;
        case "Staff":
          navigate("/staffdash");
          break;
        case "Issuer":
          navigate("/issuerdash");
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

      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    width: "300px",
    margin: "100px auto",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  heading: { color: "#333", marginBottom: "10px" },
  subheading: { color: "#666", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px"
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px"
  }
};

export default Login;
