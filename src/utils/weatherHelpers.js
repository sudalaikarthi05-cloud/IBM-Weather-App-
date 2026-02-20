// Weather icon mapping
export const getWeatherIcon = (condition) => {
  const icons = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return icons[condition] || '🌤️';
};

// Temperature conversion
export const convertTemp = (temp, toUnit) => {
  if (toUnit === 'metric') return Math.round((temp - 32) * 5 / 9);
  if (toUnit === 'imperial') return Math.round(temp * 9 / 5 + 32);
  return temp;
};

// Wind speed conversion
export const convertWindSpeed = (speed, toUnit) => {
  if (toUnit === 'metric') return Math.round(speed / 2.237 * 10) / 10; // mph → m/s
  if (toUnit === 'imperial') return Math.round(speed * 2.237 * 10) / 10; // m/s → mph
  return speed;
};

// Format time from timestamp
export const formatTime = (timestamp, timezone = 0) => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

// Get day name from timestamp
export const getDayName = (timestamp, format = 'short') => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: format });
};

// Process daily forecast from hourly data
export const getDailyForecast = (forecastData) => {
  const dailyData = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toDateString();
    
    if (!dailyData[day]) {
      dailyData[day] = {
        date: date,
        temps: [],
        weather: [],
        humidity: [],
        wind: []
      };
    }
    
    dailyData[day].temps.push(item.main.temp);
    dailyData[day].weather.push(item.weather[0]);
    dailyData[day].humidity.push(item.main.humidity);
    dailyData[day].wind.push(item.wind.speed);
  });
  
  return Object.keys(dailyData).slice(0, 5).map(day => {
    const data = dailyData[day];
    const avgTemp = data.temps.reduce((a, b) => a + b, 0) / data.temps.length;
    const maxTemp = Math.max(...data.temps);
    const minTemp = Math.min(...data.temps);
    
    const weatherCount = {};
    data.weather.forEach(w => {
      weatherCount[w.main] = (weatherCount[w.main] || 0) + 1;
    });
    const dominantWeather = Object.keys(weatherCount).reduce((a, b) => 
      weatherCount[a] > weatherCount[b] ? a : b
    );
    const dominantWeatherObj = data.weather.find(w => w.main === dominantWeather);
    
    return {
      date: data.date,
      dayName: data.date.toLocaleDateString('en-US', { weekday: 'long' }),
      shortDay: data.date.toLocaleDateString('en-US', { weekday: 'short' }),
      avgTemp,
      maxTemp,
      minTemp,
      weather: dominantWeatherObj,
      avgHumidity: data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length,
      avgWind: data.wind.reduce((a, b) => a + b, 0) / data.wind.length
    };
  });
};

// Check for extreme weather conditions
export const isExtremeWeather = (weatherMain, temp, windSpeed) => {
  const extremeConditions = ['Thunderstorm', 'Snow', 'Tornado', 'Hurricane'];
  if (extremeConditions.includes(weatherMain)) return true;
  if (temp > 40 || temp < -10) return true; // Celsius
  if (windSpeed > 20) return true; // m/s
  return false;
};

// Get timezone-aware date and time
export const getTimezoneDateTime = (timezone) => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cityTime = new Date(utc + (timezone * 1000));
  
  return {
    date: cityTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: cityTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  };
};
