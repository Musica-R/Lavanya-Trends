import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";

import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ContactPage from "./pages/ContactPage";
import AddToCartPage from "./pages/AddToCartPage";
import JewelryPage from "./pages/JewelryPage";
import ProfilePage from "./components/Profilepage";
import LoginPage from "./components/Loginpage";

export default function App() {
  return (
    <CartProvider>
      <SearchProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/jew" element={<JewelryPage />} />
          <Route path="/addtocart" element={<AddToCartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Footer />
      </SearchProvider>
    </CartProvider>
  );
}