import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import axios from 'axios';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(history);
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const fetchWeatherData = async (city) => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`https://weatherwise-dashboard-bckend.onrender.com/api/weather?city=${city}`);
      
      setWeatherData(response.data);
      
      // Add to search history if not already present
      if (!searchHistory.includes(city)) {
        // Keep only the last 5 searches
        const updatedHistory = [city, ...searchHistory].slice(0, 5);
        setSearchHistory(updatedHistory);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.response?.data?.message || 'Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (city) => {
    fetchWeatherData(city);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="app-title">WeatherWise Dashboard</h1>
        <SearchBar onSearch={fetchWeatherData} />
        
        {searchHistory.length > 0 && (
          <div className="search-history fade-in">
            <h3>Recent Searches</h3>
            <div className="history-items">
              {searchHistory.map((city, index) => (
                <button 
                  key={index} 
                  className="history-item"
                  onClick={() => handleHistoryClick(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {loading && <div className="loading">Loading weather data...</div>}
        
        {error && <div className="error-message slide-up">{error}</div>}
        
        {weatherData && !loading && !error && (
          <WeatherCard 
            current={weatherData.current} 
            forecast={weatherData.forecast} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
