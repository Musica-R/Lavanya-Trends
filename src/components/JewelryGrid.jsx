import React, { useEffect, useMemo, useState, useRef } from "react";
import JewelryCard from "./JewelryCard";
import { useSearch } from "../context/SearchContext";
import "../styles/JewelryGrid.css";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

// Jewelry runs at a very different price scale than sarees (₹20k–₹1L+),
// so these presets are jewelry-specific — do not reuse the saree
// grid's ₹999-scale values here.
const PRICE_PRESETS = [
  { label: "Under ₹25,000", min: 0, max: 25000 },
  { label: "₹25,000 - ₹75,000", min: 25000, max: 75000 },
  { label: "₹75,000 - ₹1,50,000", min: 75000, max: 150000 },
  { label: "Above ₹1,50,000", min: 150000, max: Infinity },
];

const API_URL = process.env.REACT_APP_API_URL || "https://sarees-backend-9wq0.onrender.com";

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

// The API doesn't return a rating field yet, but JewelryCard reads
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

const JewelryGrid = () => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();

  // Logged-in user's id, read once on mount from localStorage. Falls
  // back to null if nothing is stored / parsing fails — favorites just
  // won't load or save until the user is logged in.
  const [currentUserId] = useState(getCurrentUserId);

  // ---- Full catalog, fetched once ----
  // Same fix as the saree grid: /products/get-jewels doesn't actually
  // filter by categoryId/subcategoryId server-side, it just paginates
  // the whole jewel table regardless of query params. So we pull the
  // entire jewelry catalog once and do filtering, sorting AND
  // pagination ourselves client-side below — that's the only way a
  // category/subcategory filter reliably finds matching products no
  // matter which server "page" they'd otherwise land on.
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // ---- Categories / subcategories ----
  // Sourced from their own endpoints (/category/get-categories,
  // /category/get-subcategories), filtered to collection === "JEWEL",
  // instead of being derived from whatever products happen to be on
  // the current page. Mirrors the saree grid fix: a subcategory with
  // no items on the current page shouldn't silently disappear from
  // the filter list.
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [subcategoriesAll, setSubcategoriesAll] = useState([]); // [{id, name, categoryId}]

  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("All");
  // Jewelry attributes carry `metal` (Gold/Silver), not `color` — the
  // API always sends color: null for jewels. This filter reads metal.
  const [selectedMetal, setSelectedMetal] = useState("All");

  const [showAllCategories, setShowAllCategories] = useState(false);

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
  // Set of productIds the current user has favorited (jewelry only).
  const [favorites, setFavorites] = useState(() => new Set());
  // Tracks in-flight requests per productId so rapid double-clicks
  // don't fire duplicate add/remove calls for the same product.
  const [favoritePending, setFavoritePending] = useState(() => new Set());

  const pillsRef = useRef(null);

  // Fetch the full category list once on mount, filtered to the
  // JEWEL collection so Cotton Saree / 3D Embossed Saree etc. never
  // leak into this grid's sidebar.
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
            .filter((c) => c.status === "active" && c.collection === "JEWEL")
            .map((c) => ({ id: c.id, name: c.name })),
        ]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([ALL_CATEGORY]);
      }
    };

    fetchCategories();
  }, []);

  // Fetch the full subcategory list once on mount, same reasoning as
  // categories above. Filtered down to the selected category client-side,
  // and restricted to categoryIds that belong to the JEWEL collection.
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category/get-subcategories`);
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : [];
        setSubcategoriesAll(
          list
            .filter((s) => s.status === "active" && s.collection === "JEWEL")
            .map((s) => ({ id: s.id, name: s.name, categoryId: s.categoryId }))
        );
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategoriesAll([]);
      }
    };

    fetchSubcategories();
  }, []);

  // Fetch the ENTIRE jewelry catalog once, by walking every server
  // page. Runs once on mount — no dependency on page/filters, because
  // filtering/pagination now happen entirely below in filteredProducts
  // + paginatedProducts.
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const firstRes = await fetch(
          `${API_URL}/products/get-jewels?page=1&limit=${PAGE_SIZE}`
        );
        if (!firstRes.ok) throw new Error("API response not OK");
        const firstData = await firstRes.json();

        let combined = Array.isArray(firstData.products) ? firstData.products : [];
        const totalPagesFromApi = firstData.totalPages ?? 1;

        // Walk any remaining server pages so we end up with the full
        // catalog in memory, regardless of how the server paginates it.
        for (let p = 2; p <= totalPagesFromApi; p++) {
          const res = await fetch(
            `${API_URL}/products/get-jewels?page=${p}&limit=${PAGE_SIZE}`
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
        console.error("Failed to fetch jewelry:", err);
        setError("Unable to load products. Please try again later.");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Fetch the user's already-favorited jewelry once on mount (or
  // whenever currentUserId becomes available), so a piece that was
  // favorited in an earlier session still shows a red (filled) heart
  // on load instead of starting empty every time.
  // Filtered to productType "jewel" since the same endpoint also
  // returns saree favorites for this user, and product ids can
  // overlap across the two tables.
  useEffect(() => {
    if (!currentUserId) return; // not logged in — nothing to fetch

    const fetchFavorites = async () => {
      try {
        const res = await fetch(
          `${API_URL}/favourites/my-favorites?userId=${currentUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch favorites");

        const data = await res.json();
        const favoriteIds = Array.isArray(data.data)
          ? data.data
              .filter((fav) => fav.productType?.toLowerCase() === "jewel")
              .map((fav) => fav.productId)
          : [];

        setFavorites(new Set(favoriteIds));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        // Leave favorites empty on failure rather than blocking the page.
      }
    };

    fetchFavorites();
  }, [currentUserId]);

  // Subcategories only make sense once a category is picked, so this
  // list (and the sidebar block for it) stays empty on "All". Sourced
  // from the full subcategory list fetched above, not from `products`.
  const subcategories = useMemo(() => {
    if (selectedCategoryId === "All") return [];
    return subcategoriesAll.filter((s) => s.categoryId === selectedCategoryId);
  }, [subcategoriesAll, selectedCategoryId]);

  // Metals only make sense once a subcategory is picked — derived from
  // the full catalog, scoped to the selected category/subcategory, not
  // just whatever happened to be on the current server page.
  const metals = useMemo(() => {
    if (selectedSubcategoryId === "All") return [];
    const pool = allProducts.filter(
      (p) => p.categoryId === selectedCategoryId && p.subcategoryId === selectedSubcategoryId
    );
    const all = pool.flatMap((p) => (p.attributes || []).map((a) => a.metal).filter(Boolean));
    return [...new Set(all)];
  }, [allProducts, selectedCategoryId, selectedSubcategoryId]);

  const visibleSidebarCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_VISIBLE_LIMIT);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("All");
    setSelectedMetal("All");
    setPage(1);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategoryId((prev) => (prev === subcategoryId ? "All" : subcategoryId));
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
      // Toggling the same preset off removes the price filter entirely
      // — back to showing everything.
      setActivePreset(null);
      setPriceRange(null);
      return;
    }
    setActivePreset(preset);
    setPriceRange({ min: preset.min, max: preset.max });
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
    setPriceRange({ min, max });
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategoryId("All");
    setSelectedSubcategoryId("All");
    setSelectedMetal("All");
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

  // ---- Favorite toggle: add-favorites (POST) / remove-favorites (GET) ----
  // Optimistically flips the heart immediately, then calls the right
  // endpoint. If the request fails, the heart reverts back.
  const toggleFavorite = async (product) => {
    if (!currentUserId) {
      console.warn("No logged-in user id found in localStorage; can't toggle favorite.");
      return;
    }

    const productId = product.id;

    // Ignore clicks while a request for this product is already in flight.
    if (favoritePending.has(productId)) return;

    const wasFavorite = favorites.has(productId);

    // Optimistic UI update — fill/unfill the heart right away.
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(productId);
      else next.add(productId);
      return next;
    });

    setFavoritePending((prev) => new Set(prev).add(productId));

    try {
      if (wasFavorite) {
        // Was already a favorite -> remove it.
        const res = await fetch(
          `${API_URL}/favourites/remove-favorites?userId=${currentUserId}&productId=${productId}&productType=jewel`,
          { method: "GET" }
        );
        if (!res.ok) throw new Error("Failed to remove favorite");
      } else {
        // Not a favorite yet -> add it.
        const res = await fetch(`${API_URL}/favourites/add-favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            productId,
            productType: "JEWEL",
          }),
        });
        if (!res.ok) throw new Error("Failed to add favorite");
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
      // Revert the optimistic update since the API call failed.
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
  // not just whatever page the server happened to send — this is what
  // fixes categories/subcategories whose matching items sit on a
  // different server page than the one currently loaded.
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const desc = product.desc?.toLowerCase() || "";
      const category = product.category?.name?.toLowerCase() || "";
      const search = searchTerm?.toLowerCase() || "";
      const price = parseFloat(product.offerPrice || product.price) || 0;

      const matchCategory =
        selectedCategoryId === "All" || product.categoryId === selectedCategoryId;

      const matchSubcategory =
        selectedSubcategoryId === "All" || product.subcategoryId === selectedSubcategoryId;

      const matchMetal =
        selectedMetal === "All" ||
        (product.attributes || []).some(
          (a) => a.metal?.toLowerCase() === selectedMetal.toLowerCase()
        );

      const matchSearch =
        !search || name.includes(search) || category.includes(search) || desc.includes(search);

      // No price filter selected yet → every product passes.
      const matchPrice =
        !priceRange || (price >= priceRange.min && price <= priceRange.max);

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
    allProducts,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedMetal,
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
                  <label key={category.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategoryId === category.id}
                      onChange={() => handleCategorySelect(category.id)}
                    />
                    <span>{category.id === "All" ? "All Jewelry" : category.name}</span>
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

            {/* Metal — only appears once a subcategory is picked */}
            {selectedSubcategoryId !== "All" && metals.length > 0 && (
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
                    <div
                      key={product.id}
                      onClick={() => navigate(`/jewelry/${product.id}`, { state: { product } })}
                    >
                      <JewelryCard
                        product={product}
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

export default JewelryGrid;