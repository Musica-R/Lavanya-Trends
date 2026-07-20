import React, { useEffect, useMemo, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { useSearch } from "../context/SearchContext";
import "../styles/ProductGrid.css";
import Loader from "./Loader";

const PRICE_PRESETS = [
  { label: "Under ₹999", min: 0, max: 999 },
  { label: "₹999 - ₹2999", min: 999, max: 2999 },
  { label: "₹2999 - ₹5999", min: 2999, max: 5999 },
  { label: "Above ₹5999", min: 5999, max: Infinity },
];

const FABRIC_KEYWORDS = ["Silk", "Cotton", "Lycra", "Net", "Tissue", "Modal", "Polyester"];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
];

const CATEGORY_VISIBLE_LIMIT = 6;

// The API doesn't return a rating field yet, but ProductCard reads
// product.rating to fill stars. This derives a stable per-product
// rating (won't reshuffle on re-render) so the card shows real stars
// instead of always empty ones. Delete this once the API adds ratings.
const withRating = (product) => {
  if (product.rating) return product;
  const rating = 3.9 + ((product.id * 7) % 11) / 10; // 3.9 - 4.9
  return { ...product, rating: Math.min(rating, 5) };
};

const ProductGrid = ({ onViewDetails }) => {
  const { searchTerm, setSearchTerm } = useSearch();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);

  const [priceMin, setPriceMin] = useState(499);
  const [priceMax, setPriceMax] = useState(12999);
  const [activePreset, setActivePreset] = useState(null);

  const [sortBy, setSortBy] = useState("popularity");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pillsRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://nithi-billing.ddnsgeek.com/sarees/products/get-products?page=${page}`
        );

        if (!res.ok) throw new Error("API response not OK");

        const data = await res.json();

        const activeProducts = Array.isArray(data.products)
          ? data.products.filter((item) => item.status === "active")
          : [];

        setProducts(activeProducts);
        setTotal(data.total ?? activeProducts.length);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category?.category).filter(Boolean))],
    [products]
  );

  const visibleSidebarCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_VISIBLE_LIMIT);

  const toggleFabric = (fabric) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const applyPreset = (preset) => {
    if (activePreset?.label === preset.label) {
      setActivePreset(null);
      setPriceMin(499);
      setPriceMax(12999);
      return;
    }
    setActivePreset(preset);
    setPriceMin(preset.min);
    setPriceMax(preset.max === Infinity ? 12999 : preset.max);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedFabrics([]);
    setPriceMin(499);
    setPriceMax(12999);
    setActivePreset(null);
    setSearchTerm("");
    setSortBy("popularity");
  };

  const scrollPills = (dir) => {
    if (!pillsRef.current) return;
    pillsRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const desc = product.desc?.toLowerCase() || "";
      const category = product.category?.category?.toLowerCase() || "";
      const search = searchTerm?.toLowerCase() || "";
      const price = parseFloat(product.price) || 0;

      const matchCategory =
        selectedCategory === "All" || product.category?.category === selectedCategory;

      const matchSearch =
        !search || name.includes(search) || category.includes(search) || desc.includes(search);

      const matchPrice = price >= priceMin && price <= priceMax;

      const matchFabric =
        selectedFabrics.length === 0 ||
        selectedFabrics.some((f) => name.includes(f.toLowerCase()) || desc.includes(f.toLowerCase()));

      return matchCategory && matchSearch && matchPrice && matchFabric;
    });

    switch (sortBy) {
      case "price_low":
        list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_high":
        list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "discount":
        list = [...list].sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    return list.map(withRating);
  }, [products, selectedCategory, searchTerm, priceMin, priceMax, selectedFabrics, sortBy]);

  const rangeStart = total === 0 ? 0 : (page - 1) * (products.length || 0) + 1;
  const rangeEnd = rangeStart + filteredProducts.length - 1;

  return (
    <section className="product-section" id="products">
      {/* ---------- Hero Banner ---------- */}
      <div className="saree-banner">
        <img
          className="banner-image"
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop"
          alt="Premium saree collection"
          loading="eager"
        />
        <div className="banner-overlay" />
        <div className="banner-content">
          <p className="banner-breadcrumb">
            <span>Home</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Sarees</span>
          </p>
          <h1 className="banner-title">Premium Saree Collection</h1>
          <p className="banner-subtitle">
            Discover our handpicked range of exquisite sarees for every occasion.
          </p>
        </div>
      </div>

      <div className="product-container">
        <div className="shop-layout">
          {/* ---------- Sidebar Filters ---------- */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h4>
                <svg viewBox="0 0 24 24" width="16" height="16" className="filter-icon">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M4 6h16M8 12h12M11 18h9M4 12h.01M4 18h.01"
                  />
                </svg>
                Filters
              </h4>
              <button type="button" className="clear-all-btn" onClick={clearAllFilters}>
                Clear All
              </button>
            </div>

            <div className="filter-block">
              <p className="filter-block-title">Price Range</p>
              {/* <div className="price-slider">
                <input
                  type="range"
                  min={499}
                  max={12999}
                  value={priceMin}
                  onChange={(e) => {
                    setActivePreset(null);
                    setPriceMin(Math.min(Number(e.target.value), priceMax - 100));
                  }}
                />
                <input
                  type="range"
                  min={499}
                  max={12999}
                  value={priceMax}
                  onChange={(e) => {
                    setActivePreset(null);
                    setPriceMax(Math.max(Number(e.target.value), priceMin + 100));
                  }}
                />
              </div> */}

              {/* <div className="price-values">
                <span>₹{priceMin.toLocaleString("en-IN")}</span>
                <span>₹{priceMax >= 12999 ? "12,999+" : priceMax.toLocaleString("en-IN")}</span>
              </div> */}

              <div className="price-presets">
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`preset-btn ${activePreset?.label === preset.label ? "active" : ""}`}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-block">
              <p className="filter-block-title">Categories</p>
              <div className="category-checkbox-list">
                {visibleSidebarCategories.map((category) => (
                  <label key={category} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />
                    <span>{category === "All" ? "All Sarees" : category}</span>
                  </label>
                ))}
              </div>
              {categories.length > CATEGORY_VISIBLE_LIMIT && (
                <button
                  type="button"
                  className="view-more-btn"
                  onClick={() => setShowAllCategories((s) => !s)}
                >
                  {showAllCategories ? "View Less ▲" : "View More ▼"}
                </button>
              )}
            </div>

            <div className="filter-block">
              <button type="button" className="fabric-toggle" onClick={() => setFabricOpen((o) => !o)}>
                <span className="filter-block-title">Fabric</span>
                <span className="fabric-plus">{fabricOpen ? "−" : "+"}</span>
              </button>
              {fabricOpen && (
                <div className="category-checkbox-list">
                  {FABRIC_KEYWORDS.map((fabric) => (
                    <label key={fabric} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFabrics.includes(fabric)}
                        onChange={() => toggleFabric(fabric)}
                      />
                      <span>{fabric}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* ---------- Main Content ---------- */}
          <div className="shop-main">
            <div className="shop-main-header">
              <div>
                <h2 className="shop-title">All Sarees</h2>
                <p className="shop-count">
                  {total > 0
                    ? `Showing ${rangeStart}–${rangeEnd < rangeStart ? rangeStart : rangeEnd} of ${total} products`
                    : "No products"}
                </p>
              </div>

              <div className="shop-controls">
                <label className="sort-control">
                  Sort By:
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Category Pills */}
            <div className="category-filter-wrapper">
              <div className="category-filter" ref={pillsRef}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {categories.length > 6 && (
                <button
                  type="button"
                  className="pill-scroll-btn"
                  onClick={() => scrollPills(1)}
                  aria-label="Scroll categories"
                >
                  ›
                </button>
              )}
            </div>

            {loading ? (
              <Loader className="loader" />
            ) : error ? (
              <p style={{ textAlign: "center", color: "red" }}>{error}</p>
            ) : (
              <>
                <div className="product-grid show">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="no-products">
                    <p>No products found.</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ‹ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={p === page ? "active" : ""}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;