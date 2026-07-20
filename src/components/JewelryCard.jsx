import React from 'react';
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

const JewelryCard = ({ product, onViewDetails }) => {
    const { addToCart } = useCart();

    const price = product.price;
    const discount = product.discount || 0;
    const originalPrice =
        discount > 0 ? Math.round(price + (price * discount) / 100) : price;

    return (
        <div className="product-card" id="product">
            {/* Product Image */}
            <div className="product-image-container">

                <img
                    src={product.image}
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

                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>

                {/* Rating */}
                <div className="product-rating">
                    {[...Array(5)].map((_, index) => (
                        <span key={index} className={index < Math.floor(product.rating) ? 'star filled' : 'star'}>
                            <FaStar style={{ color: "#FACC15" }} />
                        </span>
                    ))}
                    <span className="rating-number">({product.rating.toFixed(1)})</span>
                </div>

                {/* Price and Add to Cart */}
                <div className="product-footer">
                    <span className="product-price">₹ {price.toFixed(2)}</span>
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

export default JewelryCard;
