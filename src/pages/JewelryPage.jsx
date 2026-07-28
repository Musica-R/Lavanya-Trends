import Cart from "../components/Cart";
import JewelryGrid from "../components/JewelryGrid";
import React from "react";
import MobileArrow from "../components/MobileArrow";

export default function JewelryPage() {
    return (
        <div className="container">
            <JewelryGrid />
            <Cart />
            <MobileArrow />
        </div>
    );
}