import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h1>InvoiceIQ.</h1>
        </div>
        <div className="footer-column">
          <h4>Useful Links</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/contact">For You</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Contact Us</h4>
          <p>Email: info@InvoiceIQ.com</p>
          <p>Phone: +91-825338788</p>
        </div>
        <div className="footer-column">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://www.instagram.com/pranavgupta509/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://github.com/Prgupta25" target="_blank" rel="noopener noreferrer">Github</a>
            <a href="https://www.linkedin.com/in/pranav-gupta-62971325a/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} InvoiceIQ. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
