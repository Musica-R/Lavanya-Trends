import { Link } from "react-router-dom";
import "../styles/About.css";

/* ===== OUR OFFERINGS — the two pillars of the shop ===== */
const offerings = [
  {
    name: "Sarees",
    tag: "The Weave",
    src: "/ass/f1.jpg",
    desc: "Banarasi, Kanjivaram and handloom silks sourced directly from weaver clusters, each drape carrying its own zari story.",
    link: "/product",
    cta: "Shop Sarees",
  },
  {
    name: "Jewelry",
    tag: "The Finish",
    src: "/ass/ear1.jpg",
    desc: "Temple jewelry, kundan sets and everyday fine pieces, chosen to complete a drape rather than compete with it.",
    link: "/jew",
    cta: "Shop Jewelry",
  },
];

/* ===== OUR GALLERY — glimpses of the shop, team, and craft ===== */
const gallery = [
  {
    src: "/ass/out5.jpg",
    alt: "Our shopfront in Tāramangalam",
    caption: "Our Shopfront",
  },
  {
    src: "/ass/out2.jpg",
    alt: "Shelves of folded sarees inside the store",
    caption: "Inside The Store",
  },
  {
    src: "/ass/out3.jpg",
    alt: "Our team assisting a customer with a saree drape",
    caption: "Our Team At Work",
  },
  {
    src: "/ass/out1.jpg",
    alt: "Karigars setting stones for temple jewelry",
    caption: "Craft In Progress",
  },
];

export default function About() {
  return (
    <>
      {/* ===== OUR STORY — client/shop image left, content right ===== */}
      <section className="about-story">
        <div className="about-story-media">
          <div className="about-frame">
            <img
              src="/ass/photo-1.avif"
              alt="Our saree shop, shelves lined with folded silk sarees"
              loading="lazy"
            />
          </div>
          <span className="about-frame-thread" aria-hidden="true"></span>
        </div>

        <div className="about-story-content">
          <span className="about-eyebrow">Since The Loom</span>
          <h1 className="about-title">
            A Shop Built <br />
            <span>Thread By Thread</span>
          </h1>
          <span className="about-divider"></span>

          <p className="about-desc">
            What began as a single family stall trading in handloom silk has grown
            into a curated home for sarees and jewelry — but the way we choose
            pieces hasn't changed. We visit the weaver clusters ourselves, sit
            with the karigars who set the stones, and bring back only what we'd
            drape on our own daughters.
          </p>
          <p className="about-desc">
            Every saree is checked by hand for weave and finish, and every
            jewelry piece is matched to the drapes we stock, so what you order
            online is exactly what you'd have chosen in the store.
          </p>

          <div className="about-highlights">
            <div className="about-highlight">
              <span className="about-highlight-num">12+</span>
              <span className="about-highlight-label">Years in the trade</span>
            </div>
            <div className="about-highlight">
              <span className="about-highlight-num">40+</span>
              <span className="about-highlight-label">Weaver clusters visited</span>
            </div>
            <div className="about-highlight">
              <span className="about-highlight-num">4.8★</span>
              <span className="about-highlight-label">Rated by our customers</span>
            </div>
          </div>

          <div className="about-story-actions">
            <Link to="/product" className="about-btn-primary">Explore Our Collections</Link>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE SELL — sarees & jewelry ===== */}
      <section className="about-offerings">
        <div className="about-offerings-heading">
          <span className="about-eyebrow">What We Sell</span>
          <h2 className="about-section-title">Two Crafts, One Drape</h2>
          <p className="about-section-subtitle">
            We keep our range to what we know best — so every piece gets our full attention.
          </p>
        </div>

        <div className="about-offerings-grid">
          {offerings.map((item) => (
            <div className="about-offer-card" key={item.name}>
              <div className="about-offer-media">
                <img src={item.src} alt={item.name} loading="lazy" />
                <span className="about-offer-tag">{item.tag}</span>
              </div>
              <h3 className="about-offer-name">{item.name}</h3>
              <p className="about-offer-desc">{item.desc}</p>
              <Link to={item.link} className="about-offer-link">
                {item.cta}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== OUR GALLERY — real photos of the shop, team & craft ===== */}
      <section className="about-gallery">
        <div className="about-gallery-heading">
          <span className="about-eyebrow">A Peek Inside</span>
          <h2 className="about-section-title">Our Gallery</h2>
          <p className="about-section-subtitle">
            A few glimpses of our shop, our team, and the craft behind every piece.
          </p>
        </div>

        <div className="about-gallery-grid">
          {gallery.map((item) => (
            <div className="about-gallery-item" key={item.src}>
              <img src={item.src} alt={item.alt} loading="lazy" />
              <span className="about-gallery-caption">{item.caption}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VISIT THE SHOP — location ===== */}
      <section className="about-visit">
        <div className="about-visit-content">
          <span className="about-eyebrow">Visit Us</span>
          <h2 className="about-section-title">Come, Sit With A Cup Of Chai</h2>
          <p className="about-section-subtitle about-visit-copy">
            Nothing beats seeing the drape in person. Walk in, and we'll help
            you find the one that fits the occasion.
          </p>

          <ul className="about-visit-details">
            <li>
              <span className="about-visit-label">Address</span>
              <span>No. 14, Big Bazaar Street, Tāramangalam, Tamil Nadu, India</span>
            </li>
            <li>
              <span className="about-visit-label">Store Hours</span>
              <span>Mon – Sat, 10:00 AM – 8:30 PM</span>
            </li>
            <li>
              <span className="about-visit-label">Phone</span>
              <span>+91 98765 43210</span>
            </li>
          </ul>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Tāramangalam,Tamil+Nadu,India"
            target="_blank"
            rel="noopener noreferrer"
            className="about-btn-secondary about-visit-btn"
          >
            Get Directions
          </a>
        </div>

        <div className="about-visit-map">
          <iframe
            title="Shop location map"
            src="https://maps.google.com/maps?q=Taramangalam,Tamil%20Nadu,India&z=13&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </>
  );
}