
import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => setCartItems([]);

  // Get total price
  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Get total items count
  const getCartCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  // Toggle cart sidebar
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toggleCart,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
