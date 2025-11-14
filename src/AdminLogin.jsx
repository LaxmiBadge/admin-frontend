import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        form
      );
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid login credentials");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-900 via-gray-900 to-black overflow-hidden relative">

      {/* LEFT SIDE - TITLE SECTION */}
      <div className="flex flex-col justify-center items-center px-12 py-20 text-white">
        
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-lg">
            Admin Portal
          </h1>

          <p className="text-gray-300 text-lg mt-4 max-w-md">
            Manage products, users, orders, reports, analytics and everything in one secure place.
          </p>

          {/* Decorative Line */}
          <div className="mt-6 h-1 w-32 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full shadow-lg"></div>
        </div>
      </div>

     {/* RIGHT SIDE LOGIN FORM */}
<div className="flex justify-center items-center p-8 md:p-16">

  <div className="relative w-full max-w-md rounded-3xl p-[2px]
      bg-gradient-to-br from-gray-900 via-blue-900 to-black shadow-xl">

    <div className="backdrop-blur-xl bg-gray-900/80 rounded-3xl p-10
        border border-blue-900/40 shadow-[0_0_25px_rgba(0,40,255,0.2)]
        hover:shadow-[0_0_45px_rgba(0,40,255,0.35)]
        transition-all duration-300">

      <h2 className="text-4xl font-extrabold text-white text-center mb-10 tracking-wide">
        Sign In
      </h2>

      <form onSubmit={handleLogin} className="space-y-7">

        {/* EMAIL */}
        <div className="group">
          <label className="text-gray-300 text-sm">Email Address</label>
          <input
            type="email"
            required
            className="w-full mt-2 px-4 py-3.5 rounded-xl bg-gray-900 text-white
            border border-blue-900/40
            group-hover:border-blue-600 transition-all duration-300
            focus:ring-2 focus:ring-blue-500 outline-none shadow-md"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* PASSWORD */}
        <div className="relative group">
          <label className="text-gray-300 text-sm">Password</label>

          <input
            type={showPassword ? 'text' : 'password'}
            required
            className="w-full mt-2 px-4 py-3.5 rounded-xl bg-gray-900 text-white
            border border-blue-900/40
            group-hover:border-blue-600 transition-all duration-300
            focus:ring-2 focus:ring-blue-500 outline-none shadow-md"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-12 text-gray-400 hover:text-white cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-blue-900
          text-white font-bold text-lg tracking-wide transition-all duration-300
          hover:bg-blue-800 hover:shadow-[0_0_25px_rgba(0,80,255,0.5)]
          hover:scale-[1.03]"
        >
          Login
        </button>
      </form>

      <p className="text-center text-gray-500 text-xs mt-10">
        © {new Date().getFullYear()} Admin Portal
      </p>
    </div>
  </div>
</div>


    </div>
  );
}

export default AdminLogin;
