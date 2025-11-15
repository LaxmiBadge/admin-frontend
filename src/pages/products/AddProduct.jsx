import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { HexColorPicker } from "react-colorful";

const AddProduct = ({ onSaved, closeModal }) => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    expiryDate: new Date(),
    color: "#000000",
    image: null,
  });

  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "home", label: "Home" },
  ];

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setProduct({ ...product, image: URL.createObjectURL(e.target.files[0]) });
  };

  return (
    <div className="w-full flex justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-4xl p-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8">
          Add New Product
        </h2>

        {/* Form Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Product Name */}
          <div>
            <label className="font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter product name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="₹ Price"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Available stock"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-medium text-gray-700">Category</label>
            <Select
              options={categoryOptions}
              onChange={(val) =>
                setProduct({ ...product, category: val.value })
              }
              className="mt-2"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="font-medium text-gray-700">Expiry Date</label>
            <DatePicker
              selected={product.expiryDate}
              onChange={(date) => setProduct({ ...product, expiryDate: date })}
              className="mt-2 w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="font-medium text-gray-700">Product Color</label>
            <div className="mt-2 bg-gray-100 p-3 rounded-xl">
              <HexColorPicker
                color={product.color}
                onChange={(color) => setProduct({ ...product, color })}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="mt-2 w-full p-3 border rounded-xl"
            />

            {product.image && (
              <img
                src={product.image}
                alt="preview"
                className="mt-4 w-40 h-40 object-cover rounded-xl shadow"
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => onSaved(product)}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
