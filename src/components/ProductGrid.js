import React, { useEffect, useMemo, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { useSearch } from "../context/SearchContext";
import "../styles/ProductGrid.css";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

const PRICE_PRESETS = [
  { label: "Under ₹999", min: 0, max: 999 },
  { label: "₹999 - ₹2999", min: 999, max: 2999 },
  { label: "₹2999 - ₹5999", min: 2999, max: 5999 },
  { label: "Above ₹5999", min: 5999, max: Infinity },
];

const API_URL = process.env.REACT_APP_API_URL || "https://mediumorchid-rhinoceros-818505.hostingersite.com";

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "discount", label: "Highest Discount" },
];

const CATEGORY_VISIBLE_LIMIT = 6;
const PAGE_SIZE = 12;

const ALL_CATEGORY = { id: "All", name: "All" };

// The API doesn't return a rating field yet, but ProductCard reads
// product.rating to fill stars. This derives a stable per-product
// rating (won't reshuffle on re-render) so the card shows real stars
// instead of always empty ones. Delete this once the API adds ratings.
const withRating = (product) => {
  if (product.rating) return product;
  const rating = 3.9 + ((product.id * 7) % 11) / 10; // 3.9 - 4.9
  return { ...product, rating: Math.min(rating, 5) };
};

// Reads the logged-in user's id out of localStorage. Adjust the key
// name below ("user") to match whatever key your login flow actually
// writes to (e.g. "userInfo", "authUser", etc.) if it's different.
const getCurrentUserId = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.id ?? null;
  } catch (err) {
    console.error("Failed to read user from localStorage:", err);
    return null;
  }
};

const ProductGrid = ({ onViewDetails }) => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();

  // Logged-in user's id, read once on mount from localStorage. Falls
  // back to null if nothing is stored / parsing fails — favorites just
  // won't load or save until the user is logged in.
  const [currentUserId] = useState(getCurrentUserId);

  // ---- Full catalog, fetched once ----
  // IMPORTANT: the backend's /products/get-sarees endpoint does NOT
  // actually filter by categoryId/subcategoryId — it just paginates
  // the whole table regardless of those query params (confirmed: a
  // response filtered to one subcategoryId still contains rows with
  // other subcategoryId values). So instead of asking the server to
  // filter+paginate, we pull the entire catalog once and do
  // filtering, sorting AND pagination ourselves below. This also
  // means a filter can never "silently" hide matching products that
  // happen to sit on a different server page.
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // ---- Categories / subcategories ----
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [subcategoriesAll, setSubcategoriesAll] = useState([]); // [{id, name, categoryId}]

  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);

  // No price filter is active until the user picks a preset or applies
  // a custom range — so every product shows by default, regardless of
  // price. `priceRange` is null = "show everything".
  const [priceRange, setPriceRange] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // Custom min/max entry fields — user must enter Min first, and Max
  // must be at least ₹10 higher than Min before it's accepted.
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [priceError, setPriceError] = useState("");

  const [sortBy, setSortBy] = useState("popularity");

  // ---- Favorites (heart button) state ----
  const [favorites, setFavorites] = useState(() => new Set());
  const [favoritePending, setFavoritePending] = useState(() => new Set());

  const pillsRef = useRef(null);

  // Fetch the full category list once on mount.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category/get-categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setCategories([
          ALL_CATEGORY,
          ...list
            .filter((c) => c.status === "active" && c.collection === "SAREE")
            .map((c) => ({ id: c.id, name: c.name })),
        ]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([ALL_CATEGORY]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch the full subcategory list once on mount.
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category/get-subcategories`);
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setSubcategoriesAll(
          list
            .filter((s) => s.status === "active")
            .map((s) => ({ id: s.id, name: s.name, categoryId: s.categoryId }))
        );
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategoriesAll([]);
      }
    };

    fetchSubcategories();
  }, []);

  // Fetch the ENTIRE saree catalog once, by walking every server page
  // with no categoryId/subcategoryId params (since the server ignores
  // them anyway). Runs once on mount — no dependency on page/filters,
  // because filtering/pagination now happen entirely below in
  // filteredProducts + paginatedProducts.
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const firstRes = await fetch(
          `${API_URL}/products/get-sarees?page=1&limit=${PAGE_SIZE}`
        );
        if (!firstRes.ok) throw new Error("API response not OK");
        const firstData = await firstRes.json();

        let combined = Array.isArray(firstData.products) ? firstData.products : [];
        const totalPagesFromApi = firstData.totalPages ?? 1;

        // Walk any remaining server pages so we end up with the full
        // catalog in memory, regardless of how the server paginates it.
        for (let p = 2; p <= totalPagesFromApi; p++) {
          const res = await fetch(
            `${API_URL}/products/get-sarees?page=${p}&limit=${PAGE_SIZE}`
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data.products)) {
            combined = combined.concat(data.products);
          }
        }

        const activeProducts = combined.filter((item) => item.status === "active");
        setAllProducts(activeProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Please try again later.");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Fetch the user's already-favorited products once on mount.
  useEffect(() => {
    if (!currentUserId) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch(
          `${API_URL}/favourites/my-favorites?userId=${currentUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch favorites");

        const data = await res.json();
        const favoriteIds = Array.isArray(data.data)
          ? data.data.map((fav) => fav.productId)
          : [];

        setFavorites(new Set(favoriteIds));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      }
    };

    fetchFavorites();
  }, [currentUserId]);

  const subcategories = useMemo(() => {
    if (selectedCategoryId === "All") return [];
    return subcategoriesAll.filter((s) => s.categoryId === selectedCategoryId);
  }, [subcategoriesAll, selectedCategoryId]);

  // Colors now derive from the full catalog, scoped to the selected
  // subcategory — not just whatever happened to be on the current page.
  const colors = useMemo(() => {
    if (selectedSubcategoryId === "All") return [];
    const inSubcategory = allProducts.filter(
      (p) => p.subcategoryId === selectedSubcategoryId
    );
    const all = inSubcategory.flatMap((p) =>
      (p.attributes || []).map((a) => a.color).filter(Boolean)
    );
    return [...new Set(all)];
  }, [allProducts, selectedSubcategoryId]);

  const visibleSidebarCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_VISIBLE_LIMIT);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("All");
    setSelectedColor("All");
    setPage(1);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategoryId((prev) => (prev === subcategoryId ? "All" : subcategoryId));
    setSelectedColor("All");
    setPage(1);
  };

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };
  const handleColorSelect = (color) => {
    setSelectedColor((prev) => (prev === color ? "All" : color));
    setPage(1);
  };

  const toggleFabric = (fabric) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
    setPage(1);
  };

  const applyPreset = (preset) => {
    setMinInput("");
    setMaxInput("");
    setPriceError("");
    if (activePreset?.label === preset.label) {
      setActivePreset(null);
      setPriceRange(null);
      return;
    }
    setActivePreset(preset);
    setPriceRange({ min: preset.min, max: preset.max });
    setPage(1);
  };

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
    setPriceRange({ min, max });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategoryId("All");
    setSelectedSubcategoryId("All");
    setSelectedColor("All");
    setSelectedFabrics([]);
    setPriceRange(null);
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

  const toggleFavorite = async (product) => {
    if (!currentUserId) {
      console.warn("No logged-in user id found in localStorage; can't toggle favorite.");
      return;
    }

    const productId = product.id;
    if (favoritePending.has(productId)) return;

    const wasFavorite = favorites.has(productId);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(productId);
      else next.add(productId);
      return next;
    });

    setFavoritePending((prev) => new Set(prev).add(productId));

    try {
      if (wasFavorite) {
        const res = await fetch(
          `${API_URL}/favourites/remove-favorites?userId=${currentUserId}&productId=${productId}&productType=saree`,
          { method: "GET" }
        );
        if (!res.ok) throw new Error("Failed to remove favorite");
      } else {
        const res = await fetch(`${API_URL}/favourites/add-favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            productId,
            productType: "SAREE",
          }),
        });
        if (!res.ok) throw new Error("Failed to add favorite");
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(productId);
        else next.delete(productId);
        return next;
      });
    } finally {
      setFavoritePending((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Filtering + sorting now run over the FULL catalog (allProducts),
  // not just whatever page the server happened to send. This is what
  // actually fixes the "Kanchi Cotton is on page 3 but I filtered on
  // page 1" bug — there's no server page to miss anymore.
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const desc = product.desc?.toLowerCase() || "";
      const search = searchTerm?.toLowerCase() || "";
      const price = parseFloat(product.offerPrice || product.price) || 0;

      const matchCategory =
        selectedCategoryId === "All" || product.categoryId === selectedCategoryId;

      const matchSubcategory =
        selectedSubcategoryId === "All" || product.subcategoryId === selectedSubcategoryId;

      const matchColor =
        selectedColor === "All" ||
        (product.attributes || []).some(
          (a) => a.color?.toLowerCase() === selectedColor.toLowerCase()
        );

      const matchFabric =
        selectedFabrics.length === 0 ||
        selectedFabrics.some((f) => name.includes(f.toLowerCase()) || desc.includes(f.toLowerCase()));

      const matchSearch =
        !search || name.includes(search) || desc.includes(search);

      const matchPrice =
        !priceRange || (price >= priceRange.min && price <= priceRange.max);

      return (
        matchCategory &&
        matchSubcategory &&
        matchColor &&
        matchFabric &&
        matchSearch &&
        matchPrice
      );
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
    allProducts,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedColor,
    selectedFabrics,
    searchTerm,
    priceRange,
    sortBy,
  ]);

  // Pagination is now purely client-side, sliced from the filtered
  // (not raw) list — so page count always matches what's actually
  // being shown under the current filters.
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const total = filteredProducts.length;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredProducts, currentPage]
  );

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
                  <label key={category.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategoryId === category.id}
                      onChange={() => handleCategorySelect(category.id)}
                    />
                    <span>{category.id === "All" ? "All Sarees" : category.name}</span>
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
            {selectedCategoryId !== "All" && subcategories.length > 0 && (
              <div className="filter-block">
                <p className="filter-block-title">Subcategory</p>
                <div className="category-checkbox-list">
                  {subcategories.map((sub) => (
                    <label key={sub.id} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSubcategoryId === sub.id}
                        onChange={() => handleSubcategorySelect(sub.id)}
                      />
                      <span>{sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Color — only appears once a subcategory is picked */}
            {/* {selectedSubcategoryId !== "All" && colors.length > 0 && (
              <div className="filter-block">
                <p className="filter-block-title">Color</p>
                <div className="category-checkbox-list">
                  {colors.map((color) => (
                    <label key={color} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedColor === color}
                        onChange={() => handleColorSelect(color)}
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )} */}
          </aside>

          {/* ---------- Main Content ---------- */}
          <div className="shop-main">
            <div className="shop-main-header">
              <div>
                <h2 className="shop-title">All Sarees</h2>
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
                    key={category.id}
                    className={`category-btn ${selectedCategoryId === category.id ? "active" : ""}`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.id === "All" ? "All" : category.name}
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
                    <div key={product.id} onDoubleClick={() => handleViewDetails(product)}>
                      <ProductCard
                        product={product}
                        onViewDetails={handleViewDetails}
                        isFavorite={favorites.has(product.id)}
                        onToggleFavorite={() => toggleFavorite(product)}
                      />
                    </div>
                  ))}
                </div>

                {paginatedProducts.length === 0 && (
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

export default ProductGrid;