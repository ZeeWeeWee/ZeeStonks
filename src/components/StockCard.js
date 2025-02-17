import React, { useState, useEffect } from "react";
import "./StockCard.css";

const StockCard = ({ symbol, price, change, onBuy }) => {
  const [quantity, setQuantity] = useState(1); // Default to 1 share
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ✅ Detect dark mode when the card mounts
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    };

    checkDarkMode();
    window.addEventListener("storage", checkDarkMode); // ✅ Listen for theme changes

    return () => window.removeEventListener("storage", checkDarkMode);
  }, []);

  return (
    <div className={`stock-card ${isDarkMode ? "dark-card" : "light-card"}`}>
      <h3>{symbol}</h3>
      <p>Price: ${price ? price.toFixed(2) : "Loading..."}</p>
      <p style={{ color: change >= 0 ? "green" : "red" }}>
        Change: {change ? change.toFixed(2) : "N/A"}%
      </p>

      {/* Input for choosing number of stocks */}
      <input
        type="number"
        value={quantity}
        min="1"
        onChange={(e) => setQuantity(Number(e.target.value))}
        style={{ width: "60px", margin: "5px" }}
      />
      <button onClick={() => onBuy(symbol, price, quantity)} style={{ marginTop: "10px" }}>
        Buy Shares
      </button>
    </div>
  );
};

export default StockCard;