import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

// Replicates Next.js <Image fill /> behavior for plain <img>
const fillStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
};

const FALLBACK_IMAGE = "/placeholder-saree.jpg";

const getProductImage = (product) => {
    const attrs = product.attributes || [];
    const withImage = attrs.find((a) => a.image_url && a.image_url.trim() !== "");
    return withImage?.image_url || FALLBACK_IMAGE;
};

const ProductCard = ({ product, onViewDetails, isFavorite, onToggleFavorite }) => {
    const { addToCart } = useCart();
    const [loaded, setLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState(() => getProductImage(product));

    // API sends price/offerPrice as strings (e.g. "800.00"), so parse
    // them to numbers before doing any math with them.
    const mrp = parseFloat(product.price) || 0;
    const sellingPrice = parseFloat(product.offerPrice ?? product.price) || 0;
    const discount = product.discount || 0;
    // Only show the strikethrough MRP when it's actually higher than
    // the selling price — otherwise there's nothing to "discount" from.
    const hasDiscount = discount > 0 && mrp > sellingPrice;

    // If the API-provided URL turns out broken (404, mixed-content
    // block, etc.), swap to the fallback exactly once.
    const handleImageError = () => {
        if (imgSrc !== FALLBACK_IMAGE) {
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    // Stop the click from bubbling up to the card's onDoubleClick /
    // Quick View overlay, then hand off to the parent's toggle handler
    // (which owns the actual add/remove API call).
    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite?.();
    };

    return (
        <div className="product-card" id="product">
            {/* Product Image */}
            <div className="product-image-container">
                <img
                    key={product.id}
                    src={imgSrc}
                    alt={product.name}
                    style={{
                        ...fillStyle,
                        opacity: loaded ? 1 : 0,
                        transition: "opacity 0.25s ease",
                    }}
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={handleImageError}
                />

                {/* Favorite (heart) button */}
                <button
                    type="button"
                    className={`favorite-btn${isFavorite ? " active" : ""}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorite}
                >
                    {isFavorite ? (
                        <FaHeart style={{ color: "#e63950" }} />
                    ) : (
                        <FaRegHeart style={{ color: "#fff" }} />
                    )}
                </button>

                <div className="product-overlay">
                    <button className="view-details-btn" onClick={() => onViewDetails(product)}>
                        Quick View
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>

                {/* Rating */}
                <div className="product-rating">
                    {[...Array(5)].map((_, index) => (
                        <span key={index} className={index < Math.floor(product.rating || 0) ? 'star filled' : 'star'}>
                            <FaStar style={{ color: "#FACC15" }} />
                        </span>
                    ))}
                    <span className="rating-number">({(product.rating || 0).toFixed(1)})</span>
                </div>

                {/* Price and Add to Cart */}
                <div className="product-footer">
                    <span className="product-price">₹ {sellingPrice}</span>
                    {hasDiscount && (
                        <>
                            <p className='grey'>₹ {mrp}</p>
                            <p className='red'>{discount}% OFF</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);