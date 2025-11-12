import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Logout from "./Logout";

// ✅ PublicRoute: Redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? <Navigate to="/admin/dashboard" replace /> : children;
}

// ✅ PrivateRoute: Redirects to login if not logged in
function PrivateRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Admin Login (Public Route) */}
        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />

        {/* ✅ Admin Dashboard (Protected Route) */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* ✅ Default route */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
