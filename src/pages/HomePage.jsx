import React from "react";
import Cart from "../components/Cart";
import Contact from "../components/Contact";
import HeroMain from "../components/HomeNain";
import ProductCards from "../components/HomeProduct";
import MobileArrow from "../components/MobileArrow";

export default function HomePage() {

  return (
    <>
      <HeroMain />
      <ProductCards/>
      <Contact />
      <Cart />
      <MobileArrow />
    </>
  );
}
