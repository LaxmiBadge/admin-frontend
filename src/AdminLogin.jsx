import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";
import { motion } from "framer-motion";

function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ Fixed useEffect infinite loop
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token && window.location.pathname !== "/admin/dashboard") {
      navigate("/admin/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "https://ecommerce-backend-y1bv.onrender.com/api/user/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200 && res.data.accessToken) {
        localStorage.setItem("adminToken", res.data.accessToken);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Admin login failed:", error);
      setMessage("Invalid admin credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#002349] via-[#183d6b] to-[#0096FF] overflow-hidden">
      {/* Left Side Illustration Section */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex md:w-1/2 justify-center items-center relative text-white px-10"
      >
        <div className="space-y-6 z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-extrabold leading-tight drop-shadow-lg"
          >
            Welcome Back,
            <br /> <span className="text-[#00BFFF]">Admin!</span>
          </motion.h1>
          <p className="text-lg text-gray-200 max-w-md">
            Manage users, view analytics, and control your system — all in one
            secure dashboard.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://cdn.dribbble.com/users/1162077/screenshots/3848914/programmer.gif')] bg-cover bg-center opacity-20"></div>
      </motion.div>

      {/* Right Side Login Form */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex justify-center items-center bg-white md:rounded-l-[50px] shadow-2xl py-12 px-6 sm:px-10"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="p-4 bg-[#002349] text-white rounded-full text-3xl shadow-md"
              >
                <FaUserShield />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-[#002349]">
              Admin Login
            </h2>
            <p className="text-gray-500 mt-1">
              Access your admin control panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002349] focus:outline-none"
                placeholder="admin@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002349] focus:outline-none pr-10"
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-[#002349]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white text-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#002349] hover:bg-[#183d6b]"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* Error Message */}
          {message && (
            <p className="text-center text-red-600 font-medium mt-4">
              {message}
            </p>
          )}

          {/* Footer */}
          <p className="text-sm text-gray-400 text-center mt-8">
            © {new Date().getFullYear()} Secure Admin Portal | All Rights
            Reserved
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
