import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';
import { FaStar } from "react-icons/fa";

// Replicates Next.js <Image fill /> behavior for plain <img>
const fillStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
};

const FALLBACK_IMAGE = "/placeholder-saree.jpg";

// The API's first attribute entry may not have an image (some variants
// have image_url: "" or null), so we walk the list and use the first
// one that actually has a non-empty value, falling back to a
// placeholder if none do. Checking this up front — rather than letting
// the <img> try an empty src and fail — avoids a flash of the broken-
// image icon before onError has a chance to swap it out.
const getProductImage = (product) => {
    const attrs = product.attributes || [];
    const withImage = attrs.find((a) => a.image_url && a.image_url.trim() !== "");
    return withImage?.image_url || FALLBACK_IMAGE;
};

const ProductCard = ({ product, onViewDetails }) => {
    const { addToCart } = useCart();
    const [loaded, setLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState(() => getProductImage(product));

    const price = product.price;
    const discount = product.discount || 0;
    const originalPrice =
        discount > 0 ? Math.round(price + (price * discount) / 100) : price;

    // If the API-provided URL turns out broken (404, mixed-content
    // block, etc.), swap to the fallback exactly once.
    const handleImageError = () => {
        if (imgSrc !== FALLBACK_IMAGE) {
            setImgSrc(FALLBACK_IMAGE);
        }
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
                    <span className="product-price">₹ {price}</span>
                    {discount > 0 && (
                        <>
                            <p className='grey'>{originalPrice}</p>
                            <p className='red'>{discount}% OFF</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);