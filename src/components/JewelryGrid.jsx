import React, { useEffect, useMemo, useState, useRef } from "react";
import JewelryCard from "./JewelryCard";
import { useSearch } from "../context/SearchContext";
import "../styles/JewelryGrid.css";
import Loader from "./Loader";

// Jewelry runs at a very different price scale than sarees (₹20k–₹1L+),
// so these presets/defaults are jewelry-specific — do not reuse the
// saree grid's ₹999-scale values here.
const PRICE_PRESETS = [
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000 - ₹75,000", min: 25000, max: 75000 },
  { label: "₹75,000 - ₹1,50,000", min: 75000, max: 150000 },
  { label: "Above ₹1,50,000", min: 150000, max: Infinity },
];

const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 200000;

const API_URL = process.env.REACT_APP_API_URL;

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
];

const CATEGORY_VISIBLE_LIMIT = 6;
const PAGE_SIZE = 16;

// The API doesn't return a rating field yet, but JewelryCard reads
// product.rating to fill stars. This derives a stable per-product
// rating (won't reshuffle on re-render) so the card shows real stars
// instead of always empty ones. Delete this once the API adds ratings.
const withRating = (product) => {
  if (product.rating) return product;
  const rating = 3.9 + ((product.id * 7) % 11) / 10; // 3.9 - 4.9
  return { ...product, rating: Math.min(rating, 5) };
};

const JewelryGrid = ({ onViewDetails }) => {
  const { searchTerm, setSearchTerm } = useSearch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  // Jewelry attributes carry `metal` (Gold/Silver), not `color` — the
  // API always sends color: null for jewels. This filter reads metal.
  const [selectedMetal, setSelectedMetal] = useState("All");

  const [showAllCategories, setShowAllCategories] = useState(false);

  const [priceMin, setPriceMin] = useState(DEFAULT_PRICE_MIN);
  const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX);
  const [activePreset, setActivePreset] = useState(null);

  // Custom min/max entry fields — user must enter Min first, and Max
  // must be at least ₹10 higher than Min before it's accepted.
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [priceError, setPriceError] = useState("");

  const [sortBy, setSortBy] = useState("popularity");

  const pillsRef = useRef(null);

  // Fetch the full jewelry list once. Filtering + pagination below are
  // handled entirely on the client so the sidebar filters, price range
  // and the 16-per-page grid all work off the same data set.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/products/get-jewels`);
        if (!res.ok) throw new Error("API response not OK");

        const data = await res.json();
        console.log(data);

        const activeProducts = Array.isArray(data.products)
          ? data.products.filter((item) => item.status === "active")
          : [];

        setProducts(activeProducts);
      } catch (err) {
        console.error("Failed to fetch jewelry:", err);
        setError("Unable to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // NOTE: category object's field is `name` (not `category`) —
  // { id, name, collection } — so every lookup below reads
  // product.category?.name.
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category?.name).filter(Boolean))],
    [products]
  );

  // Subcategories only make sense once a category is picked, so this
  // list (and the sidebar block for it) stays empty on "All".
  const subcategories = useMemo(() => {
    if (selectedCategory === "All") return [];
    const pool = products.filter((p) => p.category?.name === selectedCategory);
    return [...new Set(pool.map((p) => p.subcategory?.name).filter(Boolean))];
  }, [products, selectedCategory]);

  // Metals only make sense once a subcategory is picked — mirrors the
  // saree grid's color step, but reads attributes[].metal since
  // jewelry attributes don't populate color.
  const metals = useMemo(() => {
    if (selectedSubcategory === "All") return [];
    const pool = products.filter(
      (p) =>
        p.category?.name === selectedCategory && p.subcategory?.name === selectedSubcategory
    );
    const all = pool.flatMap((p) => (p.attributes || []).map((a) => a.metal).filter(Boolean));
    return [...new Set(all)];
  }, [products, selectedCategory, selectedSubcategory]);

  const visibleSidebarCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_VISIBLE_LIMIT);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
    setSelectedMetal("All");
    setPage(1);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory((prev) => (prev === subcategory ? "All" : subcategory));
    setSelectedMetal("All");
    setPage(1);
  };

  const handleMetalSelect = (metal) => {
    setSelectedMetal((prev) => (prev === metal ? "All" : metal));
    setPage(1);
  };

  const applyPreset = (preset) => {
    setMinInput("");
    setMaxInput("");
    setPriceError("");
    if (activePreset?.label === preset.label) {
      setActivePreset(null);
      setPriceMin(DEFAULT_PRICE_MIN);
      setPriceMax(DEFAULT_PRICE_MAX);
      return;
    }
    setActivePreset(preset);
    setPriceMin(preset.min);
    setPriceMax(preset.max === Infinity ? DEFAULT_PRICE_MAX : preset.max);
    setPage(1);
  };

  // Custom price entry: Min must be filled in first, then Max must be
  // at least ₹10 above Min.
  const applyCustomPrice = () => {
    if (minInput === "") {
      setPriceError("Please enter a minimum price first.");
      return;
    }
    const min = Number(minInput);
    if (Number.isNaN(min) || min < 0) {
      setPriceError("Enter a valid minimum price.");
      return;
    }
    if (maxInput === "") {
      setPriceError("Now enter a maximum price.");
      return;
    }
    const max = Number(maxInput);
    if (Number.isNaN(max) || max <= min + 10) {
      setPriceError(`Maximum price must be at least ₹${min + 10}.`);
      return;
    }

    setPriceError("");
    setActivePreset(null);
    setPriceMin(min);
    setPriceMax(max);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSelectedMetal("All");
    setPriceMin(DEFAULT_PRICE_MIN);
    setPriceMax(DEFAULT_PRICE_MAX);
    setActivePreset(null);
    setMinInput("");
    setMaxInput("");
    setPriceError("");
    setSearchTerm("");
    setSortBy("popularity");
    setPage(1);
  };

  const scrollPills = (dir) => {
    if (!pillsRef.current) return;
    pillsRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const desc = product.desc?.toLowerCase() || "";
      const category = product.category?.name?.toLowerCase() || "";
      const search = searchTerm?.toLowerCase() || "";
      const price = parseFloat(product.offerPrice || product.price) || 0;

      const matchCategory =
        selectedCategory === "All" || product.category?.name === selectedCategory;

      const matchSubcategory =
        selectedSubcategory === "All" || product.subcategory?.name === selectedSubcategory;

      const matchMetal =
        selectedMetal === "All" ||
        (product.attributes || []).some(
          (a) => a.metal?.toLowerCase() === selectedMetal.toLowerCase()
        );

      const matchSearch =
        !search || name.includes(search) || category.includes(search) || desc.includes(search);

      const matchPrice = price >= priceMin && price <= priceMax;

      return matchCategory && matchSubcategory && matchMetal && matchSearch && matchPrice;
    });

    switch (sortBy) {
      case "price_low":
        list = [...list].sort(
          (a, b) =>
            (parseFloat(a.offerPrice || a.price) || 0) - (parseFloat(b.offerPrice || b.price) || 0)
        );
        break;
      case "price_high":
        list = [...list].sort(
          (a, b) =>
            (parseFloat(b.offerPrice || b.price) || 0) - (parseFloat(a.offerPrice || a.price) || 0)
        );
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
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedMetal,
    searchTerm,
    priceMin,
    priceMax,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const total = filteredProducts.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <section className="product-section" id="jewelry">
      {/* ---------- Hero Banner ---------- */}
      <div className="saree-banner">
        <img
          className="banner-image"
          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1920&auto=format&fit=crop"
          alt="Jewelry collection"
          loading="eager"
        />
        <div className="banner-overlay" />
        <div className="banner-content">
          <p className="banner-breadcrumb">
            <span>Home</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Jewelry</span>
          </p>
          <h1 className="banner-title">Exquisite Jewelry Collection</h1>
          <p className="banner-subtitle">
            Handpicked earrings, necklaces and bangles for every occasion.
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

            {/* Price Range */}
            <div className="filter-block">
              <p className="filter-block-title">Price Range</p>

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

              <div className="price-custom-row">
                <input
                  type="number"
                  className="price-custom-input"
                  placeholder="Min ₹"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  min={0}
                />
                <span className="price-custom-sep">–</span>
                <input
                  type="number"
                  className="price-custom-input"
                  placeholder="Max ₹"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  disabled={minInput === ""}
                  min={0}
                />
              </div>
              <button type="button" className="price-apply-btn" onClick={applyCustomPrice}>
                Apply
              </button>
              {priceError && <p className="price-error">{priceError}</p>}
            </div>

            {/* Categories */}
            <div className="filter-block">
              <p className="filter-block-title">Categories</p>
              <div className="category-checkbox-list">
                {visibleSidebarCategories.map((category) => (
                  <label key={category} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category}
                      onChange={() => handleCategorySelect(category)}
                    />
                    <span>{category === "All" ? "All Jewelry" : category}</span>
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

            {/* Subcategory — only appears once a category is picked */}
            {selectedCategory !== "All" && subcategories.length > 0 && (
              <div className="filter-block">
                <p className="filter-block-title">Subcategory</p>
                <div className="category-checkbox-list">
                  {subcategories.map((sub) => (
                    <label key={sub} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSubcategory === sub}
                        onChange={() => handleSubcategorySelect(sub)}
                      />
                      <span>{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Metal — only appears once a subcategory is picked */}
            {selectedSubcategory !== "All" && metals.length > 0 && (
              <div className="filter-block">
                <p className="filter-block-title">Metal</p>
                <div className="category-checkbox-list">
                  {metals.map((metal) => (
                    <label key={metal} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMetal === metal}
                        onChange={() => handleMetalSelect(metal)}
                      />
                      <span>{metal}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ---------- Main Content ---------- */}
          <div className="shop-main">
            <div className="shop-main-header">
              <div>
                <h2 className="shop-title">All Jewelry</h2>
                <p className="shop-count">
                  {total > 0
                    ? `Showing ${rangeStart}–${rangeEnd} of ${total} products`
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
                    onClick={() => handleCategorySelect(category)}
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
                  {paginatedProducts.map((product) => (
                    // Double-click opens the full product modal.
                    <div key={product.id} onDoubleClick={() => onViewDetails(product)}>
                      <JewelryCard product={product} onViewDetails={onViewDetails} />
                    </div>
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
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ‹ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={p === currentPage ? "active" : ""}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
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

export default JewelryGrid;