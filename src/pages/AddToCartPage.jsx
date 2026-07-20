import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/Checkout.css";
import Cart from "../components/Cart";
import MobileArrow from "../components/MobileArrow";
import PaymentButton from "../components/PaymentButton";

export default function Addtocart() {
    const { cartItems, getCartTotal } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [paidOrder, setPaidOrder] = useState(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetCheckout = () => {
        setForm({
            name: "",
            phone: "",
            email: "",
            address: "",
        });

        setPaymentMethod("COD");
        setPaidOrder(null);
    };


    const placeCODOrder = () => {
        let message = `*NEW COD ORDER*\n\n`;

        cartItems.forEach((item, i) => {
            message += `*${i + 1}. ${item.name}*\n`;
            message += `₹${item.price} × ${item.quantity}\n\n`;
        });

        message += `----------------------\n`;
        message += `*Total:* ₹${getCartTotal()}\n`;
        message += `*Payment:* Cash on Delivery\n\n`;

        message += `*Customer Details*\n`;
        message += `Name: ${form.name}\n`;
        message += `Phone: ${form.phone}\n`;
        message += `Email: ${form.email}\n`;
        message += `Address: ${form.address}\n`;

        window.open(
            `https://wa.me/918610766168?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        resetCheckout();
    };


    const paymentSuccess = (payment) => {
        setPaidOrder(payment);
    };


    const sendPaidOrderToWhatsApp = () => {
        if (!paidOrder) return;

        let message = `*PAID ORDER RECEIVED*\n\n`;

        message += `*Payment ID:* ${paidOrder.razorpay_payment_id}\n`;
        message += `*Order ID:* ${paidOrder.razorpay_order_id}\n`;
        message += `*Amount Paid:* ₹${paidOrder.amountPaid}\n\n`;


        cartItems.forEach((item, i) => {
            message += `*${i + 1}. ${item.name}*\n`;
            message += `₹${item.price} × ${item.quantity}\n\n`;
        });

        message += `----------------------\n`;
        message += `*Payment Mode:* Online (Razorpay)\n\n`;

        message += `*Customer Details*\n`;
        message += `Name: ${form.name}\n`;
        message += `Phone: ${form.phone}\n`;
        message += `Email: ${form.email}\n`;
        message += `Address: ${form.address}\n`;

        window.open(
            `https://wa.me/918610766168?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        resetCheckout();
    };

    return (
        <>
            <div className="checkout-container">
                <h2 className="checkout-title">Checkout</h2>

                <div className="checkout-grid">
                    {/* CART */}
                    <div className="checkout-cart">
                        {cartItems.map((item) => (
                            <div className="checkout-item" key={item._id}>
                                <img src={item.image} alt={item.name} width={80} height={100} />
                                <div>
                                    <p>{item.name}</p>
                                    <p>₹{item.price} × {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                        <h3>Total: ₹{getCartTotal()}</h3>
                    </div>

                    {/* FORM */}
                    <div className="checkout-form">
                        <input name="name" value={form.name} placeholder="Name" onChange={handleChange} />
                        <input name="phone" value={form.phone} placeholder="Phone" onChange={handleChange} />
                        <input name="email" value={form.email} placeholder="Email" onChange={handleChange} />
                        <textarea name="address" value={form.address} placeholder="Address" onChange={handleChange} />


                        <h4>Payment Method</h4>
                        <label>
                            <input type="radio" checked={paymentMethod === "COD"}
                                onChange={() => { setPaymentMethod("COD"); setPaidOrder(null); }}
                                style={{ position: "relative", top: "30px" }} />
                            Cash on Delivery
                        </label>

                        {/* <label>
                            <input type="radio" checked={paymentMethod === "ONLINE"}
                                onChange={() => setPaymentMethod("ONLINE")}
                                style={{ position: "relative", top: "30px" }} />
                            Online Payment
                        </label> */}

                        {/* BUTTONS */}
                        {paymentMethod === "COD" && (
                            <button className="whatsapp-btn" onClick={placeCODOrder} style={{ marginTop: "30px" }} >
                                Place COD Order
                            </button>
                        )}

                        {paymentMethod === "ONLINE" && !paidOrder && (
                            <PaymentButton amount={getCartTotal()} onSuccess={paymentSuccess} customer={form} />
                        )}

                        {paymentMethod === "ONLINE" && paidOrder && (
                            <button className="whatsapp-btn" style={{ backgroundColor: "green", marginTop: "30px" }}
                                onClick={sendPaidOrderToWhatsApp}>
                                Send Paid Order on WhatsApp
                            </button>
                        )}

                    </div>
                </div>
            </div>

            <Cart />
            <MobileArrow />
        </>
    );
}
