import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StockNews.css"; // ✅ Ensure this file exists
import { Link } from "react-router-dom";

const API_KEY = "cupp6j1r01qk8dnlghu0cupp6j1r01qk8dnlghug"; // ✅ Replace with your API key

const StockNewsPage = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketNews = async () => {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
        );

        if (!response.data || response.data.length === 0) {
          setError("No market news available.");
        } else {
          setNews(response.data.slice(0, 10)); // ✅ Show Top 10 News Articles
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching stock news:", error);
        setError("Failed to load news. Try again later.");
      }
    };

    fetchMarketNews();
  }, []);

  return (
    <div className="news-container">
      <h2>📰 Stock Market Latest News</h2>

      {/* ✅ Add a "Back to Home" button */}
      <Link to="/">
        <button className="news-button">🔙 Back to Dashboard</button>
      </Link>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <ul>
          {news.map((article, index) => (
            <li key={index} className="news-item">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <strong>{article.headline}</strong>
              </a>
              <p>{article.summary.length > 100 ? article.summary.slice(0, 100) + "..." : article.summary}</p>
              <small>{new Date(article.datetime * 1000).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockNewsPage;