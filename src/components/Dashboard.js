import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Ensure routing works for news page
import StockCard from "./StockCard";
import StockSearch from "./StockSearch";
import StockChart from "./StockChart"; // ✅ Ensure this file exists
import StockNews from "./StockNews"; // ✅ Import StockNews component
import axios from "axios";

const API_KEY = "API_KEY_HERE"; // 🔹 Replace with your actual API key

const Dashboard = () => {
  // ✅ Load balance from localStorage or default to $10,000
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance ? parseFloat(savedBalance) : 10000;
  });

  // ✅ Load portfolio from localStorage or default to an empty list
  const [portfolio, setPortfolio] = useState(() => {
    const savedPortfolio = localStorage.getItem("portfolio");
    return savedPortfolio ? JSON.parse(savedPortfolio) : [];
  });

  // ✅ Stores searched stocks
  const [stocks, setStocks] = useState([]); 
  const [portfolioValue, setPortfolioValue] = useState(0); // ✅ Portfolio total value

  // ✅ Save balance & portfolio to localStorage when they change
  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem("balance", balance.toString());
  }, [balance]);

  // ✅ Fetch live portfolio value every 15 seconds
  useEffect(() => {
    const fetchPortfolioValue = async () => {
      if (portfolio.length === 0) return;

      let totalValue = 0;
      for (let stock of portfolio) {
        try {
          const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`
          );
          totalValue += stock.quantity * response.data.c; // 🔹 Use live market price
        } catch (error) {
          console.error(`Error fetching live price for ${stock.symbol}:`, error);
        }
      }
      setPortfolioValue(totalValue);
    };

    fetchPortfolioValue();
    const interval = setInterval(fetchPortfolioValue, 15000); // 🔄 Refresh every 15 sec
    return () => clearInterval(interval);
  }, [portfolio]);

  // ✅ Fetch stock market data when searching for a stock
  const fetchStockData = async (symbol) => {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );

      const stockData = {
        symbol,
        price: response.data.c, // ✅ Get latest live stock price
        change: response.data.dp, // ✅ Get price change percentage
      };

      setStocks((prevStocks) => {
        const filteredStocks = prevStocks.filter((stock) => stock.symbol !== symbol);
        return [stockData, ...filteredStocks]; // ✅ Add new stock to the front
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // ✅ Buy stock & update portfolio
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

  // ✅ Sell stock & update portfolio
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
      // ✅ Get live market price before selling
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );
      const currentPrice = response.data.c;

      if (!currentPrice) {
        alert("Failed to fetch latest stock price. Try again.");
        return;
      }

      // ✅ Update portfolio (deduct shares or remove stock if quantity = 0)
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
            <StockNews symbol={stock.symbol} /> {/* ✅ Add News Below the Chart */}
          </div>
        ))}
      </div>

      {/* ✅ Button to go to the Market News Page */}
      <div style={{ marginTop: "20px" }}>
        <Link to="/news">
          <button className="news-button">📰 View Stock Market News</button>
        </Link>
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
                <div>
                  {[1, 5, 10, 20, 50, 100].map((amount) => (
                    <button key={amount} onClick={() => sellStock(stock.symbol, amount)}>
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