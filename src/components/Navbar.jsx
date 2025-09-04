import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { role, name, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="brand">Business Card Redear</div>
      <div>
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/history" className={location.pathname === "/history" ? "active" : ""}>History</Link>
        {role === "admin" && (
          <Link to="/admin/events" className={location.pathname === "/admin/events" ? "active" : ""}>Events</Link>
        )}
        {token ? (
          <button className="btn secondary" style={{ marginLeft: 12 }} onClick={() => { logout(); navigate("/login"); }}>
            Logout {name ? `(${name})` : ""}
          </button>
        ) : (
          <Link to="/login" style={{ marginLeft: 12 }}>Login</Link>
        )}
      </div>
    </div>
  );
}
