import React, { useState, useEffect } from "react";
import StockCard from "./StockCard";
import StockSearch from "./StockSearch";
import StockChart from "./StockChart"; // ✅ Import StockChart
import axios from "axios";

const API_KEY = "API_KEY_HERE"; // Replace with your actual API key

const Dashboard = () => {
  // ✅ Load saved balance OR default to $10,000
  const [balance, setBalance] = useState(() => parseFloat(localStorage.getItem("balance")) || 10000);

  // ✅ Load saved portfolio OR set empty array
  const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem("portfolio")) || []);

  const [stocks, setStocks] = useState([]); // Store searched stocks
  const [portfolioValue, setPortfolioValue] = useState(0); // Store portfolio total

  // ✅ Auto-save portfolio & balance to local storage
  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("balance", balance.toString());
  }, [portfolio, balance]);

  // ✅ Fetch live portfolio value every 15 sec
  useEffect(() => {
    const fetchPortfolioValue = async () => {
      if (portfolio.length === 0) return;

      let totalValue = 0;
      for (let stock of portfolio) {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`
        );
        totalValue += stock.quantity * response.data.c; // ✅ Use live market price
      }
      setPortfolioValue(totalValue);
    };

    fetchPortfolioValue();
    const interval = setInterval(fetchPortfolioValue, 15000); // Refresh every 15 sec
  
    return () => clearInterval(interval);
  }, [portfolio]);

  // ✅ Fetch the stock price when user searches a stock
  const fetchStockData = async (symbol) => {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );

      const stockData = {
        symbol: symbol,
        price: response.data.c, // ✅ Get current live price
        change: response.data.dp, // ✅ Get percentage change
      };

      setStocks((prevStocks) => {
        const filteredStocks = prevStocks.filter((stock) => stock.symbol !== symbol);
        return [stockData, ...filteredStocks]; // ✅ Add new stock to the front
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // ✅ Buy stock
  const buyStock = (symbol, price, quantity) => {
    const totalCost = quantity * price;
    if (balance >= totalCost) {
      setPortfolio((prevPortfolio) => {
        const existingStock = prevPortfolio.find((stock) => stock.symbol === symbol);

        if (existingStock) {
          return prevPortfolio.map((stock) =>
            stock.symbol === symbol
              ? { ...stock, quantity: stock.quantity + quantity, totalValue: (stock.quantity + quantity) * price }
              : stock
          );
        } else {
          return [...prevPortfolio, { symbol, quantity, purchasePrice: price, totalValue: totalCost }];
        }
      });

      setBalance((prevBalance) => prevBalance - totalCost);
    } else {
      alert("Not enough balance!");
    }
  };

  // ✅ Sell stock at current market price
  const sellStock = async (symbol, quantity) => {
    const existingStock = portfolio.find((stock) => stock.symbol === symbol);
    if (!existingStock) {
      alert("You don't own this stock!");
      return;
    }
    if (existingStock.quantity < quantity) {
      alert(`You only have ${existingStock.quantity} shares!`);
      return;
    }

    try {
      // ✅ Get latest market price BEFORE selling
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );
      const currentPrice = response.data.c;

      if (!currentPrice) {
        alert("Failed to fetch latest stock price. Try again.");
        return;
      }

      // ✅ Update portfolio: Reduce shares or remove stock
      setPortfolio((prevPortfolio) => prevPortfolio
        .map((stock) =>
          stock.symbol === symbol
            ? stock.quantity - quantity > 0
              ? { ...stock, quantity: stock.quantity - quantity, totalValue: (stock.quantity - quantity) * currentPrice }
              : null
            : stock
        )
        .filter(Boolean)
      );

      // ✅ Add to balance
      setBalance((prevBalance) => prevBalance + currentPrice * quantity);
    } catch (error) {
      console.error("Error fetching latest stock price:", error);
      alert("Failed to get the latest stock price. Try again.");
    }
  };

  return (
    <div>
      <h2>📈 Live Stock Prices</h2>
      <StockSearch onSearch={fetchStockData} />

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {stocks.map((stock) => (
          <div key={stock.symbol} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <StockCard {...stock} onBuy={buyStock} />
            <StockChart symbol={stock.symbol} />
          </div>
        ))}
      </div>

      <h2>💰 Portfolio Summary</h2>
      <p>💵 <strong>Cash Balance:</strong> ${balance.toFixed(2)}</p>
      <p>📊 <strong>Portfolio Value:</strong> ${portfolioValue.toFixed(2)}</p>
      <p>🔥 <strong>Total Account Value:</strong> ${(balance + portfolioValue).toFixed(2)}</p>

      <h2>📂 My Portfolio</h2>
      <div>
        {portfolio.length > 0 ? (
          <ul>
            {portfolio.map((stock) => (
              <li key={stock.symbol}>
                {stock.symbol} - {stock.quantity} shares @ ${stock.purchasePrice.toFixed(2)}
                (Total: ${stock.totalValue.toFixed(2)})
                <div>
                  {[1, 5, 10, 20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => sellStock(stock.symbol, amount)}
                      disabled={stock.quantity < amount} // ✅ Disable if not enough shares
                      style={{
                        margin: "5px",
                        padding: "5px 10px",
                        backgroundColor: stock.quantity < amount ? "#ccc" : "#ff4b5c",
                        color: "white",
                        border: "none",
                        cursor: stock.quantity < amount ? "not-allowed" : "pointer",
                      }}
                    >
                      Sell {amount}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No stocks purchased yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;