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
  FaPlus,
  FaEdit,
  FaList,
  FaTrash,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    {
      name: "Products",
      icon: <FaBoxOpen />,
      subMenu: true,
      subItems: [
        { name: "Add Product", icon: <FaPlus />, path: "/admin/products/add" },
        { name: "Update Product", icon: <FaEdit />, path: "/admin/products/update" },
        { name: "All Products", icon: <FaList />, path: "/admin/products/all" },
        { name: "Delete Product", icon: <FaTrash />, path: "/admin/products/delete" },
      ],
    },
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
        className="
          h-screen bg-blue-950 text-white border-r border-blue-800 shadow-xl 
          fixed left-0 top-[72px] flex flex-col transition-all duration-300 z-40
        "
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
                {/* MAIN MENU ITEM */}
                <div
                  onClick={() => menu.subMenu && setProductMenuOpen(!productMenuOpen)}
                  className={`relative flex items-center gap-4 px-4 py-3 mx-3 rounded-xl cursor-pointer
                    transition-all duration-200 ${
                      active
                        ? "bg-blue-800 text-white shadow-lg"
                        : "text-blue-200 hover:bg-blue-900"
                    }`}
                >
                  {/* ACTIVE INDICATOR */}
                  {active && (
                    <div className="absolute left-0 h-full w-1 bg-blue-400 rounded-r-lg"></div>
                  )}

                  <span className="text-xl">{menu.icon}</span>

                  {open && (
                    <span className="text-sm tracking-wide font-medium">
                      {menu.name}
                    </span>
                  )}
                </div>

                {/* SUBMENU */}
                {menu.subMenu && productMenuOpen && open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-10 mr-4 bg-blue-900 rounded-xl mt-1 overflow-hidden"
                  >
                    {menu.subItems.map((sub, index) => {
                      const subActive = location.pathname === sub.path;

                      return (
                        <Link key={index} to={sub.path}>
                          <div
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg my-1 cursor-pointer
                              transition-all ${
                                subActive
                                  ? "bg-blue-700 text-white"
                                  : "text-blue-200 hover:bg-blue-800"
                              }`}
                          >
                            <span className="text-md">{sub.icon}</span>
                            <span className="text-sm">{sub.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* LOGOUT BUTTON */}
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
