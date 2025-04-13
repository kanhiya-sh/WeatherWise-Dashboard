const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');

// Load environment variables directly in this file as well
dotenv.config();

// GET /api/weather?city=cityname
router.get('/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    // Validate city parameter
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        message: 'City parameter is required' 
      });
    }

    // Get API key directly from .env file
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.error('OpenWeatherMap API key is missing. Please check your .env file.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: API key is missing'
      });
    }

    console.log(`Fetching weather data for city: ${city}`);
    console.log(`Using API key: ${apiKey.substring(0, 5)}...`);

    // Get current weather data
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    console.log(`Current weather URL: ${currentWeatherUrl}`);
    
    const currentWeatherResponse = await axios.get(currentWeatherUrl);

    // Get 5-day forecast data
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    console.log(`Forecast URL: ${forecastUrl}`);
    
    const forecastResponse = await axios.get(forecastUrl);

    // Process current weather data
    const currentWeather = {
      city: currentWeatherResponse.data.name,
      country: currentWeatherResponse.data.sys.country,
      temperature: currentWeatherResponse.data.main.temp,
      feels_like: currentWeatherResponse.data.main.feels_like,
      humidity: currentWeatherResponse.data.main.humidity,
      pressure: currentWeatherResponse.data.main.pressure,
      wind: {
        speed: currentWeatherResponse.data.wind.speed,
        deg: currentWeatherResponse.data.wind.deg
      },
      weather: {
        main: currentWeatherResponse.data.weather[0].main,
        description: currentWeatherResponse.data.weather[0].description,
        icon: currentWeatherResponse.data.weather[0].icon
      },
      timestamp: currentWeatherResponse.data.dt
    };

    // Process forecast data - group by day and get one forecast per day
    const forecastData = forecastResponse.data.list;
    const dailyForecasts = [];
    const processedDates = new Set();

    forecastData.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      
      // Only take one forecast per day (around noon if possible)
      if (!processedDates.has(date)) {
        processedDates.add(date);
        dailyForecasts.push({
          date: forecast.dt,
          temperature: forecast.main.temp,
          feels_like: forecast.main.feels_like,
          humidity: forecast.main.humidity,
          weather: {
            main: forecast.weather[0].main,
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon
          }
        });
      }
    });

    // Limit to 5 days
    const fiveDayForecast = dailyForecasts.slice(0, 5);

    // Send response
    res.json({
      success: true,
      current: currentWeather,
      forecast: fiveDayForecast
    });
    
  } catch (error) {
    console.error('Weather API Error:', error.message);
    console.error('Error details:', error.response?.data || 'No detailed error data');
    
    // Handle API key error
    if (error.response && error.response.data && error.response.data.cod === 401) {
      return res.status(500).json({
        success: false,
        message: 'Invalid API key. Please check your OpenWeatherMap API key in the .env file.'
      });
    }
    
    // Handle city not found error
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found. Please check the city name and try again.'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
