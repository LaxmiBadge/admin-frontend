import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AddProduct from "./pages/products/AddProduct";
import AllProducts from "./pages/products/AllProducts";
import EditProduct from "./pages/products/EditProduct";
import ProductDetailsView from "./pages/products/ProductDetailsView";
import Logout from "./Logout";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// PUBLIC ROUTE
function PublicRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? <Navigate to="/admin/dashboard" replace /> : children;
}

// PRIVATE ROUTE
function PrivateRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/admin/login" replace />;
}

// LAYOUT
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/admin/login";

  return (
    <div className="flex">
      {!hideLayout && <Sidebar />}

      <div className={`flex-1 p-2 ${hideLayout ? "" : "ml-[40px]"}`}>
        {!hideLayout && <Navbar />}
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>

          {/* LOGIN */}
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ADD PRODUCT */}
          <Route
            path="/admin/products/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />

          {/* ALL PRODUCTS */}
          <Route
            path="/admin/products/all"
            element={
              <PrivateRoute>
                <AllProducts />
              </PrivateRoute>
            }
          />

          {/* EDIT PRODUCT */}
          <Route
            path="/admin/products/edit/:id"
            element={
              <PrivateRoute>
                <EditProduct />
              </PrivateRoute>
            }
          />

          {/* PRODUCT DETAILS — FIXED */}
          <Route
            path="/admin/products/view/:id"
            element={
              <PrivateRoute>
                <ProductDetailsView />
              </PrivateRoute>
            }
          />

          {/* LOGOUT */}
          <Route path="/logout" element={<Logout />} />

          {/* DEFAULT REDIRECT */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
