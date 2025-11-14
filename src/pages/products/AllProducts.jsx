import React, { useEffect, useState } from "react";
import axios from "axios";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://ecommerce-backend-y1bv.onrender.com/api/product");
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products");
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="ml-[270px] p-10 min-h-screen bg-gray-100">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        All Products
      </h1>

      {/* ERROR UI */}
      {error && (
        <div className="text-red-600 bg-red-100 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-full h-64 bg-gray-300 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      ) : (
        /* PRODUCT GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {products.length === 0 ? (
            <p className="text-gray-600 text-lg">No products found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* IMAGE */}
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />

                {/* CONTENT */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="text-gray-600 text-sm mb-3">
                    Brand: {product.brand}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-blue-900">
                      ₹{product.basePrice}
                    </span>

                    {product.discountPercentage > 0 && (
                      <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-md">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-3 text-sm font-medium ${
                      product.stock > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AllProducts;
