// src/pages/products/AddProduct.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { motion } from "framer-motion";
import { FaCheck, FaUpload, FaTrash, FaImage, FaPalette, FaCalendarAlt } from "react-icons/fa";
import { HexColorPicker } from "react-colorful";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

/**
 * NOTE: removed sandbox:/... preview (invalid in browser).
 * Use an external placeholder that will always resolve in dev.
 */
const UPLOADED_PREVIEW = "https://via.placeholder.com/600x400?text=No+Image";

const API_BASE = "https://ecommerce-backend-y1bv.onrender.com/api/product/";

/* ------------------ Helpers to normalize API responses ------------------ */
const normalizeCategoriesPayload = (payload) => {
  let arr = Array.isArray(payload) ? payload : payload?.categories ?? payload?.data ?? [];
  return arr
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { id: item, label: item };
      if (typeof item === "object") {
        const label = item.category ?? item.name ?? item.title ?? item.label;
        if (label) return { id: String(label), label: String(label) };
      }
      return null;
    })
    .filter(Boolean);
};

const normalizeSubcategoriesPayload = (payload) => {
  let arr = Array.isArray(payload) ? payload : payload?.subcategories ?? payload?.data ?? [];
  return arr
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { id: item, label: item };
      if (typeof item === "object") {
        const label = item.subCategory ?? item.name ?? item.label ?? item.title;
        if (label) return { id: String(label), label: String(label) };
      }
      return null;
    })
    .filter(Boolean);
};

const normalizeProductsPayload = (payload) => {
  let arr = Array.isArray(payload) ? payload : payload?.products ?? payload?.data ?? [];
  return arr
    .map((p) => {
      if (!p) return null;
      const name = p.name ?? p.title ?? p.latestProductName ?? p.productName;
      const subSub = p.subSubCategory ?? p.subSub ?? p.subCategory ?? name;
      const id = p._id ?? p.id ?? name;
      return { id: String(id), name: String(name ?? subSub ?? id), raw: p, subSub: String(subSub ?? name ?? id) };
    })
    .filter(Boolean);
};

/* ------------------ Small presentational components ------------------ */

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

/* ------------------ SizeSelector Component ------------------ */
function SizeSelector({ mode, selectedSizes, onToggle }) {
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
              <motion.button
                key={s}
                type="button"
                onClick={() => onToggle(s)}
                whileTap={{ scale: 0.96 }}
                className={`${base} ${sel ? selectedClass : unselectedClass}`}
                aria-pressed={sel}
              >
                <span>{s}</span>
                {sel && <FaCheck className="ml-2 w-3 h-3" />}
              </motion.button>
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
              <motion.button
                key={s}
                type="button"
                onClick={() => onToggle(s)}
                whileTap={{ scale: 0.96 }}
                className={`${base} ${sel ? selectedClass : unselectedClass}`}
                aria-pressed={sel}
              >
                <span>{s}</span>
                {sel && <FaCheck className="ml-2 w-3 h-3" />}
              </motion.button>
            );
          })}
        </div>
      </>
    );
  }

  // other
  return (
    <>
      <div className="text-sm text-gray-500 mb-3">Enter sizes as comma separated values (e.g. 32, 34, Free Size)</div>
      <Input placeholder="Sizes (comma separated)" onChange={(e) => onToggle(e.target.value)} />
    </>
  );
}

/* ------------------ MediaUploader Component (URLs + Files + previews) ------------------ */
function MediaUploader({ images, setImages, videos, onVideosChange }) {
  const fileInputRef = useRef(null);

  useEffect(() => {
    // cleanup object URLs on unmount
    return () => {
      images.forEach((it) => {
        if (it.url && it.file) {
          try {
            URL.revokeObjectURL(it.url);
          } catch {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setImages((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it && it.file && it.url) {
        try {
          URL.revokeObjectURL(it.url);
        } catch {}
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <Label>Images</Label>

      <div className="flex gap-3 items-start flex-col md:flex-row">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-400 text-white"
            >
              <FaUpload /> Upload
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesSelected}
              className="hidden"
            />

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

/* ------------------ ShippingSection Component ------------------ */
function ShippingSection({ shipping, onChange, onDimensionChange }) {
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

/* ------------------ Main Page ------------------ */

const INITIAL_PRODUCT = {
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
  shipping: {
    weight: "",
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    deliveryTime: "",
    returnPolicy: "",
    shippingCharge: "",
  },
  stock: "",
  isMain: true,
  images: [],
  videos: [],
};

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]); // {id,label}
  const [subCategories, setSubCategories] = useState([]); // {id,label}
  const [subSubCategories, setSubSubCategories] = useState([]); // strings

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [images, setImages] = useState([]); // array of {id, url?, file?}
  const [videos, setVideos] = useState([]); // array of video urls
  const [colors, setColors] = useState([]); // list of hex strings
  const [currentColor, setCurrentColor] = useState("#f43f5e");
  const [launchDate, setLaunchDate] = useState(null);

  // sizeMode can be 'shoes', 'clothing', or 'other'
  const [sizeMode, setSizeMode] = useState("other");

  const [product, setProduct] = useState(INITIAL_PRODUCT);

  /* ------------------ fetch categories ------------------ */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(`${API_BASE}/categories`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? res;
        const cats = normalizeCategoriesPayload(data);
        setCategories(cats);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  /* ------------------ fetch subcategories when category changes ------------------ */
  useEffect(() => {
    if (!product.category) {
      setSubCategories([]);
      setSubSubCategories([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    axios
      .get(`${API_BASE}/categories/${encodeURIComponent(product.category)}/subcategories`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? res;
        const subs = normalizeSubcategoriesPayload(data);
        setSubCategories(subs);
        setSubSubCategories([]);
      })
      .catch((err) => {
        console.error("Error fetching subcategories:", err);
        setSubCategories([]);
        setSubSubCategories([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [product.category]);

  /* ------------------ fetch sub-sub (products) when subCategory changes ------------------ */
  useEffect(() => {
    if (!product.category || !product.subCategory) {
      setSubSubCategories([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    axios
      .get(`${API_BASE}/categories/${encodeURIComponent(product.category)}/${encodeURIComponent(product.subCategory)}/products`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? res;
        const products = normalizeProductsPayload(data);
        // extract unique subSub labels
        const extracted = products
          .map((p) => (p.raw && (p.raw.subSubCategory ?? p.raw.subSub ?? p.raw.latestProductName)) || p.subSub || p.name)
          .filter(Boolean)
          .map((s) => String(s));
        setSubSubCategories(Array.from(new Set(extracted)));
      })
      .catch((err) => {
        console.error("Error fetching products/sub-subcategories:", err);
        setSubSubCategories([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [product.subCategory, product.category]);

  /* ------------------ Auto-switch size mode based on subCategory ------------------ */
  useEffect(() => {
    const sub = (product.subCategory || "").toLowerCase();
    const subsub = (product.subSubCategory || "").toLowerCase();

    if (
      sub.includes("shoe") ||
      sub.includes("footwear") ||
      sub.includes("sandal") ||
      subsub.includes("shoe") ||
      subsub.includes("footwear") ||
      subsub.includes("sandal")
    ) {
      setSizeMode("shoes");
    } else if (sub) {
      setSizeMode("clothing");
    } else {
      setSizeMode("other");
    }
  }, [product.subCategory, product.subSubCategory]);

  /* ------------------ input handlers ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProduct((p) => ({ ...p, [name]: checked }));
      return;
    }
    // reset sizes when changing category/sub to avoid incorrect sizes
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

  const handleVideosChange = (v) => {
    setVideos(v.split(",").map((s) => s.trim()).filter(Boolean));
  };

  const handleMediaChangeUrls = (value, field) => {
    setProduct((p) => ({ ...p, [field]: value.split(",").map((s) => s.trim()).filter(Boolean) }));
  };

  const addColor = () => {
    if (!colors.includes(currentColor)) {
      setColors((c) => [...c, currentColor]);
    }
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

  /* ------------------ Media helpers for main file state ------------------ */
  // sync URL-only images to product.images so preview uses them
  useEffect(() => {
    const urlOnly = images.filter((it) => it.url && !it.file).map((it) => it.url);
    setProduct((p) => ({ ...p, images: urlOnly }));
  }, [images]);

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((it) => {
        if (it.file && it.url) {
          try {
            URL.revokeObjectURL(it.url);
          } catch {}
        }
      });
    };
  }, [images]);

  /* ------------------ submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      const payload = { ...product };

      payload.basePrice = payload.basePrice === "" ? 0 : Number(payload.basePrice);
      payload.mrp = payload.mrp === "" ? 0 : Number(payload.mrp);
      payload.stock = payload.stock === "" ? 0 : Number(payload.stock);

      payload.colors = colors;
      payload.videos = videos;
      payload.launchDate = launchDate ? launchDate.toISOString() : null;

      // include remote URLs (not new uploads)
      payload.images = images.filter((it) => it.url && !it.file).map((it) => it.url);

      // Append payload fields: objects become JSON strings, arrays JSON string
      Object.keys(payload).forEach((k) => {
        const val = payload[k];
        if (val === undefined || val === null) return;
        if (typeof val === "object" && !Array.isArray(val)) {
          fd.append(k, JSON.stringify(val));
        } else if (Array.isArray(val)) {
          fd.append(k, JSON.stringify(val));
        } else {
          fd.append(k, String(val));
        }
      });

      // explicit fields
      fd.set("stockPerSize", JSON.stringify(product.stockPerSize || {}));
      fd.set("colors", JSON.stringify(colors || []));
      fd.set("videos", JSON.stringify(videos || []));

      // append file images as imageFiles (backend should accept array of files)
      images.forEach((it) => {
        if (it.file) fd.append("imageFiles", it.file);
      });

      const res = await axios.post(`${API_BASE}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitLoading(false);
      alert("Product added successfully");
      console.log("Add response:", res.data);

      // revoke any created object URLs
      images.forEach((it) => {
        if (it.file && it.url) {
          try {
            URL.revokeObjectURL(it.url);
          } catch {}
        }
      });

      // reset entire form
      setProduct(INITIAL_PRODUCT);
      setImages([]);
      setVideos([]);
      setColors([]);
      setLaunchDate(null);

      // navigate to all products page
      navigate("/admin/products/all");
    } catch (err) {
      setSubmitLoading(false);
      console.error("Error adding product:", err);
      // Show server-provided message when available
      const msg = err?.response?.data?.message || err?.message || "Error adding product";
      alert(msg);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <AdminLayout>
      {/* BACK BUTTON */}
      <div className="p-4">
        <button
          onClick={() => navigate("/admin/products/all")}
          className="px-4 py-2 rounded-lg font-medium shadow transition"
          style={{
            backgroundColor: "#0A1A3A",
            color: "#FFFFFF",
          }}
        >
          ← Back to Products
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add New Product</h1>
            <p className="text-sm text-gray-500 mt-1">E-commerce premium UI — colorful, responsive, and feature-rich.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Status</div>
            <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-sm font-semibold">Draft</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC */}
          <Card className="p-6">
            <SectionHeader title="Basic Information" subtitle="Product name, brand, pricing & availability" color="from-rose-500 to-rose-400" />

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
                <div>
                  <DatePicker selected={launchDate} onChange={(date) => setLaunchDate(date)} className="w-full p-2 border rounded-xl" placeholderText="Select date" />
                </div>
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

          {/* CATEGORY */}
          <Card className="p-6">
            <SectionHeader title="Category" subtitle="Choose proper category to auto-enable relevant options" color="from-indigo-500 to-purple-600" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <select name="category" value={product.category} onChange={handleChange} className="w-full p-2 border rounded-xl">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Subcategory</Label>
                <select name="subCategory" value={product.subCategory} onChange={handleChange} className="w-full p-2 border rounded-xl" disabled={!subCategories.length}>
                  <option value="">Select Subcategory</option>
                  {subCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Sub-Subcategory</Label>
                <select name="subSubCategory" value={product.subSubCategory} onChange={handleChange} className="w-full p-2 border rounded-xl" disabled={!subSubCategories.length}>
                  <option value="">Select Sub-Subcategory</option>
                  {subSubCategories.map((s, i) => (
                    <option key={`${s}-${i}`} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-500">Tip: Choose Category → Subcategory → Sub-Subcategory to auto-enable sizes and other relevant fields.</div>
          </Card>

          {/* SIZES */}
          <Card className="p-6">
            <SectionHeader title="Sizes" subtitle="Pick sizes depending on the product type" color="from-amber-500 to-orange-500" />

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                className={`px-4 py-1 rounded-full border ${sizeMode === "shoes" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setSizeMode("shoes")}
              >
                Shoes Sizes
              </button>

              <button
                type="button"
                className={`px-4 py-1 rounded-full border ${sizeMode === "clothing" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setSizeMode("clothing")}
              >
                Clothing Sizes
              </button>

              <button
                type="button"
                className={`px-4 py-1 rounded-full border ${sizeMode === "other" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setSizeMode("other")}
              >
                Custom
              </button>
            </div>

            <SizeSelector mode={sizeMode} selectedSizes={product.sizes} onToggle={toggleSize} />

            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Selected sizes</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.length === 0 ? <span className="text-sm text-gray-400">No sizes selected</span> : product.sizes.map((s) => (
                  <div key={s} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                    <span>{s}</span>
                    <button type="button" onClick={() => toggleSize(s)} className="text-gray-400 hover:text-red-500">
                      <FaTrash />
                    </button>
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

          {/* COLORS */}
          <Card className="p-6">
            <SectionHeader title="Colors" subtitle="Add colors using the picker or paste hex codes" color="from-emerald-400 to-teal-400" />
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
          </Card>

          {/* INVENTORY & MEDIA */}
          <Card className="p-6">
            <SectionHeader title="Inventory & Media" subtitle="Stock, warranty, images and shipping details" color="from-sky-500 to-cyan-500" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex items-center gap-3 mt-4">
                <input name="isMain" type="checkbox" checked={product.isMain} onChange={handleChange} className="w-4 h-4" />
                <div className="text-sm">Main Product (featured)</div>
              </div>

              <div className="md:col-span-2">
                <MediaUploader images={images} setImages={setImages} videos={videos} onVideosChange={handleVideosChange} />
              </div>
            </div>

            <div className="mt-4">
              <Label>Shipping (dimensions)</Label>
              <ShippingSection shipping={product.shipping} onChange={handleShippingChange} onDimensionChange={handleDimensionChange} />
            </div>
          </Card>

          {/* PREVIEW & CTA */}
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
                          <button type="button" onClick={() => setImages((prev) => {
                            // revoke objectURL if needed
                            const found = prev.find(x => x.id === it.id);
                            if (found && found.file && found.url) {
                              try { URL.revokeObjectURL(found.url); } catch {}
                            }
                            return prev.filter((x) => x.id !== it.id);
                          })} className="absolute top-1 right-1 p-1 bg-white rounded">
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
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Finalize & Publish</h3>
                    <p className="text-sm text-gray-500">Review all details and publish your product to the store.</p>
                  </div>
                  <div className="text-sm text-gray-400">Status: Draft</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button type="button" className="px-4 py-3 rounded-lg border hover:bg-gray-50">Save Draft</button>
                  <button type="submit" className={`px-4 py-3 rounded-lg text-white ${submitLoading ? "bg-rose-400" : "bg-rose-600 hover:bg-rose-700"}`}>
                    {submitLoading ? "Publishing..." : <><FaCheck className="inline mr-2" /> Add Product</>}
                  </button>
                </div>

              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
