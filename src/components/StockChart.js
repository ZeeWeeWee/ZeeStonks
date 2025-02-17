import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";

// ✅ Register the required chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_KEY = "JZF2D9VVQZLDNOQR";  // Replace with your real API key

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        );

        const timeSeries = response.data["Time Series (Daily)"];
        if (!timeSeries) {
          console.error("No historical data found:", response.data);
          setError("No historical data available.");
          return;
        }

        // Convert Dates and Prices
        const labels = Object.keys(timeSeries).slice(0, 7).reverse(); // Last 7 days
        const prices = labels.map((date) => parseFloat(timeSeries[date]["4. close"]));

        // ✅ Setting the chart data
        setChartData({
          labels,
          datasets: [
            {
              label: `${symbol} Stock Price (Last 7 Days)`,
              data: prices,
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.2)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError("Failed to load stock chart.");
      }
    };

    if (symbol) {
      fetchStockHistory();
    }

    return () => setChartData(null);  // ✅ Cleanup previous chart data when component unmounts
  }, [symbol]);

  return (
    <div>
      <h3>{symbol} Price Chart</h3>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : chartData ? (
        <Line data={chartData} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default StockChart;