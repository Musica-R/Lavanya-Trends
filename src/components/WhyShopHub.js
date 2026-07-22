import "../styles/whyshophub.css";

export default function WhyShopHub() {
  const features = [
    {
      title: "Free & Fast Delivery",
      desc: "Enjoy fast and free delivery on all orders across India.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 7h11v9H3z" strokeLinejoin="round" />
          <path d="M14 10h4l3 3v3h-7z" strokeLinejoin="round" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      ),
    },
    {
      title: "Easy Returns",
      desc: "7-day hassle-free return and exchange policy.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12a8 8 0 1 1 2.6 5.9" strokeLinecap="round" />
          <path d="M4 12V7m0 5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      desc: "100% secure payments with trusted payment gateways.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Premium Quality",
      desc: "Hand-picked premium sarees with quality assurance.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="why-shophub">
      <div className="why-container">
        <div className="why-con">
          <span className="why-eyebrow">The Lavanya Promise</span>
          <h2 className="why-title">Why Shop From Lavanya Trends?</h2>
          <div className="why-ornament">
            <span className="why-ornament-line" />
            <span className="why-ornament-dot">✦</span>
            <span className="why-ornament-line" />
          </div>
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