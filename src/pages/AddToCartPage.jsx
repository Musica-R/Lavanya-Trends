import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/Checkout.css";
import Cart from "../components/Cart";
import MobileArrow from "../components/MobileArrow";
import PaymentButton from "../components/PaymentButton";

const ORDER_API = "https://sarees-backend-9wq0.onrender.com/orders/create-order";
const WHATSAPP_NUMBER = "918610766168";

export default function Addtocart() {
    const { cartItems, getCartTotal } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [paidOrder, setPaidOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
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
            city: "",
            state: "",
            pincode: "",
            notes: "",
        });
        setPaymentMethod("COD");
        setPaidOrder(null);
        setErrorMsg("");
    };

    const validateForm = () => {
        if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
            setErrorMsg("Please fill in name, phone, address, city, state, and pincode.");
            return false;
        }
        return true;
    };

    const getUserId = () => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            return parsed?.id ?? parsed?.userId ?? null;
        } catch {
            return null;
        }
    };

    const buildOrderPayload = () => ({
        userId: getUserId(),
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingEmail: form.email,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingState: form.state,
        shippingPincode: form.pincode,
        notes: form.notes,
        items: cartItems.map((item) => ({
            productId: item.productId ?? item._id,
            attributeId: item.attributeId ?? null,
            quantity: item.quantity,
        })),
    });

    const sendOrderToBackend = async () => {
        const payload = buildOrderPayload();
        const res = await fetch(ORDER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            throw new Error(`Order API failed with status ${res.status}`);
        }
        return res.json();
    };

    const buildWhatsAppMessage = (paymentInfo) => {
        let message = paymentInfo
            ? `*PAID ORDER RECEIVED*\n\n`
            : `*NEW COD ORDER*\n\n`;

        if (paymentInfo) {
            message += `*Payment ID:* ${paymentInfo.razorpay_payment_id}\n`;
            message += `*Order ID:* ${paymentInfo.razorpay_order_id}\n`;
            message += `*Amount Paid:* ₹${paymentInfo.amountPaid}\n\n`;
        }

        cartItems.forEach((item, i) => {
            message += `*${i + 1}. ${item.name}*\n`;
            message += `₹${item.price} × ${item.quantity}\n\n`;
        });

        message += `----------------------\n`;
        message += `*Total:* ₹${getCartTotal()}\n`;
        message += `*Payment:* ${paymentInfo ? "Online (Razorpay)" : "Cash on Delivery"}\n\n`;

        message += `*Customer Details*\n`;
        message += `Name: ${form.name}\n`;
        message += `Phone: ${form.phone}\n`;
        message += `Email: ${form.email}\n`;
        message += `Address: ${form.address}, ${form.city}, ${form.state} - ${form.pincode}\n`;
        if (form.notes) message += `Notes: ${form.notes}\n`;

        return message;
    };

    const sendToWhatsApp = (message) => {
        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
            "_blank"
        );
    };

    const placeCODOrder = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        setErrorMsg("");
        try {
            await sendOrderToBackend();
            sendToWhatsApp(buildWhatsAppMessage(null));
            resetCheckout();
        } catch (err) {
            setErrorMsg("Couldn't save your order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const paymentSuccess = (payment) => {
        setPaidOrder(payment);
    };

    const sendPaidOrderToWhatsApp = async () => {
        if (!paidOrder) return;
        setSubmitting(true);
        setErrorMsg("");
        try {
            await sendOrderToBackend();
            sendToWhatsApp(buildWhatsAppMessage(paidOrder));
            resetCheckout();
        } catch (err) {
            setErrorMsg("Payment succeeded but saving the order failed. Please contact support with your Payment ID.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="checkout-container">
                <h2 className="checkout-title">Checkout</h2>

                <div className="checkout-grid">
                    {/* FORM */}
                    <div className="checkout-form">
                        <h4>Contact & Shipping</h4>
                        <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} />
                        <input name="phone" value={form.phone} placeholder="Phone" onChange={handleChange} />
                        <input name="email" value={form.email} placeholder="Email" onChange={handleChange} />
                        <textarea name="address" value={form.address} placeholder="Address" onChange={handleChange} />
                        <div className="checkout-row">
                            <input name="city" value={form.city} placeholder="City" onChange={handleChange} />
                            <input name="state" value={form.state} placeholder="State" onChange={handleChange} />
                        </div>
                        <div className="checkout-row">
                            <input name="pincode" value={form.pincode} placeholder="Pincode" onChange={handleChange} />
                        </div>
                        <textarea name="notes" value={form.notes} placeholder="Delivery notes (optional)" onChange={handleChange} />

                        <h4>Payment Method</h4>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    checked={paymentMethod === "COD"}
                                    onChange={() => { setPaymentMethod("COD"); setPaidOrder(null); }}
                                />
                                Cash on Delivery
                            </label>

                            {/* <label className="payment-option">
                                <input
                                    type="radio"
                                    checked={paymentMethod === "ONLINE"}
                                    onChange={() => setPaymentMethod("ONLINE")}
                                />
                                Online Payment
                            </label> */}
                        </div>

                        {errorMsg && <p className="checkout-error">{errorMsg}</p>}

                        {paymentMethod === "COD" && (
                            <button className="whatsapp-btn" onClick={placeCODOrder} disabled={submitting}>
                                {submitting ? "Placing Order..." : "Place COD Order"}
                            </button>
                        )}

                        {paymentMethod === "ONLINE" && !paidOrder && (
                            <PaymentButton amount={getCartTotal()} onSuccess={paymentSuccess} customer={form} />
                        )}

                        {paymentMethod === "ONLINE" && paidOrder && (
                            <button
                                className="whatsapp-btn paid"
                                onClick={sendPaidOrderToWhatsApp}
                                disabled={submitting}
                            >
                                {submitting ? "Saving Order..." : "Send Paid Order on WhatsApp"}
                            </button>
                        )}
                    </div>

                    {/* ORDER SUMMARY */}
                    <div className="checkout-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div className="summary-item" key={item._id}>
                                    <img src={item.image} alt={item.name} className="summary-image" />
                                    <div className="summary-item-info">
                                        <p className="summary-item-name">{item.name}</p>
                                        <p className="summary-item-qty">₹{item.price} × {item.quantity}</p>
                                    </div>
                                    <p className="summary-item-subtotal">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>₹{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping</span>
                            <span>₹0.00</span>
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{getCartTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Cart />
            <MobileArrow />
        </>
    );
}