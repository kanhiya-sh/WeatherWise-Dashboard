document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchForm = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const searchHistoryContainer = document.getElementById('search-history');
  const historyItemsContainer = document.getElementById('history-items');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error-message');
  const weatherContainer = document.getElementById('weather-container');
  
  // API URL for our server
  const API_URL = 'https://weatherwise-backend-y7jq.onrender.com/api/weather';
  
  // Load search history from localStorage
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
  // Initialize the app
  init();
  
  function init() {
    // Display search history if available
    updateSearchHistory();
    
    // Add event listeners
    searchForm.addEventListener('submit', handleSearch);
  }
  
  function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (!city) {
      showError('Please enter a city name');
      return;
    }
    
    fetchWeatherData(city);
  }
  
  async function fetchWeatherData(city) {
    try {
      // Show loading state
      showLoading(true);
      hideError();
      weatherContainer.style.display = 'none';
      
      console.log(`Fetching weather data for: ${city}`);
      console.log(`API URL: ${API_URL}?city=${encodeURIComponent(city)}`);
      
      // Fetch weather data from our server
      const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }
      
      // Update search history
      if (!searchHistory.includes(city)) {
        searchHistory = [city, ...searchHistory].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        updateSearchHistory();
      }
      
      // Display weather data
      displayWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Handle network errors
      if (error.message === 'Failed to fetch') {
        showError('Network error: Could not connect to the weather server. Please try again later.');
      } else {
        showError(error.message || 'Failed to fetch weather data. Please try again.');
      }
    } finally {
      showLoading(false);
    }
  }
  
  function displayWeatherData(data) {
    const { current, forecast } = data;
    
    // Format the weather data HTML
    const weatherHTML = `
      <div class="current-weather">
        <div class="weather-header">
          <h2>${current.city}, ${current.country}</h2>
          <p class="current-date">${formatDate(current.timestamp)}</p>
        </div>
        
        <div class="weather-main">
          <div class="weather-icon">
            <img 
              src="https://openweathermap.org/img/wn/${current.weather.icon}@4x.png" 
              alt="${current.weather.description}" 
            />
            <p>${current.weather.main}</p>
          </div>
          
          <div class="temperature">
            <h1>${Math.round(current.temperature)}°C</h1>
            <p>Feels like: ${Math.round(current.feels_like)}°C</p>
          </div>
        </div>
        
        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${current.humidity}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Wind</span>
            <span class="detail-value">${current.wind.speed} m/s</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pressure</span>
            <span class="detail-value">${current.pressure} hPa</span>
          </div>
        </div>
      </div>
      
      <div class="forecast">
        <h3>5-Day Forecast</h3>
        <div class="forecast-container">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p class="forecast-date">${formatDate(day.date)}</p>
              <img 
                src="https://openweathermap.org/img/wn/${day.weather.icon}.png" 
                alt="${day.weather.description}" 
              />
              <p class="forecast-temp">${Math.round(day.temperature)}°C</p>
              <p class="forecast-desc">${day.weather.main}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Update the UI
    weatherContainer.innerHTML = weatherHTML;
    weatherContainer.style.display = 'block';
  }
  
  function updateSearchHistory() {
    if (searchHistory.length > 0) {
      const historyHTML = searchHistory.map(city => 
        `<button class="history-item" data-city="${city}">${city}</button>`
      ).join('');
      
      historyItemsContainer.innerHTML = historyHTML;
      searchHistoryContainer.style.display = 'block';
      
      // Add event listeners to history items
      document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
          const city = item.dataset.city;
          cityInput.value = city;
          fetchWeatherData(city);
        });
      });
    } else {
      searchHistoryContainer.style.display = 'none';
    }
  }
  
  function showLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
  }
  
  function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  function hideError() {
    errorElement.style.display = 'none';
  }
  
  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
});
