import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AddProduct from "./pages/products/AddProduct";
import AllProducts from "./pages/products/AllProducts";
import Logout from "./Logout";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// PublicRoute: Redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? <Navigate to="/admin/dashboard" replace /> : children;
}

// PrivateRoute: Redirects to login if not logged in
function PrivateRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/admin/login" replace />;
}

// Layout wraps pages and conditionally shows Sidebar & Navbar
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/admin/login";

  return (
    <div className="flex">
      {!hideLayout && <Sidebar />}

      <div className={`flex-1 ${!hideLayout ? "ml-[10px]" : ""} p-2`}>
        {!hideLayout && <Navbar />}
        {children} {/* Render actual page content */}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/products/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/products/all"
            element={
              <PrivateRoute>
                <AllProducts />
              </PrivateRoute>
            }
          />

          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
