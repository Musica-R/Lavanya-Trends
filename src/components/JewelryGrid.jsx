import React, { useState } from "react";
import JewelryCard from "./JewelryCard";
import { useSearch } from "../context/SearchContext";
import "../styles/JewelryGrid.css";

// ✅ Static demo data — Unsplash images (no API call for jewelry page)
const JEWELRY_PRODUCTS = [
  {
    _id: "j1",
    name: "Gold Plated Jhumka Earrings",
    category: "Earrings",
    price: 899,
    discount: 20,
    rating: 4.5,
    desc: "Traditional gold plated jhumka earrings with intricate detailing, perfect for festive wear.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j2",
    name: "Kundan Drop Earrings",
    category: "Earrings",
    price: 1199,
    discount: 15,
    rating: 4.7,
    desc: "Elegant kundan drop earrings studded with faux pearls, ideal for weddings and parties.",
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j3",
    name: "Silver Hoop Earrings",
    category: "Earrings",
    price: 549,
    discount: 0,
    rating: 4.2,
    desc: "Minimal silver hoop earrings for everyday elegance.",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j4",
    name: "Temple Design Necklace Set",
    category: "Necklace",
    price: 2499,
    discount: 25,
    rating: 4.8,
    desc: "Antique temple design necklace set with matching earrings, crafted for South Indian bridal wear.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j5",
    name: "Pearl Layered Necklace",
    category: "Necklace",
    price: 1799,
    discount: 10,
    rating: 4.4,
    desc: "Multi-layered faux pearl necklace that adds a graceful touch to any outfit.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j6",
    name: "Ruby Studded Choker",
    category: "Necklace",
    price: 2999,
    discount: 18,
    rating: 4.6,
    desc: "Statement choker with ruby-red stone work, designed to pair beautifully with sarees.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j7",
    name: "Gold Plated Bangles Set",
    category: "Bangles",
    price: 1499,
    discount: 20,
    rating: 4.5,
    desc: "Set of 4 gold plated bangles with traditional engravings, perfect for festive occasions.",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j8",
    name: "Kada Bangle Pair",
    category: "Bangles",
    price: 1099,
    discount: 0,
    rating: 4.3,
    desc: "Bold kada-style bangle pair with a polished antique finish.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "j9",
    name: "Beaded Charm Bangles",
    category: "Bangles",
    price: 699,
    discount: 12,
    rating: 4.1,
    desc: "Colourful beaded bangles with tiny charm accents, great for everyday styling.",
    image: "https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?auto=format&fit=crop&w=800&q=80",
  },
];

const CATEGORIES = ["All", "Earrings", "Necklace", "Bangles"];

const JewelryGrid = ({ onViewDetails }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = JEWELRY_PRODUCTS.filter((product) => {
    const name = product.name?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const search = searchTerm?.toLowerCase() || "";

    const matchCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchSearch = name.includes(search) || category.includes(search);

    return matchCategory && matchSearch;
  });

  return (
    <section className="product-section jewelry-section" id="jewelry">
      <div className="product-container jewelry-container">
        {/* Header + Search */}
        <div className="search-wrapper">
          <div className="section-header">
            <p className="section-subtitle">
              Browse Our Exquisite Jewelry Collection
            </p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search earrings, necklace, bangles..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar + Grid Layout */}
        <div className="jewelry-layout">
          {/* Side Category List */}
          <aside className="jewelry-sidebar">
            <h4 className="jewelry-sidebar-title">Categories</h4>
            <ul className="jewelry-category-list">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <button
                    className={`jewelry-category-btn ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="jewelry-grid-wrap">
            <div className="product-grid show">
              {filteredProducts.map((product) => (
                <JewelryCard
                  key={product._id}
                  product={product}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JewelryGrid;
