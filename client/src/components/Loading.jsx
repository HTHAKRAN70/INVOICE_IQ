import React from 'react';
import './Loading.css'; // Import the CSS file for styling

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1>InvoiceIQ</h1>
        <div class="typewriter">
            <div class="slide"><i></i></div>
            <div class="paper"></div>
            <div class="keyboard"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
