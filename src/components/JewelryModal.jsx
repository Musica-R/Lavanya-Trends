import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/ProductModal.css";

const JewelryModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const firstAttribute = product.attributes?.[0];
    const image = firstAttribute?.image_url || product.image_url || product.image;
    const price = parseFloat(product.offerPrice || product.price) || 0;
    const categoryLabel = product.category?.category || product.category || "";

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>

                <div className="modal-body">
                    {/* Product Image */}
                    <div className="modal-image-container">
                        <img
                            src={image}
                            alt={product.name}
                            className="modal-image"
                            width={400}
                            height={400}
                            style={{ objectFit: "contain" }}
                        />
                    </div>

                    {/* Product Details */}
                    <div className="modal-details">
                        <span className="modal-category">{categoryLabel}</span>
                        <h2 className="modal-title">{product.name}</h2>

                        {/* Rating */}
                        <div className="modal-rating">
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className={index < Math.floor(product.rating || 0) ? "star filled" : "star"}> ⭐ </span>
                            ))}
                            <span className="rating-number">({(product.rating || 0).toFixed(1)})</span>
                        </div>

                        {/* Description */}
                        <p className="modal-description">{product.desc}</p>

                        {/* Price */}
                        <div className="modal-price">₹ {price.toFixed(2)}</div>

                        {/* Quantity Selector */}
                        <div className="modal-quantity">
                            <label>Quantity:</label>
                            <div className="quantity-selector">
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button className="modal-add-to-cart" onClick={handleAddToCart}>
                            Add to Cart - ₹ {(price * quantity).toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JewelryModal;