import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

const AdminDashboard = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-16 md:ml-64 flex-1 bg-gray-100 min-h-screen p-6 transition-all duration-300">
        {/* ✅ Navbar */}
        

        {/* ✅ Dashboard Cards */}
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
    </div>
  );
};

export default AdminDashboard;   