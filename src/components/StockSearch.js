import React, { useState } from "react";

const StockSearch = ({ onSearch }) => {
  const [query, setQuery] = useState(""); // State to store user input

  const handleSearch = (event) => {
    event.preventDefault(); // Prevent page reload
    if (query.trim() === "") return; // Ignore empty input
    
    console.log("Searching for stock: ", query); // Debugging line
  
    onSearch(query.toUpperCase()); // Sends stock symbol to Dashboard.js
    setQuery(""); // Clear input after search
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Enter stock symbol (e.g., AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        required
        style={{
          padding: "10px",
          fontSize: "16px",
          marginRight: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button type="submit" style={{ padding: "10px", fontSize: "16px" }}>
        🔍 Search
      </button>
    </form>
  );
};

export default StockSearch;