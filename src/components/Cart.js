import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
import { Link, useNavigate } from "react-router-dom";
import LoginPopup from "./Loginpage"; // adjust path if needed

const Cart = () => {
  const { cartItems, isCartOpen, removeFromCart, updateQuantity, getCartTotal, toggleCart } = useCart();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  // Handle Checkout button click
  const handleCheckout = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setShowLogin(true);
      return;
    }

  
    navigate("/addtocart");
    toggleCart(); 
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && <div className="cart-overlay" onClick={toggleCart}></div>}

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        {/* Cart Header */}
        <div className="cart-header">
          <h2 className="cart-title">View Cart</h2>
          <button className="close-cart-btn" onClick={toggleCart}>
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-cart-icon">🛒</span>
              <p>Your cart is empty</p>
              <Link to="/product">
                <button className="continue-shopping-btn">Continue Shopping</button>
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                {/* Image */}
                <div className="cart-item-image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    style={{ objectFit: "contain", borderRadius: "8px" }}
                  />
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">${item.price}</p>

                  {/* Quantity */}
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item._id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button className="remove-item-btn" onClick={() => removeFromCart(item._id)}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="total-amount">${getCartTotal().toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
          navigate("/addtocart"); // navigate after successful login
          toggleCart(); // optionally close cart sidebar
        }}
      />
    </>
  );
};

export default Cart;