// src/pages/products/EditProduct.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
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

  // Fetch product
  useEffect(() => {
    axios
      .get(
        `https://ecommerce-backend-y1bv.onrender.com/api/product/${productId}`
      )
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [productId]);

  // Handle input
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Submit
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
    <AdminLayout>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

        {/* MODAL */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="
            w-full max-w-2xl bg-white rounded-3xl shadow-2xl 
            border border-gray-200 px-8 py-10 relative
          "
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={18} className="text-gray-500" />
          </button>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
            Edit Product
          </h2>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Inputs */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Product Title</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Stock</label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-gray-600 font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none
                "
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-gray-600 font-medium">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="4"
                className="
                  w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none resize-none
                "
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 md:col-span-2 mt-4">

              <button
                onClick={closeModal}
                type="button"
                className="
                  px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 
                  hover:bg-gray-100 transition
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  px-6 py-2.5 rounded-xl text-white bg-blue-600 
                  hover:bg-blue-700 transition shadow-md
                "
              >
                Update Product
              </button>

            </div>

          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
