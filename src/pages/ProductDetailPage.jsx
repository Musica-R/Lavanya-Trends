import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "https://mediumorchid-rhinoceros-818505.hostingersite.com";

const isGold = (product) => product.category?.category?.toLowerCase() === "gold";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // If we navigated here from the grid (quick view / double click), the
  // product is already passed in via router state — instant, no refetch.
  const [currentProduct, setCurrentProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [quantity, setQuantity] = useState(1);
  const [activeAttrIndex, setActiveAttrIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Fallback: someone lands directly on /product/:id (refresh, shared
  // link, back/forward without state) — fetch it by id instead.
  useEffect(() => {
    if (currentProduct && String(currentProduct.id) === String(id)) return;

    let cancelled = false;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/get-products`);
        if (!res.ok) throw new Error("API response not OK");
        const data = await res.json();
        const found = Array.isArray(data.products)
          ? data.products.find((p) => String(p.id) === String(id))
          : null;
        if (!cancelled) setCurrentProduct(found || null);
      } catch (err) {
        console.error("Failed to load product:", err);
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
        const res = await fetch(`${API_URL}/products/get-products`);
        if (!res.ok) throw new Error("API response not OK");
        const data = await res.json();

        const pool = Array.isArray(data.products)
          ? data.products.filter(
              (p) => p.status === "active" && !isGold(p) && p.id !== currentProduct.id
            )
          : [];

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        if (!cancelled) setRelatedProducts(shuffled.slice(0, 5));
      } catch (err) {
        console.error("Failed to load related sarees:", err);
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
  const thumbnails = useMemo(() => attributes.slice(0, 3), [attributes]);

  const activeAttribute = attributes[activeAttrIndex] || attributes[0];
  const mainImage = activeAttribute?.image_url;

  const handleAddToCart = () => {
    addToCart(currentProduct, quantity, activeAttribute);
  };

  // Selecting a related saree now navigates to ITS page (updates the
  // URL) instead of just swapping state in place, since this is a
  // real page now, not a modal.
  const handleSelectRelated = (relatedProduct) => {
    navigate(`/product/${relatedProduct.id}`, { state: { product: relatedProduct } });
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-loading">Loading product…</p>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="product-detail-page">
        <p className="product-detail-loading">Product not found.</p>
        <button className="product-detail-back-btn" onClick={() => navigate("/product")}>
          ‹ Back to Sarees
        </button>
      </div>
    );
  }

  const price = parseFloat(currentProduct.price) || 0;
  const offerPrice = currentProduct.offerPrice ? parseFloat(currentProduct.offerPrice) : null;
  const hasDiscount = offerPrice !== null && offerPrice < price;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <button className="product-detail-back-btn" onClick={() => navigate(-1)}>
          ‹ Back
        </button>

        <div className="product-detail-body">
          <div>
            <div className="product-detail-image-container">
              <img
                src={mainImage}
                alt={currentProduct.name}
                className="product-detail-image"
                width={500}
                height={500}
              />
            </div>

            {thumbnails.length > 0 && (
              <div className="product-detail-thumbnail-row">
                {thumbnails.map((attr, index) => (
                  <button
                    key={attr.id}
                    type="button"
                    className={`product-detail-thumbnail-btn ${
                      index === activeAttrIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveAttrIndex(index)}
                    title={attr.color || `Option ${index + 1}`}
                  >
                    <img src={attr.image_url} alt={attr.color || currentProduct.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-details">
            <span className="product-detail-category">
              {currentProduct.category?.category || currentProduct.category?.name}
            </span>
            <h1 className="product-detail-title">{currentProduct.name}</h1>

            <div className="product-detail-rating">
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

            {activeAttribute?.color && (
              <p className="product-detail-color-label">
                Color: <strong>{activeAttribute.color}</strong>
              </p>
            )}

            <p className="product-detail-description">{currentProduct.desc}</p>

            <div className="product-detail-price-row">
              <span className="product-detail-price">
                {formatINR(hasDiscount ? offerPrice : price)}
              </span>
              {hasDiscount && (
                <span className="product-detail-price-original">{formatINR(price)}</span>
              )}
            </div>

            <div className="product-detail-quantity">
              <label>Quantity:</label>
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <button className="product-detail-add-to-cart" onClick={handleAddToCart}>
              Add to Cart - {formatINR((hasDiscount ? offerPrice : price) * quantity)}
            </button>
          </div>
        </div>

        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="product-detail-related">
            <h3 className="product-detail-related-title">You Might Also Like</h3>
            {relatedLoading ? (
              <p className="product-detail-related-loading">Loading suggestions…</p>
            ) : (
              <div className="product-detail-related-grid">
                {relatedProducts.map((rp) => {
                  const rpPrice = parseFloat(rp.price) || 0;
                  const rpOffer = rp.offerPrice ? parseFloat(rp.offerPrice) : null;
                  const rpHasDiscount = rpOffer !== null && rpOffer < rpPrice;
                  return (
                    <button
                      key={rp.id}
                      type="button"
                      className="product-detail-related-card"
                      onClick={() => handleSelectRelated(rp)}
                    >
                      <img
                        src={rp.attributes?.[0]?.image_url}
                        alt={rp.name}
                        className="product-detail-related-image"
                      />
                      <span className="product-detail-related-name">{rp.name}</span>
                      <span className="product-detail-related-price">
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

export default ProductDetailPage;