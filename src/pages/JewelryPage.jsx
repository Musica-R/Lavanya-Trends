import JewelryModal from "../components/JewelryModal";
import Cart from "../components/Cart";
import JewelryGrid from "../components/JewelryGrid";
import Hero from "../components/Hero";
import React, { useState } from "react";
import MobileArrow from "../components/MobileArrow";

export default function JewelryPage() {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    return (
        <div className="container">
            <JewelryGrid onViewDetails={handleViewDetails} />
            <Cart />
            {selectedProduct && (
                <JewelryModal product={selectedProduct} onClose={handleCloseModal} />
            )}
            <MobileArrow />
        </div>
    );
}
