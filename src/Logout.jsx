// src/Logout.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa";

function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");
    if (!confirmLogout) return;

    setLoading(true);
    setMessage("");

    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("accessToken");

      const isAdmin = !!localStorage.getItem("adminToken");

      if (!token) {
        clearStorageAndRedirect(isAdmin);
        return;
      }

      // ✅ API call to backend logout endpoint
      await axios.post(
        "https://ecommerce-backend-y1bv.onrender.com/api/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearStorageAndRedirect(isAdmin, "Successfully logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage("Couldn't reach the server — logging out locally.");
      clearStorageAndRedirect(
        localStorage.getItem("adminToken") ? true : false
      );
    } finally {
      setLoading(false);
    }
  };

  const clearStorageAndRedirect = (isAdmin, msg = "") => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    if (msg) setMessage(msg);

    // ✅ Redirect after 1 second
    setTimeout(() => {
      navigate(isAdmin ? "/admin/login" : "/login");
    }, 1000);
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white shadow-md rounded-lg p-8 w-[350px] text-center">
        <FaSignOutAlt className="text-4xl text-blue-950 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Ready to Sign Out?
        </h2>
        <p className="text-gray-500 mb-6">
          Click below to securely log out of your account.
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-950 hover:bg-blue-800"
          }`}
        >
          {loading ? "Signing out..." : "Sign Out"}
        </motion.button>

        {message && (
          <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
        )}
      </div>
    </motion.div>
  );
}

export default Logout;
