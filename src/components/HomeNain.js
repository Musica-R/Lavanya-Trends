import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../styles/HomeMain.css";

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=1800&q=85",
    alt: "Woman draped in a rich red silk saree, full length",
    badge: "Festive Edit",
    title: "The Silk Route",
    titleAccent: "Woven In Red",
    desc: "Rich silk weaves crafted for celebrations, layered with heritage motifs and gold zari.",
  },
  {
    src: "https://images.unsplash.com/photo-1583878448938-0de973eec3b9?auto=format&fit=crop&w=1800&q=85",
    alt: "Woman in a red and brown handloom saree, full drape",
    badge: "Fresh Drops",
    title: "Sarees Draped",
    titleAccent: "In Timeless Grace",
    desc: "Handloom silks, Banarasi weaves and bridal drapes, each piece chosen for the story it tells.",
  },
  {
    src: "https://images.unsplash.com/photo-1720413390928-7077ba5def3a?auto=format&fit=crop&w=1800&q=85",
    alt: "Woman in a red and blue traditional saree, full drape",
    badge: "Bridal Edit",
    title: "The Painted Garden",
    titleAccent: "A Bloom Of Weaves",
    desc: "A collection of blooms and weaves, each piece crafted to captivate from first drape.",
  }
];

/* ===== SHOP-BY-CATEGORY IMAGES (Unsplash — free to use) ===== */
const categories = [
  {
    name: "Silk Sarees",
    src: "https://images.unsplash.com/photo-1609748340041-f5d61e061ebc?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Banarasi Sarees",
    src: "https://images.unsplash.com/photo-1610030469668-8e9f641aaf27?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Bridal Sarees",
    src: "https://images.unsplash.com/photo-1679006831648-7c9ea12e5807?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Earrings",
    src: "https://images.unsplash.com/photo-1680968921717-4abbbe793bb3?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Designer Sarees",
    src: "https://images.unsplash.com/photo-1615886753866-79396abc446e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Kanjivaram Silk",
    src: "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    name: "Fine Jewelry",
    src: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=300&h=300&q=80",
  }
];

export default function MainHero() {
  const bgRef = useRef(null);

  // Parallax: background banner moves slower than the page scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const offset = window.scrollY * 0.25; // tweak speed here
      bgRef.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className="main-hero">

        {/* BACKGROUND + TEXT SLIDER — each slide carries its own copy,
            so text changes together with the model/saree shown */}
        <div className="hero-bg-slider" ref={bgRef}>
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: ".hero-nav-prev",
              nextEl: ".hero-nav-next",
            }}
            loop
            className="main-swiper"
          >
            {heroSlides.map((slide) => (
              <SwiperSlide className="main-slide" key={slide.src}>
                <img src={slide.src} alt={slide.alt} loading="eager" />

                {/* per-slide gradient so the model stays clear on the left
                    and the text stays legible on the right */}
                <div className="hero-overlay"></div>

                <div className="main-hero-container">
                  <div className="main-hero-text">
                    <span className="hero-badge">🪔 {slide.badge}</span>

                    <h1 className="main-hero-title">
                      {slide.title} <br />
                      <span>{slide.titleAccent}</span>
                    </h1>

                    <span className="hero-divider"></span>

                    <p className="main-hero-desc">{slide.desc}</p>

                    <div className="main-hero-actions">
                      <Link to="/product" className="btn-primary">Shop Now</Link>
                      <a href="/jew" className="btn-secondary">Explore Jewelry</a>
                    </div>

                    <div className="hero-trust">
                      ⭐ 4.8 Rated &nbsp;|&nbsp; 🚚 Free Shipping &nbsp;|&nbsp; 🔒 Secure Payment
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom round nav arrows, styled like the reference site */}
          <button className="hero-nav hero-nav-prev" aria-label="Previous slide">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="hero-nav hero-nav-next" aria-label="Next slide">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section id="categories" className="category-section">
        <div className="category-heading">
          <span className="category-eyebrow">Curated For You</span>
          <h2 className="category-title">Shop by Category</h2>
          <p className="category-subtitle">
            From everyday elegance to bridal grandeur, and the jewelry to finish the look.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              to="/product"
              className="category-item"
              key={cat.name}
            >
              <span className="category-circle">
                <img src={cat.src} alt={cat.name} loading="lazy" />
              </span>
              <span className="category-label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}