// src/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-backend-y1bv.onrender.com/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, [navigate]);

  const goToLogoutPage = () => {
    navigate("/logout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-blue-950 text-white py-5 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
            Admin Dashboard
          </h1>
          <button
            onClick={goToLogoutPage}
            className="bg-white text-blue-950 font-semibold px-5 py-2 rounded-md hover:bg-blue-100 hover:scale-105 transition-transform duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-grow container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-8 text-blue-950">
          Welcome Back, Admin 👋
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-xl border border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-950">
              Total Users
            </h3>
            <p className="text-4xl font-bold mt-3 text-blue-950">
              {stats.totalUsers || 0}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-xl border border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-950">
              Total Orders
            </h3>
            <p className="text-4xl font-bold mt-3 text-blue-950">
              {stats.totalOrders || 0}
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-xl border border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-950">
              Total Revenue
            </h3>
            <p className="text-4xl font-bold mt-3 text-blue-950">
              ₹{stats.totalRevenue || 0}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-4 text-center text-sm mt-auto">
        © 2025 Secure Admin Portal | All Rights Reserved
      </footer>
    </div>
  );
}

export default AdminDashboard;
