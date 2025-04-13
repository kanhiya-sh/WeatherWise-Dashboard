# WeatherWise Dashboard

A real-time weather dashboard built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to search for weather information by city name.

## Features

- Search for current weather by city name
- Display of current weather conditions including temperature, humidity, wind speed, etc.
- 5-day weather forecast
- Search history stored in localStorage
- Responsive design for all device sizes

## Project Structure

```
weather-dashboard/
│
├── client/               # React frontend
│   └── src/
│       ├── components/   # SearchBar.jsx, WeatherCard.jsx
│       ├── App.js
│       └── index.js
│   └── package.json
│
├── server/               # Node.js backend
│   ├── routes/
│   │   └── weather.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenWeatherMap API key (get one at https://openweathermap.org/appid)

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   OPENWEATHERMAP_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual OpenWeatherMap API key.

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

4. The application should now be running at `http://localhost:3000`

## API Endpoints

- `GET /api/weather?city={cityname}` - Get current weather and 5-day forecast for a specific city

## Technologies Used

- **Frontend**: React.js, Axios, CSS
- **Backend**: Node.js, Express.js
- **API**: OpenWeatherMap API
- **Storage**: localStorage for search history

## License

This project is open source and available under the MIT License.
