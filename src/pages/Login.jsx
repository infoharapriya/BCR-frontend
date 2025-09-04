import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("Admin@123");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Save token + user info in context
      login(data); // store in AuthContext
      localStorage.setItem("token", data.token);

      alert("Login successful!");
      navigate("/"); // ✅ Redirect to Home
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: "40px auto" }}>
        <h2 style={{ color: "var(--brand)" }}>Login</h2>
        <p className="notice info">
          Use <b>admin@demo.com / Admin@123</b> after seeding (POST /api/auth/seed-admin)
        </p>
        {msg && <div className="notice error">{msg}</div>}
        <form onSubmit={handleLogin}>
          <label>Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" style={{ marginTop: 10 }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
