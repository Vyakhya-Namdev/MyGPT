import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "./api/auth";
import { AuthContext } from "./MyContext.jsx";

export default function Login({ darkMode }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const containerStyle = {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    background: darkMode ? "#000" : "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    transition: "background 0.3s",
  };

  const formStyle = {
    backgroundColor: darkMode ? "#111" : "#fff",
    borderRadius: 16,
    padding: "2.5rem 2rem",
    width: 320,
    maxWidth: "95vw",
    display: "flex",
    flexDirection: "column",
    gap: "1.4rem",
    color: darkMode ? "#eee" : "#222",
    alignItems: "center",
    border: "solid 1px #fff",
    boxShadow: "0 4px 12px #ccc"
  };

  const inputStyle = {
    backgroundColor: darkMode ? "#222" : "#fafafa",
    border: "1.5px solid #444",
    borderRadius: 12,
    color: darkMode ? "#eee" : "#222",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    width: "100%",
  };

  const buttonStyle = {
    backgroundColor: darkMode ? "#eee" : "#222",
    border: "none",
    color: darkMode ? "#222" : "#fff",
    fontWeight: 700,
    fontSize: "1.1rem",
    borderRadius: 12,
    padding: "0.8rem 0",
    cursor: "pointer",
    boxShadow: "0 4px 12px #ccc",
    marginTop: 4,
    width: "100%",
    transition: "background-color 0.3s",
  };

  const headingStyle = {
    fontWeight: 800,
    fontSize: "2rem",
    letterSpacing: "0.06em",
    textAlign: "center",
    color: darkMode ? "#fff" : "#222",
    marginBottom: 10,
  };

  const infoStyle = {
    textAlign: "center",
    color: darkMode ? "#bbb" : "#888",
    fontSize: "0.92rem",
    marginTop: 10,
  };

  const linkStyle = {
    color: darkMode ? "#eee" : "#222",
    textDecoration: "underline",
    marginLeft: 6,
    fontWeight: 500,
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      setUser(data);
      alert("Login successful!");
      navigate("/");
    } catch {
      alert("Login failed!");
    }
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleLogin}>
        <h2 style={headingStyle}>LOGIN</h2>
        <input
          type="email"
          placeholder="Email"
          autoComplete="username"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={buttonStyle}>
          Login
        </button>
        <div style={infoStyle}>
          Don't have an account?
          <Link to="/register" style={linkStyle}>
            {" "}
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}
