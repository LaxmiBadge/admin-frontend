import React from "react";
import { FaBell, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");

    navigate("/admin/login");
  };

  return (
    <nav className="bg-white shadow-sm w-full flex justify-between items-center px-4 py-3 rounded-xl mb-6 sticky top-0 z-40">
      
      {/* 🔍 Search bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full max-w-sm">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none px-2 text-sm w-full"
        />
      </div>

      {/* 🔔 Notifications + Profile + Logout */}
      <div className="flex items-center gap-6">
        
        {/* Notification */}
        <button className="relative text-gray-600 hover:text-gray-900">
          <FaBell size={18} />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <FaUserCircle size={28} className="text-gray-700" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">{adminName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>

        {/* 🚪 Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white text-sm px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
