import React from 'react';
import '../styles/Hero.css';
import HeroSlider from './HeroSlider';
import pg from '../assets/pregnant_woman.png';
import bag from '../assets/briefcase.png';
import wed from '../assets/woman_with_veil.png';
import heart from '../assets/sari.png';
import party from '../assets/tada.png';
import lamp from '../assets/diya_lamp.png';

const Hero = () => {
    return (
        <section className="hero">

            <div className="categoryBar">

                <div className="categoryItem">
                    <img src={wed} alt="Wedding Sarees" width={40} height={40} className="emoji" />
                    <span className="text">Wedding Collection</span>
                </div>


                <div className="categoryItem">
                    <img src={party} alt="party" width={40} height={40} className="emoji" />
                    <span className="text">Party Wear</span>
                </div>

                <div className="categoryItem">
                    <img src={lamp} alt="lamp" width={40} height={40} className="emoji" />
                    <span className="text">Festival Collection </span>
                </div>

                <div className="categoryItem">
                    <img src={heart} alt="heart" width={40} height={40} className="emoji" />
                    <span className="text">Daily Wear Sarees</span>
                </div>

                <div className="categoryItem">
                    <img src={bag} alt="Wedding" width={40} height={40} className="emoji" />
                    <span className="text">Office Wear Sarees</span>
                </div>

                <div className="categoryItem">
                    <img src={pg} alt="Sarees" width={40} height={40} className="emoji" />
                    <span className="text">Maternity Wear</span>
                </div>

            </div>

            
             <div className="hero-container">
                <HeroSlider />
            </div>

        </section>
    );
};


export default Hero;
