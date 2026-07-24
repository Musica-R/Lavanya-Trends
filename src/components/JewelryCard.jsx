import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';
import { FaStar } from "react-icons/fa";

const fillStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
};

const JewelryCard = ({ product, onViewDetails }) => {
    const { addToCart } = useCart();

    const firstAttribute = product.attributes?.[0];
    const image = firstAttribute?.image_url || product.image_url || product.image;

    const price = parseFloat(product.offerPrice || product.price) || 0;
    const originalPrice = parseFloat(product.price) || price;
    const discount = product.discount || 0;
    // category object's field is `name`, e.g. { id, name: "Gold", collection: "JEWEL" }
    const categoryLabel = product.category?.name || product.category || "";

    return (
        <div className="product-card" id="product">
            {/* Product Image */}
            <div className="product-image-container">
                <img
                    src={image}
                    alt={product.name}
                    style={fillStyle}
                    className="product-image"
                />
                <div className="product-overlay">
                    <button className="view-details-btn" onClick={() => onViewDetails(product)}>
                        Quick View
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
                <span className="product-category">{categoryLabel}</span>
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
                    <span className="product-price">₹ {price.toFixed(2)}</span>
                    {discount > 0 && (
                        <>
                            <p className='grey'>₹ {originalPrice.toFixed(2)}</p>
                            <p className='red'>{discount}% OFF</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JewelryCard;