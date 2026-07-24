import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/ProductModal.css";

const API_URL = process.env.REACT_APP_API_URL;

const isGold = (product) => product.category?.category?.toLowerCase() === "gold";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useCart();

  const [currentProduct, setCurrentProduct] = useState(product);
  const [quantity, setQuantity] = useState(1);
  const [activeAttrIndex, setActiveAttrIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    setCurrentProduct(product);
    setQuantity(1);
    setActiveAttrIndex(0);
  }, [product]);

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

  if (!currentProduct) return null;

  const price = parseFloat(currentProduct.price) || 0;
  const offerPrice = currentProduct.offerPrice ? parseFloat(currentProduct.offerPrice) : null;
  const hasDiscount = offerPrice !== null && offerPrice < price;

  // ✅ FIX: pass the selected attribute (color variant) into addToCart
  // so the cart item carries a real attributeId instead of null.
  const handleAddToCart = () => {
    addToCart(currentProduct, quantity, activeAttribute);
    onClose();
  };

  const handleSelectRelated = (relatedProduct) => {
    setCurrentProduct(relatedProduct);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-body">
          <div>
            <div className="modal-image-container">
              <img
                src={mainImage}
                alt={currentProduct.name}
                className="modal-image"
                width={400}
                height={400}
              />
            </div>

            {thumbnails.length > 0 && (
              <div className="modal-thumbnail-row">
                {thumbnails.map((attr, index) => (
                  <button
                    key={attr.id}
                    type="button"
                    className={`modal-thumbnail-btn ${index === activeAttrIndex ? "active" : ""}`}
                    onClick={() => setActiveAttrIndex(index)}
                    title={attr.color || `Option ${index + 1}`}
                  >
                    <img src={attr.image_url} alt={attr.color || currentProduct.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="modal-details">
            <span className="modal-category">{currentProduct.category?.category}</span>
            <h2 className="modal-title">{currentProduct.name}</h2>

            <div className="modal-rating">
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
              <p className="modal-color-label">
                Color: <strong>{activeAttribute.color}</strong>
              </p>
            )}

            <p className="modal-description">{currentProduct.desc}</p>

            <div className="modal-price-row">
              <span className="modal-price">{formatINR(hasDiscount ? offerPrice : price)}</span>
              {hasDiscount && <span className="modal-price-original">{formatINR(price)}</span>}
            </div>

            <div className="modal-quantity">
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

            <button className="modal-add-to-cart" onClick={handleAddToCart}>
              Add to Cart - {formatINR((hasDiscount ? offerPrice : price) * quantity)}
            </button>
          </div>
        </div>

        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="modal-related">
            <h3 className="modal-related-title">You Might Also Like</h3>
            {relatedLoading ? (
              <p className="modal-related-loading">Loading suggestions…</p>
            ) : (
              <div className="modal-related-grid">
                {relatedProducts.map((rp) => {
                  const rpPrice = parseFloat(rp.price) || 0;
                  const rpOffer = rp.offerPrice ? parseFloat(rp.offerPrice) : null;
                  const rpHasDiscount = rpOffer !== null && rpOffer < rpPrice;
                  return (
                    <button
                      key={rp.id}
                      type="button"
                      className="modal-related-card"
                      onClick={() => handleSelectRelated(rp)}
                    >
                      <img
                        src={rp.attributes?.[0]?.image_url}
                        alt={rp.name}
                        className="modal-related-image"
                      />
                      <span className="modal-related-name">{rp.name}</span>
                      <span className="modal-related-price">
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

export default ProductModal;