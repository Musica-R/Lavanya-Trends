import Cart from "../components/Cart";
import ProductGrid from "../components/ProductGrid";
import Hero from "../components/Hero";
import React from "react";
import MobileArrow from "../components/MobileArrow";

export default function ProductPage() {
  return (
    <div className="container">
      {/* <Hero /> */}
      <ProductGrid />
      <Cart />
      <MobileArrow />
    </div>
  );
}