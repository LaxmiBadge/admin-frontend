import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";

const ProductDetailsView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Product ID from URL:", id);

    if (!id) {
      setError("Invalid product ID in URL");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `https://ecommerce-backend-y1bv.onrender.com/api/product/${id}`,
          { timeout: 15000 }
        );

        console.log("Product Response:", res.data);
        setProduct(res.data);
      } catch (err) {
        console.error("API ERROR:", err.response?.data || err.message);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;
  if (!product) return <p className="p-10 text-center">No product found</p>;

  const imageSrc =
    product?.images?.length > 0 ? product.images[0] : "/no-image.png";

  return (
    <div className="p-6 bg-gray-100 min-h-screen ">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

          {/* IMAGE */}
          <div className="flex justify-center items-center">
            <img
              src={imageSrc}
              alt={product?.name}
              className="w-full max-h-80 object-cover rounded-lg shadow"
            />
          </div>

          {/* PRODUCT INFO */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product?.name}</h1>
            <p className="text-sm text-gray-600">
              {product?.brand || "Unknown"} • {product?.model || "N/A"}
            </p>

            {/* PRICING */}
            <div className="mt-4">
              <p className="text-3xl font-bold text-green-600">
                ₹{product?.basePrice}
              </p>

              {product?.mrp && (
                <p className="text-gray-500 line-through">₹{product.mrp}</p>
              )}

              {product?.discountPercentage > 0 && (
                <p className="text-blue-600 font-semibold">
                  {product.discountPercentage}% OFF
                </p>
              )}
            </div>

            {/* AVAILABILITY */}
            <p className="mt-4">
              {product?.availability === "In Stock" ? (
                <span className="text-green-600 font-semibold">
                  <FaCheckCircle className="inline mr-1" /> In Stock
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  <FaTimesCircle className="inline mr-1" /> Out of Stock
                </span>
              )}
            </p>

            {/* STOCK */}
            <p className="mt-1 text-gray-700">
              Stock Available: {product?.stock ?? "N/A"}
            </p>

            {/* SIZES */}
            {product?.sizes?.length > 0 && (
              <div className="mt-3">
                <p className="text-gray-700 font-semibold mb-1">Available Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="border-t p-6">
          <h2 className="text-xl font-bold text-gray-800">Description</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">
            {product?.description || "No description available."}
          </p>
        </div>

        {/* CATEGORY */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold text-gray-800">Category Details</h2>
          <ul className="mt-2 text-gray-700 list-disc list-inside">
            <li>Category: {product?.category || "N/A"}</li>
            <li>Sub Category: {product?.subCategory || "N/A"}</li>
            <li>Sub-Sub Category: {product?.subSubCategory || "N/A"}</li>
          </ul>
        </div>

        {/* WARRANTY */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold text-gray-800">Warranty</h2>
          <p>Type: {product?.warranty?.type || "No warranty"}</p>
          <p>Duration: {product?.warranty?.duration || "N/A"}</p>
        </div>

        {/* SHIPPING */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold text-gray-800">Shipping Details</h2>
          <p>Dimensions Unit: {product?.shipping?.dimensions?.unit || "N/A"}</p>
          <p>Shipping Charge: ₹{product?.shipping?.shippingCharge || 0}</p>
        </div>

        {/* SHARE ANALYTICS */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold">Share Analytics</h2>
          <p>Total Shares: {product?.share?.totalShares || 0}</p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4">
            {Object.entries(product?.share?.platformShares || {}).map(
              ([platform, count]) => (
                <div
                  key={platform}
                  className="text-center bg-gray-100 p-3 rounded-lg shadow-sm"
                >
                  <p className="font-semibold capitalize">{platform}</p>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

          {product?.reviews?.length > 0 ? (
            product.reviews.map((review, index) => (
              <div
                key={review?._id || index}
                className="bg-gray-50 p-4 rounded-lg mb-3 border"
              >
                <p className="font-semibold">{review?.name}</p>

                <p className="text-yellow-500">
                  {[...Array(review?.rating || 0)].map((_, i) => (
                    <FaStar key={i} className="inline" />
                  ))}
                </p>

                <p className="text-gray-700 mt-1">{review?.comment}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {review?.date
                    ? new Date(review.date).toLocaleString()
                    : "No date"}
                </p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>

        {/* META INFO */}
        <div className="border-t p-6 text-gray-600 text-sm">
          <p>Product ID: {product?._id}</p>
          <p>
            Created:{" "}
            {product?.createdAt
              ? new Date(product.createdAt).toLocaleString()
              : "N/A"}
          </p>
          <p>
            Updated:{" "}
            {product?.updatedAt
              ? new Date(product.updatedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsView;
