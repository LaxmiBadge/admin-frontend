// src/pages/products/AddProduct.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HexColorPicker } from "react-colorful";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = "https://ecommerce-backend-y1bv.onrender.com/api/product";

const AddProduct = ({ initialData = null, onSaved, closeModal }) => {
  const [categories, setCategories] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    expiryDate: new Date(),
    color: "#3b82f6",
    image: null,
    imageFile: null,
    sizes: [],        // <-- Added Size Array
    customSize: ""    // <-- For custom user typed size
  });

  const sizeOptions = [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const cats = Array.isArray(res?.data?.categories)
        ? res.data.categories
        : [];

      const formatted = cats.map((c) => ({
        value: c.category,
        label: c.category,
      }));

      setCategories(formatted);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setProduct({
        name: initialData.name,
        price: initialData.price,
        stock: initialData.stock,
        category: initialData.category,
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate)
          : new Date(),
        color: initialData.color || "#3b82f6",
        image: initialData.image || null,
        imageFile: null,
        sizes: initialData.sizes || [],
        customSize: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProduct({
      ...product,
      imageFile: file,
      image: URL.createObjectURL(file),
    });
  };

  const handleSave = async () => {
    try {
      const finalSizes = [
        ...product.sizes,
        ...(product.customSize ? [product.customSize] : [])
      ];

      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("stock", product.stock);
      formData.append("category", product.category);
      formData.append("expiryDate", product.expiryDate);
      formData.append("color", product.color);
      formData.append("sizes", JSON.stringify(finalSizes)); // <-- Save Sizes

      if (product.imageFile) {
        formData.append("image", product.imageFile);
      }

      if (initialData) {
        await axios.put(`${API_BASE}/product/${initialData._id}`, formData);
      } else {
        await axios.post(`${API_BASE}/product`, formData);
      }

      onSaved();
    } catch (error) {
      console.log("Error saving product:", error);
    }
  };

  const inputBox =
    "p-4 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-end p-6"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl w-full max-w-4xl p-10 ml-auto">

        <h2 className="text-4xl font-bold text-blue-800 text-center mb-10 tracking-wide">
          {initialData ? "Update Product" : "Add New Product"}
        </h2>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Product Name */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className={inputBox}
              placeholder="Enter product name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className={inputBox}
              placeholder="Enter price"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Stock</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className={inputBox}
              placeholder="Available stock"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Category</label>
            <Select
              options={categories}
              value={categories.find((c) => c.value === product.category) || null}
              onChange={(val) =>
                setProduct({ ...product, category: val.value })
              }
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Available Sizes</label>
            <Select
              isMulti
              options={sizeOptions}
              value={sizeOptions.filter((s) => product.sizes.includes(s.value))}
              onChange={(selected) =>
                setProduct({
                  ...product,
                  sizes: selected.map((s) => s.value),
                })
              }
            />

            {/* Custom Size */}
            <input
              type="text"
              placeholder="Custom size (optional)"
              name="customSize"
              value={product.customSize}
              onChange={handleChange}
              className={`${inputBox} mt-3`}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Expiry Date</label>
            <DatePicker
              selected={product.expiryDate}
              onChange={(date) => setProduct({ ...product, expiryDate: date })}
              className={inputBox}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="font-semibold text-gray-700 mb-2 block">Product Color</label>
            <div className="rounded-xl bg-gray-100 p-4 shadow-inner">
              <HexColorPicker
                color={product.color}
                onChange={(color) => setProduct({ ...product, color })}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700 mb-2 block">Product Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              className={inputBox}
            />

            {product.image && (
              <img
                src={product.image}
                alt="preview"
                className="mt-4 w-56 h-56 rounded-2xl object-cover shadow-xl border border-gray-300"
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 mt-12">
          <button
            onClick={closeModal}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 shadow-md transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:opacity-90 transition"
          >
            {initialData ? "Save Changes" : "Add Product"}
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default AddProduct;
