import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-section" id='hero-section'>
      <div className="hero-content">
        <h1>Effortless Billing Management for a Smarter Business <span className='hero-span'>Your</span> Billing</h1>
        <p>Streamline your billing process with precision and efficiency, empowering your business to thrive in a fast-paced digital world.</p>
        <button>Get Started</button>
      </div>
      {/* The right side is intentionally left empty */}
    </div>
  );
};

export default Hero;
