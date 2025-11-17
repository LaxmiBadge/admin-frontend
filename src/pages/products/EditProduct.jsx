// src/pages/products/EditProduct.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const EditProduct = ({ productId, onUpdated, closeModal }) => {
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    category: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    axios
      .get(`https://ecommerce-backend-y1bv.onrender.com/api/product/${productId}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [productId]);

  // Update product field
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Save updated product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        product
      );

      onUpdated(res.data);
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative"
      >
        {/* Close Icon */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
        >
          <FaTimes size={22} />
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b pb-3">
          Edit Product
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="font-medium text-gray-700">Product Title</label>
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          {/* Price */}
          <div>
            <label className="font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
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
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              Update Product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProduct;
