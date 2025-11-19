import React, { useState, useEffect } from "react";
import { FaBell, FaSearch, FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const GOLD = "#E4C16F"; // Golden accent color

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

  // Close dropdown on clicking outside
  useEffect(() => {
    const handler = () => setDropdownOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <nav
      className="w-full fixed top-0 left-0 z-50 px-4 py-3
        shadow-lg flex justify-between items-center
        bg-gradient-to-r from-blue-950/95 via-blue-950/95 to-blue-950/95
        backdrop-blur-xl border-b border-white/20"
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className="md:hidden text-white p-2 bg-white/10 rounded-lg 
            hover:bg-white/20 transition"
        >
          <FaBars size={20} />
        </button>

        {/* LOGO / NAME */}
        <h1 className="text-white font-semibold text-lg md:text-xl tracking-wide drop-shadow">
          Admin Dashboard
        </h1>
      </div>

      {/* SEARCH BAR (Desktop Only) */}
      <div
        className="hidden md:flex items-center bg-white/10 border border-white/20
          rounded-xl px-4 py-2 w-full max-w-md shadow-inner"
      >
        <FaSearch className="text-gold-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent outline-none px-3 text-sm text-white placeholder-gold-400 w-full"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <button className="relative text-white hover:text-gold-400 transition">
          <FaBell size={22} className="drop-shadow" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-2 text-white"
          >
            <FaUserCircle size={32} className="drop-shadow text-gold-400" />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-sm font-semibold">{adminName}</p>
              <p className="text-xs text-gold-300">Administrator</p>
            </div>
          </button>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-44 bg-white/95 shadow-xl
                rounded-xl overflow-hidden backdrop-blur-xl animate-slideDown"
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600
                  hover:bg-red-50 transition font-medium"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      <div
        className="flex md:hidden fixed right-4 top-[60px] bg-white/10
          border border-white/20 rounded-xl px-3 py-2 w-48 shadow-inner z-50"
      >
        <FaSearch className="text-gold-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none px-2 text-sm text-white placeholder-gold-400 w-full"
        />
      </div>
    </nav>
  );
};

export default Navbar;
