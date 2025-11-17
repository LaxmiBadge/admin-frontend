// src/components/Sidebar.jsx

import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },

    // ⭐ ONLY THIS PRODUCT BUTTON
    { name: "Products", icon: <FaBoxOpen />, path: "/admin/products/all" },

    { name: "Orders", icon: <FaShoppingCart />, path: "/admin/orders" },
    { name: "Customers", icon: <FaUsers />, path: "/admin/customers" },
    { name: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-[80px] left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg"
      >
        <FaBars size={20} />
      </button>

      {/* SIDEBAR */}
      <motion.div
        animate={{ width: open ? 260 : 85 }}
        className="h-screen bg-blue-950 text-white border-r border-blue-800 shadow-xl 
          fixed left-0 top-[72px] flex flex-col transition-all duration-300 z-40"
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
          <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center text-xl font-bold">
            A
          </div>

          {open && (
            <h1 className="text-2xl font-semibold tracking-wide">Admin Panel</h1>
          )}
        </div>

        {/* MENU LIST */}
        <div className="flex-1 flex flex-col mt-4 gap-2">
          {menus.map((menu, i) => {
            const active = location.pathname === menu.path;

            return (
              <div key={i}>
                <div
                  onClick={() => navigate(menu.path)}
                  className={`relative flex items-center gap-4 px-4 py-3 mx-3 rounded-xl cursor-pointer
                    transition-all duration-200 ${
                      active
                        ? "bg-blue-800 text-white shadow-lg"
                        : "text-blue-200 hover:bg-blue-900"
                    }`}
                >
                  {active && (
                    <div className="absolute left-0 h-full w-1 bg-blue-400 rounded-r-lg"></div>
                  )}

                  <span className="text-xl">{menu.icon}</span>

                  {open && (
                    <span className="text-sm font-medium tracking-wide">
                      {menu.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="mt-auto border-t border-blue-800 px-4 py-5">
          <div
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer 
              text-red-300 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            {open && <span className="text-sm font-medium">Logout</span>}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
