import React from 'react';
import './StockCard.css'; // Add some styles

const StockCard = ({ symbol, price, change }) => {
  return (
    <div className="stock-card">
      <h3>{symbol}</h3>
      <p>Price: ${price.toFixed(2)}</p>
      <p style={{ color: change >= 0 ? 'green' : 'red' }}>
        Change: {change.toFixed(2)}%
      </p>
    </div>
  );
};

export default StockCard;