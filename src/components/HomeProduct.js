import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Mainpro.css";

/* =========================================================
   IMAGE SOURCES
   Bestsellers + Shop By Occasion use Unsplash stock photography
   (swap these for your own product shoots whenever you're ready —
   just replace the URL string, everything else keeps working).
   ========================================================= */

const API_URL = process.env.REACT_APP_API_URL;

const IMG = {
  saree1: "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=800&q=80",
  saree2: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
  saree3: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?auto=format&fit=crop&w=800&q=80",
  saree4: "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=800&q=80",
  saree5: "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=800&q=80",
  saree6: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  saree7: "https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?auto=format&fit=crop&w=800&q=80",
  saree8: "https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?auto=format&fit=crop&w=800&q=80",
  saree9: "https://images.unsplash.com/photo-1610030469668-8e9f641aaf27?auto=format&fit=crop&w=800&q=80",
  saree10: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=800&q=80",

  occ1: "/ass/m1.jpg",
  occ2: "/ass/b1.jpg",
  occ3: "/ass/o1.jpg",
  occ4: "/ass/p1.jpg",
  occ5: "/ass/f1.jpg",
  occ6: "/ass/jw1.jpg",
  occ7: "/ass/sim.jpg",
  occ8: "/ass/ear1.jpg",
  occ9: "https://images.unsplash.com/photo-1638617501607-5dfb8b079ebf?auto=format&fit=crop&w=800&q=80",
  occ10: "https://images.unsplash.com/photo-1600862754152-80a263dd564f?auto=format&fit=crop&w=800&q=80",

  bannerSaree: "/ass/banner.jpg",
  bannerJewelry: "/ass/ban-jew.png",
};

/* Static "Our Bestsellers" — 10 items */
const products = [
  { id: 1, name: "Navy Blue Crepe Saree", price: "₹4,949", image: IMG.saree1, isNew: true },
  { id: 2, name: "Hot Pink Georgette Saree", price: "₹22,109", image: IMG.saree2, isNew: true },
  { id: 3, name: "Silver Banarasi Tissue Saree", price: "₹16,829", image: IMG.saree3 },
  { id: 4, name: "Burgundy Bandhani Silk Saree", price: "₹10,119", image: IMG.saree4 },
  { id: 5, name: "Emerald Green Kanjivaram Saree", price: "₹18,499", image: IMG.saree5, isNew: true },
  { id: 6, name: "Maroon Tussar Silk Saree", price: "₹8,299", image: IMG.saree6 },
  { id: 7, name: "Ivory Organza Saree", price: "₹6,749", image: IMG.saree7 },
  { id: 8, name: "Rose Gold Chiffon Saree", price: "₹9,199", image: IMG.saree8, isNew: true },
  { id: 9, name: "Mustard Yellow Cotton Saree", price: "₹3,899", image: IMG.saree9 },
  { id: 10, name: "Sapphire Blue Silk Saree", price: "₹14,599", image: IMG.saree10 },
];

/* Static "Shop By Occasion" — 10 items */
const productss = [
  { id: 1, name: "Maternity Wear", image: IMG.occ1 },
  { id: 2, name: "Wedding Collection", image: IMG.occ2 },
  { id: 3, name: "Office Wear", image: IMG.occ3 },
  { id: 4, name: "Party Wear Sarees", image: IMG.occ4 },
  { id: 5, name: "Festive Edit", image: IMG.occ5 },
  { id: 6, name: "Engagement Special", image: IMG.occ6 },
  { id: 7, name: "Everyday Jewelry", image: IMG.occ7 },
  { id: 8, name: "Earrings", image: IMG.occ8 },
  { id: 9, name: "Bridal Jewelry", image: IMG.occ9 },
  { id: 10, name: "Statement Necklaces", image: IMG.occ10 },
];

/* Feature strip content */
const features = [
  {
    title: "Premium Quality",
    text: "A curated edit of silk sarees and handcrafted jewelry",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Fast Shipping",
    text: "Free delivery on orders above ₹4,000",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 7h11v9H3z" strokeLinejoin="round" />
        <path d="M14 10h4l3 3v3h-7z" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    title: "Secure Payment",
    text: "100% protected checkout — cards, UPI & wallets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Customer Care",
    text: "Here for you Monday through Saturday",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H4z" />
        <path d="M20 12v4a2 2 0 0 1-2 2h-1v-6h3z" />
      </svg>
    ),
  },
];

/* Helper: format a numeric/string price into ₹ with thousands separators */
const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const HomeProduct = () => {
  const [hotLoom, setHotLoom] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotLoom = async () => {
      try {
        const res = await fetch(`${API_URL}/products/get-products`);

        if (!res.ok) {
          throw new Error("API response not OK");
        }

        const data = await res.json();

        const loomProducts = Array.isArray(data.products)
          ? data.products.filter(
              (item) => item.loom === true && item.status === "active"
            )
          : [];

        setHotLoom(loomProducts);
      } catch (error) {
        console.error("Error fetching Hot of the Loom products:", error);
        setHotLoom([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotLoom();
  }, []);

  return (
    <section className="homeproduct-section" id="offers">
      {/* Hot of the Loom — live API data, 5 per row */}
      <div className="section-heading">
        <span className="eyebrow">Fresh Off The Loom</span>
        <h2>Hot of the Loom</h2>
        <div className="ornament">
          <span className="ornament-line" />
          <span className="ornament-dot">✦</span>
          <span className="ornament-line" />
        </div>
      </div>

      <div className="homeproduct-grid grid-5">
        {loading ? (
          <p className="state-msg">Loading products...</p>
        ) : hotLoom.length > 0 ? (
          hotLoom.map((product) => {
            // Actual API shape: id (not _id), and image lives inside
            // attributes[0].image_url (there's no top-level `image` field).
            const firstAttr =
              Array.isArray(product.attributes) && product.attributes.length > 0
                ? product.attributes[0]
                : null;

            const imageUrl = firstAttr?.image_url || "/ass/placeholder.jpg";

            const hasOffer =
              product.offerPrice &&
              Number(product.offerPrice) < Number(product.price);

            return (
              <div key={product.id} className="homeproduct-card">
                {product.isNewArrival && <span className="badge-new">NEW</span>}

                <div className="image-wrap">
                  <img
                    src={imageUrl}
                    alt={product.name || "Saree"}
                    width={350}
                    height={500}
                    className="product-image"
                  />
                  <div className="hover-overlay">
                    <Link to={`/product/${product.id}`}>
                      <button className="view-product-btn">View Product</button>
                    </Link>
                  </div>
                </div>

                <div className="product-infos">
                  <h3>{product.name}</h3>
                  {hasOffer ? (
                    <p className="price">
                      <span className="price-offer">
                        {formatPrice(product.offerPrice)}
                      </span>{" "}
                      <span className="og-price">
                        {formatPrice(product.price)}
                      </span>
                    </p>
                  ) : (
                    <p className="price">{formatPrice(product.price)}</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="state-msg">No Hot Loom products available at the moment.</p>
        )}
      </div>

      {/* <div className="view-all-wrap">
        <Link to="/product" className="pill-btn">
          View Full Boutique →
        </Link>
      </div> */}

      {/* Shop By Occasion — 10 items */}
      <div className="wrap">
        <div className="section-heading">
          <span className="eyebrow">Curated Edits</span>
          <h2>Shop By Occasion</h2>
          <div className="ornament">
            <span className="ornament-line" />
            <span className="ornament-dot">✦</span>
            <span className="ornament-line" />
          </div>
        </div>

        <div className="homeproduct-grid grid-5">
          {productss.map((item) => (
            <div key={item.id} className="homeproduct-card card-border">
              <div className="image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  width={350}
                  height={500}
                  className="product-image"
                />
                <div className="hover-overlay">
                  <Link to="/product">
                    <button className="view-product-btn">View Product</button>
                  </Link>
                </div>
              </div>

              <div className="product-infos">
                <h3>{item.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="view-all-wrap">
          <Link to="/product" className="pill-btn">
            View Full Boutique →
          </Link>
        </div> */}
      </div>

      {/* Our Bestsellers — 10 items */}
      <div className="wrap">
        <div className="section-heading">
          <span className="eyebrow">Customer Favorites</span>
          <h2>Our Bestsellers</h2>
          <div className="ornament">
            <span className="ornament-line" />
            <span className="ornament-dot">✦</span>
            <span className="ornament-line" />
          </div>
        </div>

        <div className="homeproduct-grid grid-5">
          {products.map((item) => (
            <div key={item.id} className="homeproduct-card">
              {item.isNew && <span className="badge-new">NEW</span>}

              <div className="image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  width={350}
                  height={500}
                  className="product-image"
                />
                <div className="hover-overlay">
                  <Link to="/product">
                    <button className="view-product-btn">View Product</button>
                  </Link>
                </div>
              </div>

              <div className="product-infos">
                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dual banner — Sarees / Jewelry */}
      <div className="banner-duo">
        <div
          className="banner-card"
          style={{ backgroundImage: `url(${IMG.bannerSaree})` }}
        >
          <div className="banner-contents">
            <span className="banner-eyebrow">Collection</span>
            <h3>Sarees</h3>
            <p>Discover our traditional and elegant sarees.</p>
            <Link to="/product" className="banner-btn">
              Discover
            </Link>
          </div>
        </div>

        <div
          className="banner-card"
          style={{ backgroundImage: `url(${IMG.bannerJewelry})` }}
        >
          <div className="banner-contents">
            <span className="banner-eyebrow">Indian</span>
            <h3>Jewelry</h3>
            <p>Jhumkas, necklaces and more to elevate your style.</p>
            <Link to="/product" className="banner-btn">
              Discover
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProduct;