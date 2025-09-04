import { createContext, useContext, useState, useEffect } from "react";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [name, setName] = useState(localStorage.getItem("name") || "");

  const login = ({ token, role, name }) => {
    setToken(token); setRole(role); setName(name);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);
  };
  const logout = () => {
    setToken(""); setRole(""); setName("");
    localStorage.clear();
  };

  return (
    <AuthCtx.Provider value={{ token, role, name, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
