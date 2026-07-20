import ProductModal from "../components/ProductModal";
import Cart from "../components/Cart";
import ProductGrid from "../components/ProductGrid";
import Hero from "../components/Hero";
import React, { useState } from "react";
import MobileArrow from "../components/MobileArrow";

export default function ProductPage() {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    return (
        <div className="container">
            {/* <Hero /> */}
            <ProductGrid onViewDetails={handleViewDetails} />
            <Cart />
            {selectedProduct && (<ProductModal product={selectedProduct} onClose={handleCloseModal}/>)}
            <MobileArrow />
        </div>
    );
}
