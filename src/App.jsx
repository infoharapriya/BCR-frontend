// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import { AuthProvider, useAuth } from "./context/AuthContext";

// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import History from "./pages/History";
// import Edit from "./pages/Edit";
// import AdminEvents from "./pages/AdminEvents";

// function Protected({ children }) {
//   const { token } = useAuth();
//   if (!token) return <Navigate to="/login" replace />;
//   return children;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Navbar />
//         <Routes>
//           <Route path="/login" element={<Login />} />

//           <Route path="/" element={<Protected><Home /></Protected>} />
//           <Route path="/history" element={<Protected><History /></Protected>} />
//           <Route path="/edit/:id" element={<Protected><Edit /></Protected>} />
//           <Route path="/admin/events" element={<Protected><AdminEvents /></Protected>} />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import History from "./pages/History";
import Edit from "./pages/Edit";
import AdminEvents from "./pages/AdminEvents";

// ✅ Protected route wrapper
function Protected({ children, roles }) {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ✅ Layout wrapper (to hide Navbar when logged out)
function Layout({ children }) {
  const { token } = useAuth();
  return (
    <>
      {token && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<Protected><Home /></Protected>} />
            <Route path="/history" element={<Protected><History /></Protected>} />
            <Route path="/edit/:id" element={<Protected><Edit /></Protected>} />
            <Route
              path="/admin/events"
              element={<Protected roles={["admin"]}><AdminEvents /></Protected>}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
