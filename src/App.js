import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import Cart from "./components/Cart";

import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ContactPage from "./pages/ContactPage";
import AddToCartPage from "./pages/AddToCartPage";
import JewelryPage from "./pages/JewelryPage";
import JewelryDetailPage from "./pages/JewelryDetailPage";
import ProfilePage from "./components/Profilepage";
import LoginPage from "./components/Loginpage";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import FloatingButtons from "./components/FloatingButtons";

export default function App() {
  return (
    <CartProvider>
      <SearchProvider>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/jew" element={<JewelryPage />} />
          <Route path="/jewelry/:id" element={<JewelryDetailPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/addtocart" element={<AddToCartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <Cart />
        <Footer />
        <FloatingButtons />
      </SearchProvider>
    </CartProvider>
  );
}