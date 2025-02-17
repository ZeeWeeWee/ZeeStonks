import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; 
import Dashboard from "./components/Dashboard";
import StockNewsPage from "./components/StockNewsPage";  
import "./styles.css"; // ✅ Make sure this file exists!

const App = () => {
  // ✅ Check if user has a saved preference; default to system preference
  const initialDarkMode =
    localStorage.getItem("darkMode") === "true" ||
    (!localStorage.getItem("darkMode") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [darkMode, setDarkMode] = useState(initialDarkMode);

  // ✅ Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div className={`app ${darkMode ? "dark" : "light"}`}>
        {/* ✅ Toggle Dark Mode Button */}
        <button onClick={() => setDarkMode(!darkMode)} className="toggle-btn">
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* ✅ Navigation Links */}
        <nav>
          <Link to="/">🏠 Home</Link>
          <Link to="/news">📰 Stock News</Link>
        </nav>

        {/* ✅ Page Routing */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<StockNewsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;