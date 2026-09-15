import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/JewelryDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "https://mediumorchid-rhinoceros-818505.hostingersite.com";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const JewelryDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Came from the grid (row already has the product) — instant, no refetch.
  const [currentProduct, setCurrentProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [quantity, setQuantity] = useState(1);
  const [activeAttrIndex, setActiveAttrIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Fallback: direct link / refresh / back-forward without state —
  // jewelry uses a paginated endpoint, so we page through it looking
  // for the id instead of assuming one flat products array.
  useEffect(() => {
    if (currentProduct && String(currentProduct.id) === String(id)) return;

    let cancelled = false;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        let found = null;
        let page = 1;
        const limit = 50;

        // Walk pages until we find the item or run out of pages.
        // Bounded to avoid an infinite loop if the API misbehaves.
        for (let i = 0; i < 40 && !found; i++) {
          const res = await fetch(`${API_URL}/products/get-jewels?page=${page}&limit=${limit}`);
          if (!res.ok) throw new Error("API response not OK");
          const data = await res.json();
          const list = Array.isArray(data.products) ? data.products : [];
          found = list.find((p) => String(p.id) === String(id)) || null;

          const totalPages =
            data.totalPages ?? data.pages ?? Math.ceil((data.total ?? list.length) / limit);
          if (list.length === 0 || page >= totalPages) break;
          page += 1;
        }

        if (!cancelled) setCurrentProduct(found || null);
      } catch (err) {
        console.error("Failed to load jewelry item:", err);
        if (!cancelled) setCurrentProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    setActiveAttrIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentProduct]);

  useEffect(() => {
    if (!currentProduct) return;

    let cancelled = false;

    const fetchRelated = async () => {
      try {
        setRelatedLoading(true);
        const res = await fetch(`${API_URL}/products/get-jewels?page=1&limit=12`);
        if (!res.ok) throw new Error("API response not OK");
        const data = await res.json();

        const pool = Array.isArray(data.products)
          ? data.products.filter((p) => p.status === "active" && p.id !== currentProduct.id)
          : [];

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        if (!cancelled) setRelatedProducts(shuffled.slice(0, 5));
      } catch (err) {
        console.error("Failed to load related jewelry:", err);
        if (!cancelled) setRelatedProducts([]);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    };

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [currentProduct]);

  const attributes = currentProduct?.attributes || [];
  const thumbnails = attributes; // show all variant thumbnails, no cap

  const activeAttribute = attributes[activeAttrIndex] || attributes[0];
  const mainImage = activeAttribute?.image_url;

  const handleAddToCart = () => {
    addToCart(currentProduct, quantity, activeAttribute);
  };

  const handleSelectRelated = (relatedProduct) => {
    navigate(`/jewelry/${relatedProduct.id}`, { state: { product: relatedProduct } });
  };

  if (loading) {
    return (
      <div className="jewelry-detail-page">
        <p className="jewelry-detail-loading">Loading product…</p>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="jewelry-detail-page">
         <br /><br /><br />
        <p className="jewelry-detail-loading">Product not found.</p>
        <button className="jewelry-detail-back-btn" onClick={() => navigate("/jew")}>
          ‹ Back to Jewelry
        </button>
      </div>
    );
  }

  const price = parseFloat(currentProduct.price) || 0;
  const offerPrice = currentProduct.offerPrice ? parseFloat(currentProduct.offerPrice) : null;
  const hasDiscount = offerPrice !== null && offerPrice < price;

  return (
    <div className="jewelry-detail-page">
      <div className="jewelry-detail-container">
        <button className="jewelry-detail-back-btn" onClick={() => navigate(-1)}>
          ‹ Back
        </button>

        <div className="jewelry-detail-body">
          <div>
            <div className="jewelry-detail-image-container">
              <img
                src={mainImage}
                alt={currentProduct.name}
                className="jewelry-detail-image"
                width={500}
                height={500}
              />
            </div>

            {thumbnails.length > 0 && (
              <div className="jewelry-detail-thumbnail-row">
                {thumbnails.map((attr, index) => (
                  <button
                    key={attr.id}
                    type="button"
                    className={`jewelry-detail-thumbnail-btn ${
                      index === activeAttrIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveAttrIndex(index)}
                    title={attr.metal || `Option ${index + 1}`}
                  >
                    <img src={attr.image_url} alt={attr.metal || currentProduct.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="jewelry-detail-details">
            <span className="jewelry-detail-category">
              {currentProduct.category?.name || currentProduct.category?.category}
            </span>
            <h1 className="jewelry-detail-title">{currentProduct.name}</h1>

            <div className="jewelry-detail-rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={index < Math.floor(currentProduct.rating || 4) ? "star filled" : "star"}
                >
                  {" "}
                  ⭐{" "}
                </span>
              ))}
              <span className="rating-number">({(currentProduct.rating || 4).toFixed(1)})</span>
            </div>

            {activeAttribute?.metal && (
              <p className="jewelry-detail-metal-label">
                Metal: <strong>{activeAttribute.metal}</strong>
              </p>
            )}

            <p className="jewelry-detail-description">{currentProduct.desc}</p>

            <div className="jewelry-detail-price-row">
              <span className="jewelry-detail-price">
                {formatINR(hasDiscount ? offerPrice : price)}
              </span>
              {hasDiscount && (
                <span className="jewelry-detail-price-original">{formatINR(price)}</span>
              )}
            </div>

            <div className="jewelry-detail-quantity">
              <label>Quantity:</label>
              <div className="jewelry-quantity-selector">
                <button className="jewelry-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <span className="jewelry-qty-value">{quantity}</span>
                <button className="jewelry-qty-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <button className="jewelry-detail-add-to-cart" onClick={handleAddToCart}>
              Add to Cart - {formatINR((hasDiscount ? offerPrice : price) * quantity)}
            </button>
          </div>
        </div>

        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="jewelry-detail-related">
            <h3 className="jewelry-detail-related-title">You Might Also Like</h3>
            {relatedLoading ? (
              <p className="jewelry-detail-related-loading">Loading suggestions…</p>
            ) : (
              <div className="jewelry-detail-related-grid">
                {relatedProducts.map((rp) => {
                  const rpPrice = parseFloat(rp.price) || 0;
                  const rpOffer = rp.offerPrice ? parseFloat(rp.offerPrice) : null;
                  const rpHasDiscount = rpOffer !== null && rpOffer < rpPrice;
                  return (
                    <button
                      key={rp.id}
                      type="button"
                      className="jewelry-detail-related-card"
                      onClick={() => handleSelectRelated(rp)}
                    >
                      <img
                        src={rp.attributes?.[0]?.image_url}
                        alt={rp.name}
                        className="jewelry-detail-related-image"
                      />
                      <span className="jewelry-detail-related-name">{rp.name}</span>
                      <span className="jewelry-detail-related-price">
                        {formatINR(rpHasDiscount ? rpOffer : rpPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JewelryDetailPage;