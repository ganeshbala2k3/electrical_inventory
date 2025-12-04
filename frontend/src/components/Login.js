import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { port } from "./porturl";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Admin"); // Default role
    const navigate = useNavigate();

    // ✅ Updated handleLogin function
    const handleLogin = async () => {
        try {
            const response = await axios.post(`${port}login`, 
                { email, password, role },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                localStorage.setItem("user_id", response.data.user.id); // Store user_id
            localStorage.setItem("login_time", new Date().toISOString()); // Store login time
                alert(`Hello ${role.toUpperCase()}, successfully logged in!`);

                // ✅ Redirect based on role
                if (role === "Admin" ) {
                    navigate("/dash");
                }
                else if (role === "Manager") {
                    navigate("/managerdash"); // Redirect to Manager Dashboard
                } else if (role === "Staff") {
                    navigate("/staffdash"); // Redirect to Staff Dashboard
                } else if (role === "Issuer") {
                    navigate("/issuerdash"); // Redirect to Issuer Dashboard
                } 
            } else {
                alert(response.data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Invalid credentials or server error");
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

            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Issuer">Issuer</option>
            </select>

            <button onClick={handleLogin} style={styles.button}>Login</button>
        </div>
    );
};

// ✅ Inline Styles
const styles = {
    container: { textAlign: "center", width: "300px", margin: "100px auto", padding: "20px", borderRadius: "10px", backgroundColor: "#f9f9f9", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
    heading: { color: "#333", marginBottom: "10px" },
    subheading: { color: "#666", marginBottom: "20px" },
    input: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
    select: { width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px", backgroundColor: "#fff" },
    button: { width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", marginTop: "10px" }
};

export default Login;