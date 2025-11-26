// src/pages/products/EditProduct.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaTimes, FaCheck, FaUpload, FaTrash, FaImage, FaPalette, FaCalendarAlt } from "react-icons/fa";
import { HexColorPicker } from "react-colorful";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Local preview image path (your environment will convert sandbox path to a URL)
 * Developer note: this file path is available from the uploaded assets in the environment.
 */
const UPLOADED_PREVIEW = "sandbox:/mnt/data/63d9e435-aa61-4697-93d2-fc189c67db23.png";

/** API base */
const API_BASE_PRODUCT = "https://ecommerce-backend-y1bv.onrender.com/api/product";

/* ---------- tiny presentational components ---------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md border ${className}`}>{children}</div>
);
const SectionHeader = ({ title, subtitle, color = "from-indigo-500 to-purple-600" }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className={`w-1.5 h-10 rounded-md bg-gradient-to-b ${color}`} />
    <div>
      <div className="text-lg font-semibold text-gray-800">{title}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  </div>
);
const Label = ({ children }) => <label className="block text-sm font-medium text-gray-700 mb-2">{children}</label>;
const Input = (props) => (
  <input
    {...props}
    className={`w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${props.className || ""}`}
  />
);
const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full border border-gray-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${props.className || ""}`}
  />
);

/* ---------- SizeSelector component ---------- */
function SizeSelector({ mode, selectedSizes = [], onToggle }) {
  const shoeSizes = ["5", "6", "7", "8", "9", "10", "11", "12"];
  const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const base = "w-14 h-12 flex items-center justify-center rounded-lg border text-sm font-semibold cursor-pointer select-none transition-all";
  const selectedClass = "bg-amber-500 text-white border-amber-600 shadow-lg";
  const unselectedClass = "bg-white text-gray-700 border-gray-200 hover:scale-[1.03]";

  if (mode === "shoes") {
    return (
      <>
        <div className="text-sm text-gray-500 mb-3">Tap to select one or more shoe sizes</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {shoeSizes.map((s) => {
            const sel = selectedSizes.includes(s);
            return (
              <button key={s} type="button" onClick={() => onToggle(s)} className={`${base} ${sel ? selectedClass : unselectedClass}`} aria-pressed={sel}>
                <span>{s}</span>
                {sel && <FaCheck className="ml-2 w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  if (mode === "clothing") {
    return (
      <>
        <div className="text-sm text-gray-500 mb-3">Tap to select one or more clothing sizes</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {clothingSizes.map((s) => {
            const sel = selectedSizes.includes(s);
            return (
              <button key={s} type="button" onClick={() => onToggle(s)} className={`${base} ${sel ? selectedClass : unselectedClass}`} aria-pressed={sel}>
                <span>{s}</span>
                {sel && <FaCheck className="ml-2 w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-sm text-gray-500 mb-3">Enter sizes as comma separated values (e.g. 32, 34, Free Size)</div>
      <Input placeholder="Sizes (comma separated)" onChange={(e) => onToggle(e.target.value)} />
    </>
  );
}

/* ---------- MediaUploader component (handles file selection and URL pasting) ---------- */
function MediaUploader({ images = [], setImages, videos = [], onVideosChange }) {
  const fileInputRef = useRef(null);

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map((f) => ({ id: `${Date.now()}-${f.name}`, file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...newItems]);
    e.target.value = null;
  };

  const onAddUrl = (val) => {
    const urls = val.split(",").map((s) => s.trim()).filter(Boolean);
    const newItems = urls.map((u) => ({ id: `url-${Date.now()}-${Math.random()}`, url: u }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-3">
      <Label>Images</Label>
      <div className="flex gap-3 items-start flex-col md:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg border flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-400 text-white">
              <FaUpload /> Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" />
            <label className="flex-1">
              <Input placeholder="Paste image URLs (comma separated)" onBlur={(e) => onAddUrl(e.target.value)} />
              <div className="text-xs text-gray-400 mt-1">Paste several URLs then click outside input.</div>
            </label>
          </div>
          <div className="text-xs text-gray-500">Supported: JPG, PNG. Upload multiple images for gallery.</div>
        </div>

        <div className="w-full md:w-48">
          <div className="grid grid-cols-2 gap-2">
            {images.length ? (
              images.slice(0, 4).map((it) => (
                <div key={it.id} className="relative w-full h-20 rounded-lg overflow-hidden border">
                  <img src={it.url} alt="preview" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => removeImage(it.id)} className="absolute top-1 right-1 bg-white rounded p-1 text-sm">
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 h-20 rounded-lg border flex items-center justify-center text-gray-300">
                <FaImage className="text-2xl" />
              </div>
            )}
          </div>
        </div>
      </div>

      <Label>Videos</Label>
      <Input placeholder="Video URLs (comma separated)" onChange={(e) => onVideosChange(e.target.value)} />
    </div>
  );
}

/* ---------- ShippingSection ---------- */
function ShippingSection({ shipping = { dimensions: {} }, onChange, onDimensionChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <Label>Weight (kg)</Label>
        <Input name="weight" value={shipping.weight} onChange={onChange} />
      </div>
      <div>
        <Label>Length (cm)</Label>
        <Input name="length" value={shipping.dimensions.length} onChange={onDimensionChange} />
      </div>
      <div>
        <Label>Width (cm)</Label>
        <Input name="width" value={shipping.dimensions.width} onChange={onDimensionChange} />
      </div>
      <div>
        <Label>Height (cm)</Label>
        <Input name="height" value={shipping.dimensions.height} onChange={onDimensionChange} />
      </div>
    </div>
  );
}

/* ---------- EditProduct main component ---------- */
export default function EditProduct({ productId, onUpdated, closeModal }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [images, setImages] = useState([]); // {id, url?, file?}
  const [videos, setVideos] = useState([]);
  const [colors, setColors] = useState([]);
  const [currentColor, setCurrentColor] = useState("#f43f5e");
  const [launchDate, setLaunchDate] = useState(null);
  const [sizeMode, setSizeMode] = useState("other"); // shoes | clothing | other

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
    stockPerSize: {},
    warranty: { type: "", duration: "" },
    shipping: { weight: "", dimensions: { length: "", width: "", height: "", unit: "cm" }, deliveryTime: "", returnPolicy: "", shippingCharge: "" },
    stock: "",
    isMain: true,
    images: [],
    videos: [],
  });

  /* ---------- Normalize helpers ---------- */
  const normalizeCategoriesPayload = (payload) => {
    const arr = Array.isArray(payload) ? payload : payload?.categories ?? payload?.data ?? [];
    return arr
      .map((it) => {
        if (!it) return null;
        if (typeof it === "string") return { id: it, label: it };
        return { id: it.id ?? it._id ?? it.name ?? it.category, label: it.label ?? it.name ?? it.category };
      })
      .filter(Boolean);
  };
  const normalizeSubcategoriesPayload = (payload) => {
    const arr = Array.isArray(payload) ? payload : payload?.subcategories ?? payload?.data ?? [];
    return arr
      .map((it) => {
        if (!it) return null;
        if (typeof it === "string") return { id: it, label: it };
        return { id: it.id ?? it._id ?? it.name ?? it.subCategory, label: it.label ?? it.name ?? it.subCategory };
      })
      .filter(Boolean);
  };

  /* ---------- Fetch product (GET) and lookups ---------- */
  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data: prodData } = await axios.get(`${API_BASE_PRODUCT}/${productId}`);
        const prod = prodData ?? {};

        if (!mounted) return;

        // populate UI product state with normalized fields
        setProduct((p) => ({
          ...p,
          name: prod.name ?? prod.title ?? "",
          brand: prod.brand ?? prod.manufacturer ?? "",
          model: prod.model ?? "",
          description: prod.description ?? prod.desc ?? "",
          basePrice: prod.basePrice ?? prod.price ?? "",
          mrp: prod.mrp ?? "",
          discountPercentage: prod.discountPercentage ?? prod.discount ?? 0,
          currency: prod.currency ?? "INR",
          availability: prod.availability ?? "In Stock",
          category: prod.category ?? "",
          subCategory: prod.subCategory ?? prod.subCategoryName ?? "",
          subSubCategory: prod.subSubCategory ?? "",
          sizes: Array.isArray(prod.sizes) ? prod.sizes : prod.sizes ? [prod.sizes] : [],
          stockPerSize: prod.stockPerSize ?? {},
          warranty: prod.warranty ?? { type: "", duration: "" },
          shipping: prod.shipping ?? p.shipping,
          stock: prod.stock ?? prod.quantity ?? "",
          isMain: prod.isMain ?? prod.featured ?? p.isMain,
          images: Array.isArray(prod.images) ? prod.images : prod.images ? prod.images : [],
          videos: Array.isArray(prod.videos) ? prod.videos : prod.videos ? [prod.videos] : [],
        }));

        // set images previews - existing images as url-only entries
        const existingUrls = Array.isArray(prod.images) ? prod.images : prod.images ? [prod.images] : [];
        const urlOnly = existingUrls.map((u, idx) => ({ id: `existing-${idx}`, url: u }));
        setImages(urlOnly);

        if (prod.colors) setColors(Array.isArray(prod.colors) ? prod.colors : [prod.colors]);
        if (prod.launchDate) setLaunchDate(new Date(prod.launchDate));
        if (prod.videos) setVideos(Array.isArray(prod.videos) ? prod.videos : [prod.videos]);

        // fetch simple categories list (best-effort)
        try {
          const { data: cats } = await axios.get(`${API_BASE_PRODUCT}/categories`);
          if (!mounted) return;
          setCategories(normalizeCategoriesPayload(cats ?? []));
        } catch (err) {
          // fallback
          try {
            const { data: cats2 } = await axios.get(`${API_BASE_PRODUCT.replace("/product", "")}/categories`);
            if (!mounted) return;
            setCategories(normalizeCategoriesPayload(cats2 ?? []));
          } catch (e) {
            if (mounted) setCategories([]);
          }
        }

        // fetch subcategories when category present
        if (prod.category) {
          try {
            const { data: subs } = await axios.get(`${API_BASE_PRODUCT}/categories/${encodeURIComponent(prod.category)}/subcategories`);
            if (!mounted) return;
            setSubCategories(normalizeSubcategoriesPayload(subs ?? []));
          } catch (err) {
            setSubCategories([]);
          }
        }

        // fetch potential sub-sub list
        if (prod.category && prod.subCategory) {
          try {
            const { data: list } = await axios.get(
              `${API_BASE_PRODUCT}/categories/${encodeURIComponent(prod.category)}/${encodeURIComponent(prod.subCategory)}/products`
            );
            const arr = Array.isArray(list) ? list : list?.products ?? list?.data ?? [];
            const items = (arr || []).map((p) => p && (p.subSubCategory ?? p.subSub ?? p.latestProductName ?? p.name)).filter(Boolean).map(String);
            setSubSubCategories(Array.from(new Set(items)));
          } catch (err) {
            setSubSubCategories([]);
          }
        }

        // size mode auto-switch
        const sub = (prod.subCategory ?? "").toLowerCase();
        const subsub = (prod.subSubCategory ?? "").toLowerCase();
        if (sub.includes("shoe") || sub.includes("footwear") || sub.includes("sandal") || subsub.includes("shoe")) {
          setSizeMode("shoes");
        } else if (sub) {
          setSizeMode("clothing");
        } else {
          setSizeMode("other");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [productId]);

  /* ---------- fetch subcategories when category changes ---------- */
  useEffect(() => {
    if (!product.category) {
      setSubCategories([]);
      setSubSubCategories([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data: subs } = await axios.get(`${API_BASE_PRODUCT}/categories/${encodeURIComponent(product.category)}/subcategories`);
        if (!mounted) return;
        setSubCategories(normalizeSubcategoriesPayload(subs ?? []));
        setSubSubCategories([]);
      } catch (err) {
        setSubCategories([]);
        setSubSubCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [product.category]);

  /* ---------- fetch sub-sub when subCategory changes ---------- */
  useEffect(() => {
    if (!product.category || !product.subCategory) {
      setSubSubCategories([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data: list } = await axios.get(
          `${API_BASE_PRODUCT}/categories/${encodeURIComponent(product.category)}/${encodeURIComponent(product.subCategory)}/products`
        );
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : list?.products ?? list?.data ?? [];
        const items = (arr || []).map((p) => p && (p.subSubCategory ?? p.subSub ?? p.latestProductName ?? p.name)).filter(Boolean).map(String);
        setSubSubCategories(Array.from(new Set(items)));
      } catch (err) {
        setSubSubCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [product.subCategory, product.category]);

  /* ---------- auto-switch size mode on sub selections ---------- */
  useEffect(() => {
    const sub = (product.subCategory || "").toLowerCase();
    const subsub = (product.subSubCategory || "").toLowerCase();
    if (sub.includes("shoe") || sub.includes("footwear") || sub.includes("sandal") || subsub.includes("shoe")) {
      setSizeMode("shoes");
    } else if (sub) {
      setSizeMode("clothing");
    } else {
      setSizeMode("other");
    }
  }, [product.subCategory, product.subSubCategory]);

  /* ---------- input handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProduct((p) => ({ ...p, [name]: checked }));
      return;
    }
    setProduct((p) => ({ ...p, [name]: value, sizes: name === "category" || name === "subCategory" || name === "subSubCategory" ? [] : p.sizes }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, shipping: { ...p.shipping, [name]: value } }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, shipping: { ...p.shipping, dimensions: { ...p.shipping.dimensions, [name]: value } } }));
  };

  const handleVideosChange = (v) => setVideos(v.split(",").map((s) => s.trim()).filter(Boolean));
  const handleMediaChangeUrls = (value, field) => setProduct((p) => ({ ...p, [field]: value.split(",").map((s) => s.trim()).filter(Boolean) }));

  const addColor = () => {
    if (!colors.includes(currentColor)) setColors((c) => [...c, currentColor]);
  };
  const removeColor = (hex) => setColors((c) => c.filter((x) => x !== hex));

  const toggleSize = (sizeOrValue) => {
    if (typeof sizeOrValue === "string" && sizeOrValue.includes(",")) {
      const arr = sizeOrValue.split(",").map((s) => s.trim()).filter(Boolean);
      setProduct((p) => ({ ...p, sizes: arr, stockPerSize: {} }));
      return;
    }
    setProduct((p) => {
      const exists = p.sizes.includes(sizeOrValue);
      const sizes = exists ? p.sizes.filter((s) => s !== sizeOrValue) : [...p.sizes, sizeOrValue];
      const newStock = { ...p.stockPerSize };
      if (exists) delete newStock[sizeOrValue];
      return { ...p, sizes, stockPerSize: newStock };
    });
  };

  const setStockForSize = (size, qty) => {
    setProduct((p) => ({ ...p, stockPerSize: { ...p.stockPerSize, [size]: Number(qty || 0) } }));
  };

  /* ---------- keep product.images in sync with images (url-only) ---------- */
  useEffect(() => {
    const urlOnly = images.filter((it) => it.url && !it.file).map((it) => it.url);
    setProduct((p) => ({ ...p, images: urlOnly }));
  }, [images]);

  /* ---------- Submit updated product (PUT) - supports mixed images (existing URLs + new files) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const fd = new FormData();

      // Prepare payload copy and normalize numeric fields
      const payload = { ...product };
      payload.basePrice = payload.basePrice === "" ? 0 : Number(payload.basePrice);
      payload.mrp = payload.mrp === "" ? 0 : Number(payload.mrp);
      payload.stock = payload.stock === "" ? 0 : Number(payload.stock);

      // Ensure arrays are set
      payload.colors = colors;
      payload.videos = videos;
      payload.launchDate = launchDate ? launchDate.toISOString() : null;

      // existing image URLs (we'll send them as JSON string)
      const existingImageUrls = images.filter((it) => it.url && !it.file).map((it) => it.url);
      fd.append("existingImages", JSON.stringify(existingImageUrls));

      // append new uploaded files (field name imageFiles[] - backend should accept)
      images.forEach((it) => {
        if (it.file) {
          fd.append("imageFiles", it.file); // backend should handle multiple files under 'imageFiles'
        }
      });

      // append other fields - nested objects as JSON strings
      fd.append("name", payload.name || "");
      fd.append("brand", payload.brand || "");
      fd.append("model", payload.model || "");
      fd.append("description", payload.description || "");
      fd.append("basePrice", String(payload.basePrice));
      fd.append("mrp", String(payload.mrp));
      fd.append("discountPercentage", String(payload.discountPercentage || 0));
      fd.append("currency", payload.currency || "INR");
      fd.append("availability", payload.availability || "In Stock");
      fd.append("category", payload.category || "");
      fd.append("subCategory", payload.subCategory || "");
      fd.append("subSubCategory", payload.subSubCategory || "");
      fd.append("sizes", JSON.stringify(payload.sizes || []));
      fd.append("stockPerSize", JSON.stringify(product.stockPerSize || {}));
      fd.append("warranty", JSON.stringify(payload.warranty || {}));
      fd.append("shipping", JSON.stringify(payload.shipping || {}));
      fd.append("stock", String(payload.stock || 0));
      fd.append("isMain", payload.isMain ? "true" : "false");
      fd.append("videos", JSON.stringify(payload.videos || []));
      fd.append("colors", JSON.stringify(payload.colors || []));
      fd.append("launchDate", payload.launchDate || "");

      // Call PUT - backend should accept multipart/form-data
      const res = await axios.put(`${API_BASE_PRODUCT}/${productId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      alert("Product updated successfully.");
      if (typeof onUpdated === "function") onUpdated(res.data ?? res);
      if (typeof closeModal === "function") closeModal();
    } catch (err) {
      console.error("Error updating product:", err);
      setLoading(false);
      alert("Error updating product. Check console for details.");
    }
  };

  if (loading) {
    return (
    
        <div className="p-6 max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading product…</p>
        </div>
    
    );
  }

  /* ---------- UI ---------- */
  return (
   
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 px-6 py-8 relative overflow-auto max-h-[90vh]">
          <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
            <FaTimes size={18} className="text-gray-500" />
          </button>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-6">Edit Product</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic */}
            <Card className="p-4">
              <SectionHeader title="Basic Information" subtitle="Edit name, brand, pricing & availability" color="from-rose-500 to-rose-400" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input name="name" value={product.name} onChange={handleChange} required placeholder="e.g. Running Sneakers" />
                </div>

                <div>
                  <Label>Brand</Label>
                  <Input name="brand" value={product.brand} onChange={handleChange} placeholder="Brand name (optional)" />
                </div>

                <div>
                  <Label>Model</Label>
                  <Input name="model" value={product.model} onChange={handleChange} placeholder="Model number / code" />
                </div>

                <div>
                  <Label>Currency</Label>
                  <Input name="currency" value={product.currency} onChange={handleChange} placeholder="INR" />
                </div>

                <div>
                  <Label>Base Price</Label>
                  <Input name="basePrice" type="number" min="0" value={product.basePrice} onChange={handleChange} placeholder="0.00" />
                </div>

                <div>
                  <Label>MRP</Label>
                  <Input name="mrp" type="number" min="0" value={product.mrp} onChange={handleChange} placeholder="0.00" />
                </div>

                <div>
                  <Label>Discount %</Label>
                  <Input name="discountPercentage" type="number" min="0" max="100" value={product.discountPercentage} onChange={handleChange} placeholder="0" />
                </div>

                <div>
                  <Label>Availability</Label>
                  <select name="availability" value={product.availability} onChange={handleChange} className="w-full p-2 border rounded-xl">
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Preorder</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea name="description" rows={3} value={product.description} onChange={handleChange} placeholder="Short product description..." />
                </div>

                <div>
                  <Label><FaCalendarAlt className="inline mr-2 text-rose-500" /> Launch / Available From</Label>
                  <DatePicker selected={launchDate} onChange={(d) => setLaunchDate(d)} className="w-full p-2 border rounded-xl" placeholderText="Select date" />
                </div>

                <div>
                  <Label>Featured (Main Product)</Label>
                  <div className="flex items-center gap-2">
                    <input name="isMain" type="checkbox" checked={product.isMain} onChange={handleChange} className="w-4 h-4" />
                    <div className="text-sm">Mark as featured</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category */}
            <Card className="p-4">
              <SectionHeader title="Category" subtitle="Change category to update available options" color="from-indigo-500 to-purple-600" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <select name="category" value={product.category} onChange={handleChange} className="w-full p-2 border rounded-xl">
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <select name="subCategory" value={product.subCategory} onChange={handleChange} className="w-full p-2 border rounded-xl" disabled={!subCategories.length}>
                    <option value="">Select Subcategory</option>
                    {subCategories.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Sub-Subcategory</Label>
                  <select name="subSubCategory" value={product.subSubCategory} onChange={handleChange} className="w-full p-2 border rounded-xl" disabled={!subSubCategories.length}>
                    <option value="">Select Sub-Subcategory</option>
                    {subSubCategories.map((s, i) => <option key={`${s}-${i}`} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">Tip: Choose Category → Subcategory → Sub-Subcategory to auto-enable sizes and other fields.</div>
            </Card>

            {/* Sizes */}
            <Card className="p-4">
              <SectionHeader title="Sizes" subtitle="Pick sizes depending on the product type" color="from-amber-500 to-orange-500" />
              <div className="flex gap-3 mb-4">
                <button type="button" onClick={() => setSizeMode("shoes")} className={`px-4 py-1 rounded-full border ${sizeMode === "shoes" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}>Shoes Sizes</button>
                <button type="button" onClick={() => setSizeMode("clothing")} className={`px-4 py-1 rounded-full border ${sizeMode === "clothing" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}>Clothing Sizes</button>
                <button type="button" onClick={() => setSizeMode("other")} className={`px-4 py-1 rounded-full border ${sizeMode === "other" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}>Custom</button>
              </div>

              <SizeSelector mode={sizeMode} selectedSizes={product.sizes} onToggle={toggleSize} />

              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Selected sizes</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.length === 0 ? <span className="text-sm text-gray-400">No sizes selected</span> : product.sizes.map((s) => (
                    <div key={s} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      <span>{s}</span>
                      <button type="button" onClick={() => toggleSize(s)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                    </div>
                  ))}
                </div>
              </div>

              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <Label>Stock per size</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.sizes.map((s) => (
                      <div key={s}>
                        <div className="text-sm mb-1">{s}</div>
                        <Input type="number" min="0" value={product.stockPerSize?.[s] ?? ""} onChange={(e) => setStockForSize(s, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Colors, Media, Inventory */}
            <Card className="p-4">
              <SectionHeader title="Colors & Media" subtitle="Edit colors, images, videos and shipping" color="from-emerald-400 to-teal-400" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label><FaPalette className="inline mr-2 text-emerald-500" /> Pick color</Label>
                  <div className="p-3 border rounded-xl bg-white">
                    <HexColorPicker color={currentColor} onChange={setCurrentColor} />
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded border" style={{ background: currentColor }} />
                      <div className="text-sm font-medium">{currentColor}</div>
                      <button type="button" onClick={addColor} className="ml-auto px-3 py-1 rounded-lg bg-rose-500 text-white">Add</button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Selected Colors</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.length === 0 ? <div className="text-sm text-gray-400">No colors added</div> : colors.map((c) => (
                      <div key={c} className="flex items-center gap-2 px-3 py-1 border rounded-lg">
                        <div className="w-6 h-6 rounded" style={{ background: c }} />
                        <div className="text-sm">{c}</div>
                        <button type="button" onClick={() => removeColor(c)} className="ml-2 text-red-500"><FaTrash /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-6">
                <MediaUploader images={images} setImages={setImages} videos={videos} onVideosChange={handleVideosChange} />
              </div>

              <div className="mt-4">
                <Label>Shipping (dimensions)</Label>
                <ShippingSection shipping={product.shipping} onChange={handleShippingChange} onDimensionChange={handleDimensionChange} />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Stock (total)</Label>
                  <Input name="stock" type="number" value={product.stock} onChange={handleChange} />
                </div>

                <div>
                  <Label>Warranty (type & duration)</Label>
                  <div className="flex gap-2">
                    <Input name="warrantyType" placeholder="Type (e.g. Manufacturer)" value={product.warranty.type} onChange={(e) => setProduct((p) => ({ ...p, warranty: { ...p.warranty, type: e.target.value } }))} />
                    <Input name="warrantyDuration" placeholder="Duration (e.g. 1 year)" value={product.warranty.duration} onChange={(e) => setProduct((p) => ({ ...p, warranty: { ...p.warranty, duration: e.target.value } }))} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/3">
                <Card className="p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border flex items-center justify-center">
                      <img src={images[0]?.url ?? product.images[0] ?? UPLOADED_PREVIEW} alt="preview" className="object-cover w-full h-full" />
                    </div>
                    <div className="w-full text-sm text-gray-600 text-center">Preview (first image or sample)</div>

                    <div className="mt-3 w-full">
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((it) => (
                          <div key={it.id} className="w-20 h-20 rounded overflow-hidden border relative">
                            <img src={it.url} alt="thumb" className="object-cover w-full h-full" />
                            <button type="button" onClick={() => setImages((prev) => prev.filter((x) => x.id !== it.id))} className="absolute top-1 right-1 p-1 bg-white rounded">
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex-1">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Finalize & Publish</h3>
                      <p className="text-sm text-gray-500">Review changes and update your product.</p>
                    </div>
                    <div className="text-sm text-gray-400">Editing</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button type="button" onClick={closeModal} className="px-4 py-3 rounded-lg border hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-3 rounded-lg text-white bg-rose-600 hover:bg-rose-700">
                      <FaCheck className="inline mr-2" /> Update Product
                    </button>

                  </div>
                </Card>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
   
  );
}
