import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

import hero1 from "../assets/Gold and Burgundy Modern Elegant Sarees Sale Billboard (Landscape).png";
import hero2 from "../assets/Red and Green Illustrated Sarees Sale Facebook Ad.png";
import hero3 from "../assets/Red and Green Simple Elegant Sarees Republic Day Sale Billboard.png";
import hero4 from "../assets/Red and White Simple Traditional Republic Day Special Sale Billboard (Landscape).png";

export default function HeroSection() {
  return (
    <div className="hero-left">
      <section className="offer-banner"> 
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          loop={true}
          speed={1200} // smooth slide speed (ms)
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
        >
          <SwiperSlide>
            <img src={hero3} alt="Offer 2" className="offer-banner-img" />
          </SwiperSlide>

          <SwiperSlide>
            <img src={hero1} alt="Offer 3" className="offer-banner-img" />
          </SwiperSlide>

          <SwiperSlide>
            <img src={hero2} alt="Offer 1" className="offer-banner-img" />
          </SwiperSlide>

          <SwiperSlide>
            <img src={hero4} alt="Offer 4" className="offer-banner-img" />
          </SwiperSlide>
        </Swiper>
      </section>
    </div>
  );
}
