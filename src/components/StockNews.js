import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StockNews.css"; // ✅ Ensure this file exists

const API_KEY = "API_KEY_HERE"; // ✅ Replace with your actual API key

const StockNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-01-01&to=2024-02-15&token=${API_KEY}`
        );

        if (!response.data || response.data.length === 0) {
          setError("No news available for this stock.");
        } else {
          setNews(response.data.slice(0, 5)); // ✅ Limit to 5 news articles
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching stock news:", error);
        setError("Failed to load news. Try again later.");
      }
    };

    if (symbol) {
      fetchNews();
    }
  }, [symbol]);

  return (
    <div className="news-container">
      <h2>📰 {symbol} News</h2>

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

export default StockNews;