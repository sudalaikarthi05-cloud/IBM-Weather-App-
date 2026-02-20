import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Retry mechanism for API calls
const apiCallWithRetry = async (url, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error.response?.status === 429) {
        // Rate limit - wait longer
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1) * 2));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
};

export const weatherService = {
  // Get current weather by coordinates
  getCurrentWeather: async (lat, lon, units = 'metric') => {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    return await apiCallWithRetry(url);
  },

  // Get 5-day forecast
  getForecast: async (lat, lon, units = 'metric') => {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    return await apiCallWithRetry(url);
  },

  // Get hourly forecast (next 24 hours from 5-day forecast)
  getHourlyForecast: async (lat, lon, units = 'metric') => {
    const forecast = await weatherService.getForecast(lat, lon, units);
    // Return first 8 items (24 hours, 3-hour intervals)
    return forecast.list.slice(0, 8);
  },

  // Get weather by city name
  getWeatherByCity: async (cityName, units = 'metric') => {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${units}`;
    return await apiCallWithRetry(url);
  }
};
