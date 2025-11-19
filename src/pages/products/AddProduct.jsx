// src/pages/products/AddProduct.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HexColorPicker } from "react-colorful";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = "https://ecommerce-backend-y1bv.onrender.com/api/product";

const sizeOptions = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

const inputBox =
  "p-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none";

const AddProduct = ({ initialData = null, onSaved = () => {}, closeModal = () => {} }) => {
  const [categories, setCategories] = useState([]);
  const [subcategoriesForSelected, setSubcategoriesForSelected] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    model: "",
    description: "",
    basePrice: "",
    mrp: "",
    discountPercentage: 0,
    currency: "INR",
    availability: "In Stock",
    category: "",
    subCategory: "",
    subSubCategory: "",
    sizes: [],
    warranty: { type: "", duration: "" },
    shipping: {
      weight: "",
      dimensions: { length: "", width: "", height: "", unit: "cm" },
      deliveryTime: "",
      returnPolicy: "",
      shippingCharge: 0,
    },
    stock: 0,
    isMain: false,
    variants: [], // array of variant object ids (strings)
    reviews: [], // not set here
    share: {},
    views: 0,
    images: [], // existing image URLs (for edit)
    imageFiles: [], // File objects for upload
    videos: [], // existing video URLs
    videoFiles: [], // File objects for upload
    expiryDate: null,
    color: "#3b82f6",
  });

  // Local UI state for previews & file inputs
  const [imagePreviews, setImagePreviews] = useState([]); // urls
  const [videoPreviews, setVideoPreviews] = useState([]); // urls
  const [customSize, setCustomSize] = useState("");

  // Fetch categories (assume endpoint returns { categories: [{category, subcategories: []}, ...] })
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axios.get(`${API_BASE}/categories`);
      const cats = Array.isArray(res?.data?.categories) ? res.data.categories : [];
      setCategories(
        cats.map((c) => ({
          value: c.category,
          label: c.category,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
        }))
      );
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // If initialData provided (edit mode), populate form
  useEffect(() => {
    if (!initialData) return;
    setProduct((prev) => ({
      ...prev,
      name: initialData.name ?? prev.name,
      brand: initialData.brand ?? prev.brand,
      model: initialData.model ?? prev.model,
      description: initialData.description ?? prev.description,
      basePrice: initialData.basePrice ?? prev.basePrice,
      mrp: initialData.mrp ?? prev.mrp,
      discountPercentage: initialData.discountPercentage ?? prev.discountPercentage,
      currency: initialData.currency ?? prev.currency,
      availability: initialData.availability ?? prev.availability,
      category: initialData.category ?? prev.category,
      subCategory: initialData.subCategory ?? prev.subCategory,
      subSubCategory: initialData.subSubCategory ?? prev.subSubCategory,
      sizes: Array.isArray(initialData.sizes) ? initialData.sizes : prev.sizes,
      warranty: initialData.warranty ?? prev.warranty,
      shipping: initialData.shipping ?? prev.shipping,
      stock: initialData.stock ?? prev.stock,
      isMain: initialData.isMain ?? prev.isMain,
      variants: Array.isArray(initialData.variants) ? initialData.variants : prev.variants,
      images: Array.isArray(initialData.images) ? initialData.images : [],
      videos: Array.isArray(initialData.videos) ? initialData.videos : [],
      expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate) : prev.expiryDate,
      color: initialData.color ?? prev.color,
      views: initialData.views ?? prev.views,
    }));

    // initial previews
    setImagePreviews(Array.isArray(initialData.images) ? initialData.images : []);
    setVideoPreviews(Array.isArray(initialData.videos) ? initialData.videos : []);
  }, [initialData]);

  // Update subcategories when category changes
  useEffect(() => {
    const selected = categories.find((c) => c.value === product.category);
    setSubcategoriesForSelected(selected?.subcategories ?? []);
    // if current subCategory not present in new list, clear it
    if (product.subCategory && !selected?.subcategories?.includes(product.subCategory)) {
      setProduct((p) => ({ ...p, subCategory: "", subSubCategory: "" }));
    }
  }, [product.category, categories]);

  // Generic change for top-level fields
  const setField = (key, value) => {
    setProduct((p) => ({ ...p, [key]: value }));
  };

  // Nested updates
  const setWarrantyField = (key, value) => {
    setProduct((p) => ({ ...p, warranty: { ...p.warranty, [key]: value } }));
  };
  const setShippingField = (key, value) => {
    setProduct((p) => ({ ...p, shipping: { ...p.shipping, [key]: value } }));
  };
  const setShippingDimension = (key, value) => {
    setProduct((p) => ({ ...p, shipping: { ...p.shipping, dimensions: { ...p.shipping.dimensions, [key]: value } } }));
  };

  // Handle selecting multiple image files
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // append to existing imageFiles
    setProduct((p) => ({ ...p, imageFiles: [...(p.imageFiles || []), ...files] }));
    // previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...urls]);
  };

  // Remove preview image at index (also remove corresponding file if present)
  const removeImageAt = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setProduct((p) => {
      const newFiles = (p.imageFiles || []).slice();
      if (index < newFiles.length) {
        newFiles.splice(index, 1);
      }
      // If initial images were present and previews include them, handle deletion by removing from p.images as well
      const newExisting = (p.images || []).slice();
      if (index >= (p.imageFiles || []).length && index - (p.imageFiles || []).length < newExisting.length) {
        newExisting.splice(index - (p.imageFiles || []).length, 1);
      }
      return { ...p, imageFiles: newFiles, images: newExisting };
    });
  };

  // Videos
  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setProduct((p) => ({ ...p, videoFiles: [...(p.videoFiles || []), ...files] }));
    const urls = files.map((f) => URL.createObjectURL(f));
    setVideoPreviews((prev) => [...prev, ...urls]);
  };
  const removeVideoAt = (index) => {
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    setProduct((p) => {
      const newFiles = (p.videoFiles || []).slice();
      if (index < newFiles.length) newFiles.splice(index, 1);
      const newExisting = (p.videos || []).slice();
      if (index >= (p.videoFiles || []).length && index - (p.videoFiles || []).length < newExisting.length) {
        newExisting.splice(index - (p.videoFiles || []).length, 1);
      }
      return { ...p, videoFiles: newFiles, videos: newExisting };
    });
  };

  // Add custom size
  const addCustomSize = () => {
    if (!customSize || product.sizes.includes(customSize)) return;
    setProduct((p) => ({ ...p, sizes: [...p.sizes, customSize] }));
    setCustomSize("");
  };

  // Remove size
  const removeSize = (s) => {
    setProduct((p) => ({ ...p, sizes: p.sizes.filter((x) => x !== s) }));
  };

  // Save handler - sends multipart form-data
  const handleSave = async () => {
    try {
      const fd = new FormData();

      // Primitive fields
      fd.append("name", product.name);
      fd.append("brand", product.brand);
      fd.append("model", product.model);
      fd.append("description", product.description || "");
      fd.append("basePrice", String(product.basePrice ?? ""));
      fd.append("mrp", String(product.mrp ?? ""));
      fd.append("discountPercentage", String(product.discountPercentage ?? 0));
      fd.append("currency", product.currency || "INR");
      fd.append("availability", product.availability || "In Stock");
      fd.append("category", product.category || "");
      fd.append("subCategory", product.subCategory || "");
      fd.append("subSubCategory", product.subSubCategory || "");
      fd.append("stock", String(product.stock ?? 0));
      fd.append("isMain", product.isMain ? "true" : "false");
      fd.append("views", String(product.views ?? 0));
      if (product.expiryDate) fd.append("expiryDate", product.expiryDate.toISOString());
      fd.append("color", product.color || "#3b82f6");

      // arrays / nested - sizes as JSON string
      fd.append("sizes", JSON.stringify(product.sizes || []));
      fd.append("variants", JSON.stringify(product.variants || []));

      // warranty and shipping as JSON (backend should parse)
      fd.append("warranty", JSON.stringify(product.warranty || {}));
      fd.append("shipping", JSON.stringify(product.shipping || {}));

      // existing image URLs (if editing) - send as JSON so backend can keep them
      if (product.images && product.images.length > 0) {
        fd.append("existingImages", JSON.stringify(product.images));
      }
      if (product.videos && product.videos.length > 0) {
        fd.append("existingVideos", JSON.stringify(product.videos));
      }

      // append new image files
      if (product.imageFiles && product.imageFiles.length > 0) {
        product.imageFiles.forEach((file) => {
          fd.append("images", file);
        });
      }

      // append new video files
      if (product.videoFiles && product.videoFiles.length > 0) {
        product.videoFiles.forEach((file) => {
          fd.append("videos", file);
        });
      }

      // POST or PUT
      let res;
      if (initialData && initialData._id) {
        res = await axios.put(`${API_BASE}/${initialData._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(API_BASE, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // success; pass saved product to parent if desired
      onSaved(res?.data ?? null);
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err.message);
      alert("Failed to save product. See console for details.");
    }
  };

  return (
     <AdminLayout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center p-4 sm:p-6 ">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl w-full max-w-6xl p-8 mt-16">

        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1A3A] text-center mb-8">
          {initialData ? "Update Product" : "Add New Product"}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Name */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Product Name</label>
              <input type="text" className={inputBox} value={product.name} onChange={(e) => setField("name", e.target.value)} placeholder="Enter product name" />
            </div>

            {/* Brand */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Brand</label>
              <input type="text" className={inputBox} value={product.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Brand (optional)" />
            </div>

            {/* Model */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Model</label>
              <input type="text" className={inputBox} value={product.model} onChange={(e) => setField("model", e.target.value)} placeholder="Model (optional)" />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="font-semibold text-gray-700 mb-2 block">Description</label>
              <textarea className={`${inputBox} min-h-[120px]`} value={product.description} onChange={(e) => setField("description", e.target.value)} placeholder="Detailed description" />
            </div>

            {/* Prices: basePrice, mrp, discount */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Base Price (₹)</label>
                <input type="number" className={inputBox} value={product.basePrice} onChange={(e) => setField("basePrice", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">MRP (₹)</label>
                <input type="number" className={inputBox} value={product.mrp} onChange={(e) => setField("mrp", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Discount %</label>
                <input type="number" className={inputBox} value={product.discountPercentage} onChange={(e) => setField("discountPercentage", e.target.value)} />
              </div>
            </div>

            {/* currency & availability */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Currency</label>
                <input type="text" className={inputBox} value={product.currency} onChange={(e) => setField("currency", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Availability</label>
                <select className={inputBox} value={product.availability} onChange={(e) => setField("availability", e.target.value)}>
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                  <option>Preorder</option>
                  <option>Backorder</option>
                </select>
              </div>
            </div>

            {/* Stock & isMain */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Stock</label>
                <input type="number" className={inputBox} value={product.stock} onChange={(e) => setField("stock", e.target.value)} />
              </div>

              <div>
                <label className="inline-flex items-center gap-2 mt-4">
                  <input type="checkbox" checked={product.isMain} onChange={(e) => setField("isMain", e.target.checked)} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">Mark as Featured</span>
                </label>
              </div>
            </div>

            {/* Category selects */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Category</label>
              <Select
                options={categories.map((c) => ({ value: c.value, label: c.label, subcategories: c.subcategories }))}
                value={categories.find((c) => c.value === product.category) ? { value: product.category, label: product.category } : null}
                onChange={(val) => {
                  setField("category", val?.value ?? "");
                  // find original object to set subcategories
                  const found = categories.find((c) => c.value === (val?.value ?? ""));
                  setSubcategoriesForSelected(found?.subcategories ?? []);
                  setField("subCategory", "");
                  setField("subSubCategory", "");
                }}
                isClearable
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Sub Category</label>
                <select className={inputBox} value={product.subCategory} onChange={(e) => setField("subCategory", e.target.value)}>
                  <option value="">Select subcategory</option>
                  {subcategoriesForSelected.map((s, idx) => (
                    <option key={idx} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Sub-Sub Category</label>
                <input type="text" className={inputBox} value={product.subSubCategory} onChange={(e) => setField("subSubCategory", e.target.value)} placeholder="Optional" />
              </div>
            </div>

            {/* Sizes multi-select + custom */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Sizes</label>
              <Select
                options={sizeOptions}
                isMulti
                value={sizeOptions.filter((s) => product.sizes.includes(s.value))}
                onChange={(selected) => setField("sizes", selected.map((s) => s.value))}
              />
              <div className="flex gap-2 mt-3">
                <input type="text" className={`${inputBox} flex-1`} placeholder="Add custom size (e.g., 2XL or 30)" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
                <button onClick={addCustomSize} type="button" className="px-4 py-2 bg-[#0A1A3A] text-white rounded-xl">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(product.sizes || []).map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-sm inline-flex items-center gap-2">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} className="text-xs text-red-500 ml-1">x</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors + Expiry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Color</label>
                <div className="rounded-xl bg-gray-100 p-3">
                  <HexColorPicker color={product.color} onChange={(c) => setField("color", c)} />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Expiry Date</label>
                <DatePicker selected={product.expiryDate} onChange={(d) => setField("expiryDate", d)} className={inputBox} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">

            {/* Warranty */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Warranty</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Type (e.g., Manufacturer)" className={inputBox} value={product.warranty.type} onChange={(e) => setWarrantyField("type", e.target.value)} />
                <input type="text" placeholder="Duration (e.g., 1 year)" className={inputBox} value={product.warranty.duration} onChange={(e) => setWarrantyField("duration", e.target.value)} />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Shipping</label>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Weight (e.g., 0.5kg)" className={inputBox} value={product.shipping.weight} onChange={(e) => setShippingField("weight", e.target.value)} />
                <input type="text" placeholder="Delivery Time (e.g., 3-5 days)" className={inputBox} value={product.shipping.deliveryTime} onChange={(e) => setShippingField("deliveryTime", e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 items-end">
                <input type="number" placeholder="Length" className={inputBox} value={product.shipping.dimensions.length} onChange={(e) => setShippingDimension("length", e.target.value)} />
                <input type="number" placeholder="Width" className={inputBox} value={product.shipping.dimensions.width} onChange={(e) => setShippingDimension("width", e.target.value)} />
                <input type="number" placeholder="Height" className={inputBox} value={product.shipping.dimensions.height} onChange={(e) => setShippingDimension("height", e.target.value)} />
              </div>

              <div className="flex gap-3 mt-3">
                <input type="text" placeholder="Dimension unit (cm/in)" className={inputBox} value={product.shipping.dimensions.unit} onChange={(e) => setShippingDimension("unit", e.target.value)} />
                <input type="number" placeholder="Shipping charge (₹)" className={inputBox} value={product.shipping.shippingCharge} onChange={(e) => setShippingField("shippingCharge", e.target.value)} />
              </div>

              <textarea placeholder="Return policy (optional)" className={`${inputBox} mt-3`} value={product.shipping.returnPolicy} onChange={(e) => setShippingField("returnPolicy", e.target.value)} />
            </div>

            {/* Variants (IDs) */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Variants (IDs comma separated)</label>
              <input type="text" className={inputBox} value={(product.variants || []).join(",")} onChange={(e) => setField("variants", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="variantId1, variantId2" />
            </div>

            {/* Images upload */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Product Images (multiple)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border">
                    <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImageAt(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 shadow">x</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos upload */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Product Videos (optional)</label>
              <input type="file" accept="video/*" multiple onChange={handleVideosChange} />
              <div className="flex flex-wrap gap-3 mt-3">
                {videoPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-36 h-24 rounded-md overflow-hidden border">
                    <video src={src} controls className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeVideoAt(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 shadow">x</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Views */}
            <div>
              <label className="font-semibold text-gray-700 mb-2 block">Views</label>
              <input type="number" className={inputBox} value={product.views} onChange={(e) => setField("views", e.target.value)} />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button type="button" onClick={closeModal} className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button type="button" onClick={handleSave} className="px-6 py-2 rounded-xl bg-[#0A1A3A] text-white">Save Product</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </AdminLayout>
  );
};

export default AddProduct;
