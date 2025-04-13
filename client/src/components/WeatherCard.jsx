import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ current, forecast }) => {
  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-container">
      {/* Current Weather Section */}
      <div className="current-weather">
        <div className="weather-header">
          <h2>{current.city}, {current.country}</h2>
          <p className="current-date">{formatDate(current.timestamp)}</p>
        </div>
        
        <div className="weather-main">
          <div className="weather-icon">
            <img 
              src={`https://openweathermap.org/img/wn/${current.weather.icon}@4x.png`} 
              alt={current.weather.description} 
            />
            <p>{current.weather.main}</p>
          </div>
          
          <div className="temperature">
            <h1>{Math.round(current.temperature)}°C</h1>
            <p>Feels like: {Math.round(current.feels_like)}°C</p>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{current.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wind</span>
            <span className="detail-value">{current.wind.speed} m/s</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{current.pressure} hPa</span>
          </div>
        </div>
      </div>
      
      {/* 5-Day Forecast Section */}
      <div className="forecast">
        <h3>5-Day Forecast</h3>
        <div className="forecast-container">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-day">
              <p className="forecast-date">{formatDate(day.date)}</p>
              <img 
                src={`https://openweathermap.org/img/wn/${day.weather.icon}.png`} 
                alt={day.weather.description} 
              />
              <p className="forecast-temp">{Math.round(day.temperature)}°C</p>
              <p className="forecast-desc">{day.weather.main}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
