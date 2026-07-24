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

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCartItems(JSON.parse(savedCart));
    } catch (err) {
      console.error("Failed to parse saved cart:", err);
      localStorage.removeItem("cart"); // drop corrupted data instead of crashing
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ FIX: products use `id` (not `_id`), and we now accept the selected
  // `attribute` (color variant) so attributeId is never null.
  // A composite `_id` (productId-attributeId) uniquely identifies each
  // cart line, so two different colors of the same saree stay separate.
  const addToCart = (product, quantity = 1, attribute = null) => {
    const productId = product.id ?? product._id;
    const resolvedAttribute = attribute || product.attributes?.[0] || null;
    const attributeId = resolvedAttribute?.id ?? null;
    const cartLineId = `${productId}-${attributeId ?? "none"}`;

    const price = parseFloat(product.offerPrice || product.price) || 0;
    const image =
      resolvedAttribute?.image_url ||
      product.attributes?.[0]?.image_url ||
      product.image ||
      "";

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === cartLineId);

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === cartLineId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            _id: cartLineId,       // unique per product+color variant
            productId,             // real product id, sent to order API
            attributeId,           // ✅ real attribute id, sent to order API
            name: product.name,
            price,
            image,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true); // open the sidebar so the user sees it was added
  };

  // Remove item from cart (by composite _id)
  const removeFromCart = (cartLineId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== cartLineId));
  };

  // Update item quantity (by composite _id)
  const updateQuantity = (cartLineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartLineId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === cartLineId ? { ...item, quantity: newQuantity } : item
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
  const toggleCart = () => setIsCartOpen((prev) => !prev);

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