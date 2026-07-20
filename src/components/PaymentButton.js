
import { useState } from "react";

export default function PaymentButton({ amount, onSuccess, customer }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Cart amount is invalid");
      return;
    }

    if (!customer?.name || !customer?.phone || !customer?.email) {
      alert("Please fill name, phone and email before payment");
      return;
    }

    setLoading(true);

    try {

      const amountInPaise = Math.round(Number(amount) * 100);   //Convert ₹ → paise


      const res = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Lavanya Trends",
        description: "Online Payment",
        handler: function (response) {
          onSuccess({ ...response, amountPaid: order.amount / 100 });
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="whatsapp-btn"
      style={{ backgroundColor: "#63caf3", marginTop: "30px" }}>
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </button>
  );
}
