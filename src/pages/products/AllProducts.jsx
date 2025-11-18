// src/pages/products/AllProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaEye,
  FaTimes,
  FaSearch,
  FaStar,
} from "react-icons/fa";

/**
 * Premium Glassmorphism AllProducts page
 * Design: Glass + neon accents, Framer Motion animations
 *
 * Requirements:
 * - Tailwind CSS configured
 * - framer-motion installed
 *
 * Notes:
 * - Keeps same API endpoints and logic as your original file.
 */

const API_BASE = "https://ecommerce-backend-y1bv.onrender.com/api/product";

const DISCOUNT_RANGES = [
  { key: "", label: "All" },
  { key: "0-9", label: "0% - 9%" },
  { key: "10-19", label: "10% - 19%" },
  { key: "20-29", label: "20% - 29%" },
  { key: "30-39", label: "30% - 39%" },
  { key: "40-49", label: "40% - 49%" },
  { key: "50-59", label: "50% - 59%" },
  { key: "60-69", label: "60% - 69%" },
  { key: "70-79", label: "70% - 79%" },
  { key: "80+", label: "80%+" },
];

const shimmerVariants = {
  initial: { opacity: 0.6, scale: 1 },
  animate: { opacity: 1, scale: 1.02, transition: { yoyo: Infinity, duration: 1.2 } },
};

const modalBackdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalBox = {
  hidden: { y: 30, opacity: 0, scale: 0.98 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { y: 20, opacity: 0, scale: 0.98 },
};

const AllProducts = ({ sidebarOpen = true }) => {
  // data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [discountRange, setDiscountRange] = useState("");
  const [priceMax, setPriceMax] = useState(50000);
  const [stockFilter, setStockFilter] = useState("");
  const [sort, setSort] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // helpers
  const getDiscountValue = (p) =>
    typeof p.discountPercentage === "number"
      ? p.discountPercentage
      : typeof p.discount === "number"
      ? p.discount
      : 0;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const cats = Array.isArray(res?.data?.categories) ? res.data.categories : [];
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      const data = res?.data ?? [];
      const list = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
      setProducts(list);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  // Set main
  const handleSetMain = async (id) => {
    try {
      await axios.post(`${API_BASE}/${id}/set-main`);
      fetchProducts();
    } catch (err) {
      console.error("Set main failed", err);
      alert("Set main failed");
    }
  };

  // After save
  const handleSaved = (savedProduct) => {
    if (!savedProduct) {
      fetchProducts();
      return;
    }
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p._id === savedProduct._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedProduct;
        return copy;
      }
      return [savedProduct, ...prev];
    });
  };

  // Filtering & sorting
  const filtered = useMemo(() => {
    let data = [...products];

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(s) ||
          (p.description || "").toLowerCase().includes(s) ||
          (p.brand || "").toLowerCase().includes(s)
      );
    }

    if (category) data = data.filter((p) => p.category === category);
    if (subCategory) data = data.filter((p) => p.subcategory === subCategory);

    if (stockFilter === "in") data = data.filter((p) => Number(p.stock) > 0);
    else if (stockFilter === "out") data = data.filter((p) => Number(p.stock) === 0);

    data = data.filter((p) => {
      const price = Number(p.basePrice ?? p.price ?? 0);
      return price >= 0 && price <= Number(priceMax);
    });

    if (discountRange && discountRange !== "") {
      if (discountRange === "80+") data = data.filter((p) => getDiscountValue(p) >= 80);
      else {
        const [low, high] = discountRange.split("-").map((v) => Number(v));
        data = data.filter((p) => {
          const d = getDiscountValue(p);
          return d >= low && d <= high;
        });
      }
    }

    if (sort === "low-high") data.sort((a, b) => (a.basePrice ?? a.price ?? 0) - (b.basePrice ?? b.price ?? 0));
    else if (sort === "high-low") data.sort((a, b) => (b.basePrice ?? b.price ?? 0) - (a.basePrice ?? a.price ?? 0));
    else if (sort === "new") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === "discount") data.sort((a, b) => getDiscountValue(b) - getDiscountValue(a));

    return data;
  }, [products, search, category, subCategory, stockFilter, priceMax, discountRange, sort]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line
  }, [totalPages]);

  // subcategories helper
  const subcategoriesForSelected = useMemo(() => {
    const catObj = categories.find((c) => c.category === category);
    if (!catObj) return [];
    if (Array.isArray(catObj.subcategories)) return catObj.subcategories;
    return [];
  }, [categories, category]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setSubCategory("");
    setDiscountRange("");
    setPriceMax(50000);
    setStockFilter("");
    setSort("");
    setPage(1);
  };
   const navigate = useNavigate();

  return (
    <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-[260px]" : "ml-0"} bg-gradient-to-b from-[#f5f7fb] to-[#e8f0ff] py-10`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#062e57] drop-shadow-sm">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Premium management — modern UI with glass cards & neon accents.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm text-sm text-gray-700 hover:shadow"
              title="Reset filters"
            >
              Reset
            </button>

         <button
  onClick={() => navigate("/admin/products/add")}
  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5b8cff] to-[#6a2cff] text-white shadow-lg transform hover:-translate-y-0.5 transition"
  title="Add product"
>
  <FaPlus /> Add Product
</button>


          </div>
        </div>

        {/* Search + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/60 backdrop-blur-sm rounded-3xl p-3 border border-white/40 flex items-center gap-3 shadow-md">
              <FaSearch className="text-gray-500" />
              <input
                className="flex-1 outline-none text-sm bg-transparent placeholder-gray-600"
                placeholder="Search products, brands or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search ? (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-700" title="Clear search">
                  <FaTimes />
                </button>
              ) : null}
            </motion.div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-3 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/30 text-center shadow-sm">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-[#062e57]">{products.length}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/30 text-center shadow-sm">
              <div className="text-xs text-gray-500">Filtered</div>
              <div className="text-lg font-semibold text-[#062e57]">{filtered.length}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/30 text-center shadow-sm">
              <div className="text-xs text-gray-500">Showing</div>
              <div className="text-lg font-semibold text-[#062e57]">{paginated.length}</div>
            </div>
          </div>
        </div>

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white/50 backdrop-blur-md border border-white/30 rounded-3xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold mb-3 text-[#0a3a66]">Filters</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Category</label>
                    <select
                      className="w-full p-3 rounded-xl border bg-white/80 text-sm"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubCategory("");
                      }}
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Subcategory</label>
                    <select
                      className="w-full p-3 rounded-xl border bg-white/80 text-sm"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      disabled={!subcategoriesForSelected.length}
                    >
                      <option value="">All subcategories</option>
                      {subcategoriesForSelected.map((s, idx) => (
                        <option key={String(s) + idx} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Discount</label>
                    <select
                      className="w-full p-3 rounded-xl border bg-white/80 text-sm"
                      value={discountRange}
                      onChange={(e) => setDiscountRange(e.target.value)}
                    >
                      {DISCOUNT_RANGES.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Max price: <span className="font-medium">₹{priceMax}</span></label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="500"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Stock</label>
                    <select className="w-full p-3 rounded-xl border bg-white/80 text-sm" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                      <option value="">All</option>
                      <option value="in">In stock</option>
                      <option value="out">Out of stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Sort</label>
                    <select className="w-full p-3 rounded-xl border bg-white/80 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="">Relevance</option>
                      <option value="new">Newest</option>
                      <option value="low-high">Price: Low → High</option>
                      <option value="high-low">Price: High → Low</option>
                      <option value="discount">Highest Discount</option>
                    </select>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setPage(1)} className="flex-1 px-3 py-2 rounded-lg border bg-white/70 text-sm">Apply</button>
                    <button onClick={resetFilters} className="px-3 py-2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 text-sm">Reset</button>
                  </div>
                </div>
              </div>

              {/* quick chips */}
              <div className="mt-4">
                <div className="bg-white/40 backdrop-blur rounded-2xl p-4 border border-white/20 shadow">
                  <div className="text-xs text-gray-500 mb-2">Quick categories</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setCategory(""); setPage(1); }}
                      className={`px-3 py-1 text-sm rounded-full border ${category === "" ? "bg-gradient-to-r from-[#5b8cff] to-[#6a2cff] text-white" : "bg-white text-gray-700"}`}
                    >
                      All
                    </button>
                    {categories.slice(0, 8).map((c) => (
                      <button
                        key={c.category}
                        onClick={() => { setCategory(c.category); setPage(1); }}
                        className={`px-3 py-1 text-sm rounded-full border ${category === c.category ? "bg-gradient-to-r from-[#5b8cff] to-[#6a2cff] text-white" : "bg-white text-gray-700"}`}
                      >
                        {c.category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main className="lg:col-span-9">
            {error && <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-md mb-6">{error}</div>}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(limit)].map((_, i) => (
                  <motion.div key={i} variants={shimmerVariants} initial="initial" animate="animate" className="h-72 rounded-2xl bg-gradient-to-r from-white/60 to-white/40 animate-pulse" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">No products match your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginated.map((p) => {
                    const discountVal = getDiscountValue(p);
                    const price = Number(p.basePrice ?? p.price ?? 0);
                    const finalPrice = price - (price * (discountVal || 0)) / 100;

                    return (
                      <motion.article
                        key={p._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -6 }}
                        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/30 overflow-hidden"
                      >
                        <div className="relative group">
                          <img
                            src={p.images?.[0] || p.image || "/no-image.png"}
                            alt={p.name}
                            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* neon discount */}
                          {discountVal > 0 && (
                            <div className="absolute left-4 top-4 bg-gradient-to-r from-[#ff8a65] to-[#ff5252] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              {Math.round(discountVal)}% OFF
                            </div>
                          )}

                          <button
                            onClick={() => handleSetMain(p._id)}
                            className="absolute right-4 top-4 bg-white/90 p-2 rounded-full shadow"
                            title="Set as main"
                          >
                            <FaStar className="text-yellow-500" />
                          </button>
                        </div>

                        <div className="p-4 flex flex-col h-44">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#062e57] truncate">{p.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">{p.brand ?? "Brand —"}</p>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-[#062e57]">₹{finalPrice.toFixed(2)}</div>
                              {discountVal > 0 && <div className="text-xs text-gray-400 line-through">₹{price.toFixed(2)}</div>}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className={`text-sm font-medium ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                              {p.stock > 0 ? `In stock (${p.stock})` : "Out of stock"}
                            </div>

                            <div className="flex items-center gap-2">
                              <button onClick={() => setViewProduct(p)} className="p-2 rounded-md bg-gradient-to-r from-white to-white/80 text-[#0a3a66] hover:scale-105" title="View">
                                <FaEye />
                              </button>

                              <button onClick={() => setEditProduct(p)} className="p-2 rounded-md bg-gradient-to-r from-yellow-200 to-yellow-100 text-[#7a4f02] hover:scale-105" title="Edit">
                                <FaEdit />
                              </button>

                              <button onClick={() => handleDelete(p._id)} className="p-2 rounded-md bg-gradient-to-r from-red-100 to-red-50 text-red-700 hover:scale-105" title="Delete">
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-3 line-clamp-2">{p.description}</p>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                {/* pagination */}
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button className="px-4 py-2 rounded-full border bg-white/60" onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>
                    Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-2 rounded-full border ${page === i + 1 ? "bg-gradient-to-r from-[#5b8cff] to-[#6a2cff] text-white" : "bg-white/70"}`}>
                      {i + 1}
                    </button>
                  ))}

                  <button className="px-4 py-2 rounded-full border bg-white/60" onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages}>
                    Next
                  </button>
                </div>
              </>
            )}
          </main>
        </div>

        {/* VIEW MODAL */}
<AnimatePresence>
  {viewProduct && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      variants={modalBackdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setViewProduct(null)}
      />

      {/* modal box */}
      <motion.div
        className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl shadow-xl p-6"
        variants={modalBox}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {viewProduct.name}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{viewProduct.description}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/admin/products/view/${viewProduct._id}`)}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-[#5b8cff] to-[#6a2cff] text-white hover:scale-105 transition"
          >
            View Details
          </button>
          <button
            onClick={() => setViewProduct(null)}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:scale-105 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


        {/* ADD MODAL */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center" variants={modalBackdrop} initial="hidden" animate="visible" exit="exit">
              <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
              <motion.div className="relative w-full max-w-3xl mx-4" variants={modalBox} initial="hidden" animate="visible" exit="exit">
                <div className="bg-white rounded-3xl p-4 shadow-2xl border border-white/30">
                  <AddProduct
                    onSaved={(p) => {
                      handleSaved(p);
                      setShowAddModal(false);
                    }}
                    closeModal={() => setShowAddModal(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EDIT MODAL */}
        <AnimatePresence>
          {editProduct && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center" variants={modalBackdrop} initial="hidden" animate="visible" exit="exit">
              <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditProduct(null)} />
              <motion.div className="relative w-full max-w-3xl mx-4" variants={modalBox} initial="hidden" animate="visible" exit="exit">
                <div className="bg-white rounded-3xl p-4 shadow-2xl border border-white/30">
                 <EditProduct
            productId={editProduct._id}
            onUpdated={(updated) => { handleSaved(updated); setEditProduct(null); }}
            closeModal={() => setEditProduct(null)}
          />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AllProducts;
