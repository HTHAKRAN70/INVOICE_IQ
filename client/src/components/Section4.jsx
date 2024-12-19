import React, { useState } from 'react';
import './Section4.css';
import payment from '../assets/payment.png'
import invoice from '../assets/invoice.png'
// import consultant from '../assets/consultant.png'
import dashboard from '../assets/dashboard.png'

const content = [
  {
    heading: "Invoicing",
    paragraph: "Reduce unpaid invoices, keep tabs on your income, and get paid faster.",
    image: invoice
  },
  {
    heading: "Payments",
    paragraph: "Convenience is everything. Give your customers the option of paying with one click using a credit card, bank transfer, or Apple Pay.",
    image: payment
  },
  {
    heading: "Accounting",
    paragraph: "Monitor your cash flow, stay organized, and stop sweating tax season. Say #sorrynotsorry to your spreadsheets and shoeboxes.",
    image: "https://cdn.dribbble.com/userupload/4084901/file/original-947223b23df3d19700b35894cf6a4565.png?resize=1024x768"
  },
  {
    heading: "Analytics",
    paragraph: "Unlock actionable insights with our cutting-edge analytics, designed to drive data-informed decisions and fuel your business growth. Experience clarity and precision like never before",
    image: dashboard
  }
];

const Section4 = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="section4" id='section4'>
      <h1 className="section4-heading">Our tools work together,<br/>so you work less.</h1>
      <div className="button-row">
      {content.map((item, index) => (
          <button
            key={index}
            className={`feature-button ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {item.heading}
          </button>
        ))}
      </div>
      <div className="content-row">
        <img src={content[activeIndex].image} alt={content[activeIndex].heading} className="feature-image" />
        <div className="text-content">
          <h2>{content[activeIndex].heading}</h2>
          <p>{content[activeIndex].paragraph}</p>
        </div>
      </div>
    </div>
  );
};

export default Section4;
