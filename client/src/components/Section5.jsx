import React, { useState } from 'react';
import './Section5.css';

const faqs = [
  {
    question: "What is InvoiceIQ?",
    answer: "Financio is a comprehensive financial analytics platform designed to provide actionable insights and data-driven decision-making tools."
  },
  {
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Signup' button on the top right corner of the page and following the prompts to register."
  },
  {
    question: "What features are included in the free plan?",
    answer: "The free plan includes basic analytics features, limited access to historical data, and a limited number of reports. For advanced features, you can explore our paid plans."
  },
  {
    question: "How can I contact support?",
    answer: "You can contact our support team via the 'Contact' page on our website or by sending an email to support@financio.com."
  },
  {
    question: "Is my data secure with InvoiceIQ?",
    answer: "Yes, we prioritize data security and use advanced encryption techniques to ensure your data is safe and protected."
  }
];

const Section5 = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleFAQ = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <section className="section5 faq-section" id='section5'>
      <div className="faq-container">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                <span>{expanded === index ? '-' : '+'}</span>
              </div>
              {expanded === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section5;
