import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <main
        className={`
          flex-1 bg-gray-100 min-h-screen p-6 transition-all duration-300
          ${collapsed ? "ml-[85px]" : "ml-[210px]"}
          mt-14
        `}
      >
        <Navbar />

        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-medium">Total Orders</h2>
            <p className="text-2xl font-bold text-blue-600 mt-2">1,240</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-medium">Total Customers</h2>
            <p className="text-2xl font-bold text-green-600 mt-2">560</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-medium">Revenue</h2>
            <p className="text-2xl font-bold text-yellow-600 mt-2">$34,200</p>
          </div>
        </div>
      </main>

      {/* MOBILE VIEW */}
      <main className="block md:hidden w-full bg-gray-100 p-5 min-h-screen mt-20">
        <Navbar />
        <h1 className="text-xl font-semibold mb-4">Dashboard Overview</h1>
      </main>
    </div>
  );
};

export default AdminDashboard;
