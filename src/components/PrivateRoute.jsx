import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { token, role } = useAuth();

  // Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If route requires a specific role
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
