import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content wrapper */}
      <main
        className={`
          flex-1 bg-gray-100 min-h-screen p-6 transition-all duration-300
          ${collapsed ? "ml-[85px]" : "ml-[210px]"}
          mt-14
        `}
      >
        <Navbar />
        
        {/* Page actual content */}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
