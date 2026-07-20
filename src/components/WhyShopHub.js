import "../styles/whyshophub.css"


export default function WhyShopHub() {
    const features = [
        {
            icon: "🚚",
            title: "Free & Fast Delivery",
            desc: "Enjoy fast and free delivery on all orders across India."
        },
        {
            icon: "🔄",
    
            title: "Easy Returns",
            desc: "7-day hassle-free return and exchange policy."
        },
        {
            icon: "🔒",
            title: "Secure Payments",
            desc: "100% secure payments with trusted payment gateways."
        },
        {
            icon: "⭐",
            title: "Premium Quality",
            desc: "Hand-picked premium sarees with quality assurance."
        }
    ];

    return (
        <section className="why-shophub">

            <div className="why-container">

                <div className="why-con">
                    <h2 className="why-title">Why Shop From Lavanya Trends?</h2>
                    <p className="why-subtitle">
                        Experience premium saree shopping with trust, quality, and comfort.
                    </p>
                </div>

                <div className="why-grid">
                    {features.map((item, index) => (
                        <div className="why-card" key={index}>
                            <div className="why-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            
        </section>
    );
}