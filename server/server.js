const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5009;

// Hardcode API key for direct use
const API_KEY = '88fc10243c583e07e3db9703596fd52c';
console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Weather API route
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        message: 'City parameter is required' 
      });
    }

    console.log(`Fetching weather data for city: ${city}`);
    
    // Get current weather data
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    console.log(`Current weather URL: ${currentWeatherUrl}`);
    
    // Get hourly forecast data using Pro API
    const forecastUrl = `https://pro.openweathermap.org/data/2.5/forecast/hourly?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&cnt=120`; // 5 days x 24 hours
    console.log(`Forecast URL: ${forecastUrl}`);
    
    try {
      // Make API requests in parallel
      const [currentWeatherResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl)
      ]);
      
      console.log('Successfully fetched weather data');
      
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

      // Get one forecast per day (at noon)
      forecastData.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const hour = new Date(forecast.dt * 1000).getHours();
        
        // Only take one forecast per day (preferably around noon)
        if (!processedDates.has(date) && (hour >= 11 && hour <= 13)) {
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

      // If we didn't get 5 days (because noon wasn't available), fill in with any time
      if (dailyForecasts.length < 5) {
        processedDates.clear();
        forecastData.forEach(forecast => {
          const date = new Date(forecast.dt * 1000).toLocaleDateString();
          
          if (!processedDates.has(date) && dailyForecasts.length < 5) {
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
      }

      // Limit to 5 days
      const fiveDayForecast = dailyForecasts.slice(0, 5);

      // Send response
      res.json({
        success: true,
        current: currentWeather,
        forecast: fiveDayForecast
      });
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      
      // Try with the free API as fallback
      try {
        console.log('Trying fallback to free API...');
        const freeForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
          axios.get(currentWeatherUrl),
          axios.get(freeForecastUrl)
        ]);
        
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
      } catch (fallbackError) {
        console.error('Fallback API Error:', fallbackError.message);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('Weather API Error:', error.message);
    console.error('Error details:', error.response?.data || 'No detailed error data');
    
    // Handle API key error
    if (error.response && error.response.data && error.response.data.cod === 401) {
      return res.status(500).json({
        success: false,
        message: 'Invalid API key. Please check your OpenWeatherMap API key.'
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

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the app`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Port is in use, try another port
    const newPort = PORT + 1;
    console.log(`Port ${PORT} is in use, attempting to use port ${newPort}`);
    app.listen(newPort, () => {
      console.log(`Server running on alternate port ${newPort}`);
      console.log(`Open http://localhost:${newPort} in your browser to view the app`);
    });
  } else {
    console.error('Server error:', err);
  }
});
