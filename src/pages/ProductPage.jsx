import Cart from "../components/Cart";
import ProductGrid from "../components/ProductGrid";

export default function ProductPage() {
  return (
    <div className="container">
      {/* <Hero /> */}
      <ProductGrid />
      <Cart />
      {/* <MobileArrow /> */}
    </div>
  );
}