import React from 'react';
import './Section3.css';
import freelancer from '../assets/freelancer.png'
import employed from '../assets/Employed.png'
import consultant from '../assets/consultant.png'
import contractor from '../assets/contractor.png'
const Section3 = () => {
  return (
    <div className="section3" id='section3'>
      <h1 className="section3-heading">For All the Small Business Owners like You</h1>
      <div className="grid-container">
        <div className="grid-item">
          <h2>Freelancers</h2>
          <img src= {freelancer} alt="Service 1" />
          <p>Create and send professional invoices in minutes.</p>
        </div>
        <div className="grid-item">
          <h2>Enterprenuers</h2>
          <img src={employed} alt="Service 2" />
          <p>Pay your staff (and yourself!) with confidence.</p>
        </div>
        <div className="grid-item">
          <h2>Consultant</h2>
          <img src={consultant} alt="Service 3" />
          <p>Set up recurring invoices and payments for retainer clients.</p>
        </div>
        <div className="grid-item">
          <h2>Contractor</h2>
          <img src={contractor} alt="Service 4" />
          <p>Track your business expenses with our free accounting tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Section3;
