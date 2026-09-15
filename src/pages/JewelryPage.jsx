import Cart from "../components/Cart";
import JewelryGrid from "../components/JewelryGrid";

export default function JewelryPage() {
    return (
        <div className="container">
            <JewelryGrid />
            <Cart />
            {/* <MobileArrow /> */}
        </div>
    );
}