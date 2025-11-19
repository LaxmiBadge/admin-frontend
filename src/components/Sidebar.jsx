import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const GOLD = "#E4C16F";

  const menus = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { label: "Products", icon: <FaBoxOpen />, path: "/admin/products/all" },
    { label: "Orders", icon: <FaShoppingCart />, path: "/admin/orders" },
    { label: "Customers", icon: <FaUsers />, path: "/admin/customers" },
    { label: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? "85px" : "260px" }}
        transition={{ duration: 0.3 }}
        className="
          hidden md:flex flex-col
          fixed top-16 left-0
          h-[calc(100vh-64px)]
          bg-blue-950/95 backdrop-blur-xl
          shadow-xl border-r border-[rgba(255,255,255,0.08)]
          py-6 z-40
          transition-all duration-300
        "
      >
       

        {/* MENU LIST */}
        <nav className="flex flex-col gap-2 mt-6 px-4">
          {menus.map((menu, i) => {
            const active = location.pathname === menu.path;

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(menu.path)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300
                  ${
                    active
                      ? "bg-white/10 border shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
                style={{
                  borderColor: active ? GOLD : "transparent",
                  color: active ? GOLD : "",
                }}
              >
                <span className="text-lg">{menu.icon}</span>
                {!collapsed && <span>{menu.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="
            mt-auto flex items-center gap-3 
            px-4 py-3 rounded-xl w-full transition-all
            text-red-300 hover:text-red-400 hover:bg-red-500/10
          "
        >
          <FaSignOutAlt />
          {!collapsed && "Logout"}
        </motion.button>
      </motion.aside>

      {/* MOBILE SIDEBAR */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: isOpen ? 0 : -260 }}
        transition={{ duration: 0.35 }}
        className="
          md:hidden fixed top-0 left-0
          h-full w-64 z-[110]
          bg-blue-950/95 backdrop-blur-xl shadow-2xl 
          px-7 py-10 rounded-r-3xl
        "
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* MENU LIST */}
        <nav className="flex flex-col gap-3 mt-10">
          {menus.map((menu, i) => {
            const active = location.pathname === menu.path;

            return (
              <button
                key={i}
                onClick={() => {
                  navigate(menu.path);
                  toggleSidebar();
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${
                    active
                      ? "bg-white/10 border"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
                style={{
                  borderColor: active ? GOLD : "transparent",
                  color: active ? GOLD : "",
                }}
              >
                <span className="text-lg">{menu.icon}</span>
                {menu.label}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => {
            handleLogout();
            toggleSidebar();
          }}
          className="
            mt-auto pt-10 flex items-center gap-3
            text-red-300 hover:text-red-400 hover:bg-red-500/10
            px-4 py-3 rounded-xl w-full
          "
        >
          <FaSignOutAlt />
          Logout
        </button>
      </motion.aside>

      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-[100]"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
