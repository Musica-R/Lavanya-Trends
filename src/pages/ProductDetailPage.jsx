import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "https://mediumorchid-rhinoceros-818505.hostingersite.com";

const LOW_STOCK_THRESHOLD = 5;

const isGold = (product) => product.category?.category?.toLowerCase() === "gold";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Resolve the quantity for a given attribute/variant. Returns null when
// the API hasn't provided stock info, so we never show a stock message
// for products that don't track it.
const getStockQty = (attribute) =>
  typeof attribute?.quantity === "number" ? attribute.quantity : null;

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [currentProduct, setCurrentProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [quantity, setQuantity] = useState(1);
  const [activeAttrIndex, setActiveAttrIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

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
  const thumbnails = attributes; // show all variant thumbnails

  const activeAttribute = attributes[activeAttrIndex] || attributes[0];
  const mainImage = activeAttribute?.image_url;

  // --- Stock state for the currently selected variant ---
  const stockQty = getStockQty(activeAttribute);
  const isOutOfStock = stockQty !== null && stockQty <= 0;
  const isLowStock = stockQty !== null && stockQty > 0 && stockQty < LOW_STOCK_THRESHOLD;

  // Keep the quantity selector from exceeding what's actually available.
  useEffect(() => {
    if (stockQty !== null && quantity > stockQty) {
      setQuantity(Math.max(1, stockQty));
    }
  }, [stockQty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(currentProduct, quantity, activeAttribute);
  };

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

  // Price/offer/discount resolve from the active attribute first, falling
  // back to the product-level values so switching variants updates instantly.
  const rawPrice = activeAttribute?.price ?? currentProduct.price;
  const rawOfferPrice = activeAttribute?.offerPrice ?? currentProduct.offerPrice;
  const rawDiscount = activeAttribute?.discount ?? currentProduct.discount;

  const price = parseFloat(rawPrice) || 0;
  const offerPrice = rawOfferPrice !== null && rawOfferPrice !== undefined && rawOfferPrice !== ""
    ? parseFloat(rawOfferPrice)
    : null;
  const hasDiscount = offerPrice !== null && offerPrice < price;
  const discountPercent = rawDiscount ? Number(rawDiscount) : null;

  // Variant-specific spec fields
  const specs = [
    { label: "Fabric", value: activeAttribute?.fabric },
    { label: "Work", value: activeAttribute?.work },
    { label: "Blouse Length", value: activeAttribute?.blouseLength },
    { label: "Occasion", value: activeAttribute?.occasion },
    { label: "SKU", value: activeAttribute?.sku },
  ].filter((spec) => spec.value !== null && spec.value !== undefined && spec.value !== "");

  return (
    <div className="product-detail-page">
      <br /><br /><br />
      <div className="product-detail-container">
        <button className="product-detail-back-btn" onClick={() => navigate(-1)}>
          ‹ Back
        </button>

        <div className="product-detail-body">
          <div>
            <div
              className={`product-detail-image-container ${
                isOutOfStock ? "is-out-of-stock" : ""
              }`}
            >
              <img
                src={mainImage}
                alt={currentProduct.name}
                className="product-detail-image"
                width={500}
                height={500}
              />

              {isOutOfStock ? (
                <span className="product-detail-image-badge oos">Out of Stock</span>
              ) : (
                hasDiscount &&
                discountPercent && (
                  <span className="product-detail-image-badge discount">
                    {discountPercent}% off
                  </span>
                )
              )}
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

            {/* Price block — reacts to activeAttribute changes */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">
                {formatINR(hasDiscount ? offerPrice : price)}
              </span>
              {hasDiscount && (
                <span className="product-detail-price-original">{formatINR(price)}</span>
              )}
              {hasDiscount && discountPercent ? (
                <span className="product-detail-discount-badge">{discountPercent}% OFF</span>
              ) : null}
            </div>

            {/* Variant-specific specs — fabric, work, blouse length, occasion, sku */}
            {specs.length > 0 && (
              <div className="product-detail-specs">
                {specs.map((spec) => (
                  <p key={spec.label} className="product-detail-spec-row">
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </p>
                ))}
              </div>
            )}

            {stockQty !== null && (
              <p
                className={`product-detail-stock ${
                  isOutOfStock ? "out-of-stock" : isLowStock ? "low-stock" : ""
                }`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : isLowStock
                  ? `Only ${stockQty} left — order soon`
                  : "In stock"}
              </p>
            )}

            <div className="product-detail-quantity">
              <label>Quantity:</label>
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() =>
                    setQuantity(
                      stockQty !== null ? Math.min(stockQty, quantity + 1) : quantity + 1
                    )
                  }
                  disabled={isOutOfStock || (stockQty !== null && quantity >= stockQty)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="product-detail-add-to-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `Add to Cart = ${formatINR((hasDiscount ? offerPrice : price) * quantity)}`}
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
                  const rpAttr = rp.attributes?.[0];
                  const rpPrice = parseFloat(rpAttr?.price ?? rp.price) || 0;
                  const rpOfferRaw = rpAttr?.offerPrice ?? rp.offerPrice;
                  const rpOffer = rpOfferRaw !== null && rpOfferRaw !== undefined && rpOfferRaw !== ""
                    ? parseFloat(rpOfferRaw)
                    : null;
                  const rpHasDiscount = rpOffer !== null && rpOffer < rpPrice;
                  const rpStockQty = getStockQty(rpAttr);
                  const rpOutOfStock = rpStockQty !== null && rpStockQty <= 0;

                  return (
                    <button
                      key={rp.id}
                      type="button"
                      className="product-detail-related-card"
                      onClick={() => handleSelectRelated(rp)}
                    >
                      <div
                        className={`product-detail-related-image-wrap ${
                          rpOutOfStock ? "is-out-of-stock" : ""
                        }`}
                      >
                        <img
                          src={rpAttr?.image_url}
                          alt={rp.name}
                          className="product-detail-related-image"
                        />
                        {rpOutOfStock && (
                          <span className="product-detail-related-oos-tag">Out of stock</span>
                        )}
                      </div>
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