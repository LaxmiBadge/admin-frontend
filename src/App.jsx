import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Logout from "./Logout";

function App() {
  const adminToken = localStorage.getItem("adminToken");

  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard (Protected Route) */}
        <Route
          path="/admin/dashboard"
          element={
            adminToken ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
          <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
