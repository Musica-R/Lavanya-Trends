import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Mainpro.css";

// Static images
import saree1 from "../assets/sarees1.jpg.jpeg";
import saree2 from "../assets/saree2.jpg.jpeg";
import saree3 from "../assets/saree3.jpg.jpeg";
import saree4 from "../assets/saree4.jpg.jpeg";

import saree9 from "../assets/pg.jpg";
import saree10 from "../assets/pgsar.jpg";
import saree11 from "../assets/Sillk_Saree.webp";
import saree12 from "../assets/saree8.webp";

// Static products
const products = [
  { id: 1, name: "Navy Blue Crepe Saree", price: "₹4,949", image: saree1, isNew: true },
  { id: 2, name: "Hot Pink Georgette Saree", price: "₹22,109", image: saree2, isNew: true },
  { id: 3, name: "Silver Banarasi Tissue Saree", price: "₹16,829", image: saree3 },
  { id: 4, name: "Burgundy Bandhani Silk Saree", price: "₹10,119", image: saree4 },
];

const productss = [
  { id: 1, name: "Maternity Wear", image: saree9 },
  { id: 2, name: "Wedding Collection", image: saree10 },
  { id: 3, name: "Office Wear", image: saree11 },
  { id: 4, name: "Party Wear Sarees", image: saree12 },
];

const HomeProduct = () => {
  const [hotLoom, setHotLoom] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotLoom = async () => {
      try {
        // ✅ CORS-safe call via rewrite
        const res = await fetch("https://nithi-billing.ddnsgeek.com/sarees/products/get-products");

        if (!res.ok) {
          throw new Error("API response not OK");
        }

        const data = await res.json();
       
      
        // ✅ filter loom + active
        const loomProducts = Array.isArray(data.products)
          ? data.products.filter(
              (item) => item.loom === true && item.status === "active"
            )
          : [];

        setHotLoom(loomProducts);
      } catch (error) {
        console.error("Error fetching Hot of the Loom products:", error);
        setHotLoom([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotLoom();
  }, []);

  return (
    <section className="homeproduct-section" id="offers">
      {/* Hot of the Loom */}
      <div className="homeproduct-header" >
        <h2>Hot of the Loom</h2>
        <Link to="/product" className="view-all">
          View All →
        </Link>
      </div>

      <div className="homeproduct-grid">
        {loading ? (
          <p>Loading products...</p>
        ) : hotLoom.length > 0 ? (
          hotLoom.map((product) => (
            <div key={product._id} className="homeproduct-card">
              {/* <span className="wishlist">♡</span> */}

              <div className="image-wrap">
                <img
                  src={product.image}
                  alt={product.name || "Saree"}
                  width={350}
                  height={500}
                  className="product-image"
                />
                <div className="hover-overlay">
                  <Link to="/product">
                    <button className="view-product-btn">
                      View Product
                    </button>
                  </Link>
                </div>
              </div>

              <div className="product-infos">
                <h3>{product.name}</h3>
                <p className="price">₹{product.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No Hot Loom products available at the moment.</p>
        )}
      </div>

      {/* Shop By Occasion */}
      <div className="wrap">
        <div className="homeproduct-header">
          <h2>Shop By Occasion</h2>
          <Link to="/product" className="view-all">
            View All →
          </Link>
        </div>

        <div className="homeproduct-grid">
          {productss.map((item) => (
            <div key={item.id} className="homeproduct-card card-border">
              {/* <span className="wishlist">♡</span> */}

              <div className="image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  width={350}
                  height={500}
                  className="product-image"
                />
                <div className="hover-overlay">
                  <Link to="/product">
                    <button className="view-product-btn">
                      View Product
                    </button>
                  </Link>
                </div>
              </div>

              <div className="product-infos">
                <h3>{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bestsellers */}
      <div className="wrap">
        <div className="homeproduct-header">
          <h2>Our Bestsellers</h2>
          <Link to="/product" className="view-all">
            View All →
          </Link>
        </div>

        <div className="homeproduct-grid">
          {products.map((item) => (
            <div key={item.id} className="homeproduct-card">
              {item.isNew && <span className="badge-new">NEW</span>}
              {/* <span className="wishlist">♡</span> */}

              <div className="image-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  width={350}
                  height={500}
                  className="product-image"
                />
                <div className="hover-overlay">
                  <Link to="/product">
                    <button className="view-product-btn">
                      View Product
                    </button>
                  </Link>
                </div>
              </div>

              <div className="product-infos">
                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeProduct;
