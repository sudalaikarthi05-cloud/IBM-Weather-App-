import { useState, useEffect, useRef } from "react";
import axios from "axios";
import cityList from "./city.list.json";

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [cityImage, setCityImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [forecast, setForecast] = useState(null);
  const suggestionsRef = useRef(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "d4663108d86f0b4cd1c9d52b2012cc1c";
  const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "7g6lMHPjWpkTCMYX7xwIGee39wLXLm1e16lXgiu81HhNaPa7hecbh8Dz";

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("weatherSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory.slice(0, 8)));
    }
  }, [searchHistory]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = cityList
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
  }, [query]);

  // Add to search history
  const addToHistory = (cityData) => {
    const historyItem = {
      id: `${cityData.name}-${Date.now()}`,
      name: cityData.name,
      country: cityData.country,
      lat: cityData.coord.lat,
      lon: cityData.coord.lon,
      timestamp: new Date().toISOString()
    };
    setSearchHistory(prev => [historyItem, ...prev.filter(item =>
      item.name !== cityData.name || item.country !== cityData.country
    )].slice(0, 8));
  };

  // Generate better search queries for city images
  const generateSearchQueries = (cityName, country, weatherCondition = "") => {
    const baseQueries = [
      `${cityName} ${country} city`,
      `${cityName} skyline`,
      `${cityName} landscape`,
      `${cityName} downtown`,
      `${cityName} cityscape`,
      `${cityName} urban`,
      `${cityName} aerial view`
    ];

    // Add weather-specific queries if weather condition is available
    if (weatherCondition) {
      const weatherQueries = [
        `${cityName} ${weatherCondition} weather`,
        `${cityName} ${weatherCondition} day`,
        `${cityName} ${weatherCondition}`
      ];
      return [...weatherQueries, ...baseQueries];
    }

    return baseQueries;
  };

  // Get relevant fallback images based on weather condition
  const getFallbackImage = (weatherCondition = "") => {
    const fallbackImages = {
      'Clear': 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Clouds': 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Rain': 'https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Snow': 'https://images.pexels.com/photos/688660/pexels-photo-688660.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Thunderstorm': 'https://images.pexels.com/photos/1162251/pexels-photo-1162251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Drizzle': 'https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Mist': 'https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Fog': 'https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'Haze': 'https://images.pexels.com/photos/355241/pexels-photo-355241.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'default': 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    };

    return fallbackImages[weatherCondition] || fallbackImages.default;
  };

  // Fetch city image from Pexels with better search
  const fetchCityImage = async (cityName, country, weatherCondition = "") => {
    setImageLoading(true);
    try {
      const searchQueries = generateSearchQueries(cityName, country, weatherCondition);
      let foundImage = null;
      
      // Try each search query until we find a good image
      for (const searchQuery of searchQueries) {
        try {
          const response = await axios.get(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
            { 
              headers: { 
                Authorization: PEXELS_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
          
          if (response.data.photos?.length > 0) {
            // Filter for high-quality landscape images
            const goodPhotos = response.data.photos.filter(photo => 
              photo.width > photo.height && // Landscape orientation
              photo.src.original && // Has original source
              !photo.src.original.includes('placeholder') // Not a placeholder
            );
            
            if (goodPhotos.length > 0) {
              foundImage = goodPhotos[0];
              console.log(`Found image for: ${searchQuery}`);
              break;
            }
          }
        } catch (error) {
          console.warn(`Search query failed: ${searchQuery}`, error.message);
          continue;
        }
      }
      
      if (foundImage) {
        setCityImage(foundImage.src.large2x || foundImage.src.original);
        console.log('Successfully loaded city image');
      } else {
        // Use weather-appropriate fallback image
        const fallback = getFallbackImage(weatherCondition);
        setCityImage(fallback);
        console.log('Using fallback image for:', weatherCondition);
      }
    } catch (error) {
      console.error('Image fetch error:', error);
      const fallback = getFallbackImage(weatherCondition);
      setCityImage(fallback);
    } finally {
      setImageLoading(false);
    }
  };

  // Group forecast by day and get daily data
  const getDailyForecast = (forecastData) => {
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
    
    // Convert to array and calculate daily averages
    return Object.keys(dailyData).slice(0, 5).map(day => {
      const data = dailyData[day];
      const avgTemp = data.temps.reduce((a, b) => a + b, 0) / data.temps.length;
      const maxTemp = Math.max(...data.temps);
      const minTemp = Math.min(...data.temps);
      
      // Get most frequent weather condition
      const weatherCount = {};
      data.weather.forEach(w => {
        const key = w.main;
        weatherCount[key] = (weatherCount[key] || 0) + 1;
      });
      const dominantWeather = Object.keys(weatherCount).reduce((a, b) => 
        weatherCount[a] > weatherCount[b] ? a : b
      );
      const dominantWeatherObj = data.weather.find(w => w.main === dominantWeather);
      
      return {
        date: data.date,
        dayName: data.date.toLocaleDateString('en-US', { weekday: 'long' }),
        shortDay: data.date.toLocaleDateString('en-US', { weekday: 'short' }),
        avgTemp: avgTemp,
        maxTemp: maxTemp,
        minTemp: minTemp,
        weather: dominantWeatherObj,
        avgHumidity: data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length,
        avgWind: data.wind.reduce((a, b) => a + b, 0) / data.wind.length
      };
    });
  };

  // Fetch forecast data
  const fetchForecast = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      setForecast(response.data);
    } catch (error) {
      console.error("Forecast fetch error:", error);
    }
  };

  // Fetch weather data
  const getWeather = async (lat, lon, cityName = "", country = "") => {
    setLoading(true);
    setError("");
    try {
      const [weatherRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`),
        fetchForecast(lat, lon)
      ]);
      setWeather(weatherRes.data);
      setSuggestions([]);
      setShowHistory(false);
      const city = cityName || weatherRes.data.name;
      const countryCode = country || weatherRes.data.sys.country;
      const weatherCondition = weatherRes.data.weather[0]?.main;
      
      if (cityName && country) addToHistory({ name: cityName, country: countryCode, coord: { lat, lon } });
      
      // Fetch city image with weather context
      await fetchCityImage(city, countryCode, weatherCondition);
    } catch (err) {
      console.error("Weather fetch error:", err);

      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please wait a moment and try again.");
      } else if (err.response?.status === 404) {
        setError("City not found. Please check the spelling and try again.");
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.message?.includes('Network Error')) {
        setError('Network error. Please check your internet connection.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to fetch weather data. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && suggestions[0]) {
      getWeather(
        suggestions[0].coord.lat,
        suggestions[0].coord.lon,
        suggestions[0].name,
        suggestions[0].country
      );
    }
  };

  // Convert temperature helper
  const convertTemp = (temp, toUnit) => {
    if (toUnit === "metric") return Math.round((temp - 32) * 5 / 9); // F → C
    if (toUnit === "imperial") return Math.round(temp * 9 / 5 + 32);   // C → F
    return temp;
  };

  // Toggle temperature unit
  const toggleUnit = (newUnit) => {
    if (!weather || unit === newUnit) return;
    setUnit(newUnit);

    // Convert current weather
    setWeather(prev => ({
      ...prev,
      main: {
        ...prev.main,
        temp: convertTemp(prev.main.temp, newUnit),
        feels_like: convertTemp(prev.main.feels_like, newUnit),
        temp_min: convertTemp(prev.main.temp_min, newUnit),
        temp_max: convertTemp(prev.main.temp_max, newUnit),
      },
      wind: {
        ...prev.wind,
        speed: newUnit === "metric"
          ? Math.round(prev.wind.speed / 2.237 * 10) / 10  // mph → m/s
          : Math.round(prev.wind.speed * 2.237 * 10) / 10 // m/s → mph
      }
    }));

    // Convert forecast
    if (forecast) {
      setForecast(prev => ({
        ...prev,
        list: prev.list.map(item => ({
          ...item,
          main: {
            ...item.main,
            temp: convertTemp(item.main.temp, newUnit)
          }
        }))
      }));
    }
  };

  // Weather icon
  const getWeatherIcon = (condition) => {
    const icons = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌦️',
      '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("weatherSearchHistory");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start text-white p-4 pt-8 transition-all duration-1000 relative overflow-hidden"
      style={{
        backgroundImage: cityImage ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${cityImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 z-0"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Image Loading Indicator */}
      {imageLoading && (
        <div className="fixed top-4 right-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          {/* Loading city image... */}
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="text-6xl animate-pulse">🌤️</div>
              <div className="absolute -inset-4 bg-white/10 rounded-full blur-lg"></div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 mb-2">
                WeatherScope
              </h1>
              <p className="text-blue-100 text-lg font-light">Global Weather Intelligence</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="w-full mb-8">
          <div className="relative" ref={suggestionsRef}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="🌍 Search for any city worldwide..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowHistory(false); }}
                  onFocus={() => setShowHistory(searchHistory.length > 0)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-4 rounded-2xl text-gray-800 bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-transparent text-lg placeholder-gray-500 transition-all duration-300 pr-12 font-medium"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                  {query && (
                    <button 
                      onClick={() => setQuery("")} 
                      className="text-gray-400 hover:text-gray-600 transition-colors text-lg hover:scale-110 transform duration-200" 
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                  {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions and History */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                  <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <span>📚</span>
                    Recent Searches
                  </div>
                  <button 
                    onClick={clearHistory} 
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                    title="Clear all history"
                  >
                    Clear all
                  </button>
                </div>
                {searchHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-200 flex items-center justify-between group"
                    onClick={() => { setQuery(`${item.name}, ${item.country}`); getWeather(item.lat, item.lon, item.name, item.country); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500 group-hover:scale-110 transform duration-200">📍</div>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.country}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      Select
                    </div>
                  </div>
                ))}
              </div>
            )}

            {suggestions.length > 0 && !showHistory && (
              <ul className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto">
                {suggestions.map((city, idx) => (
                  <li 
                    key={`${city.id}-${idx}`} 
                    className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-200 flex items-center justify-between group"
                    onClick={() => { setQuery(`${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`); getWeather(city.coord.lat, city.coord.lon, city.name, city.country); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500 group-hover:scale-110 transform duration-200">🏙️</div>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.state ? `${city.state}, ` : ""}{city.country}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">View</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { if (suggestions[0]) getWeather(suggestions[0].coord.lat, suggestions[0].coord.lon, suggestions[0].name, suggestions[0].country); }}
              disabled={!suggestions.length || loading}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border border-blue-400/30 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-3 text-lg"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent relative z-10"></div>
                  <span className="relative z-10">Loading Weather...</span>
                </>
              ) : (
                <>
                  <span className="text-xl relative z-10">🌤️</span>
                  <span className="relative z-10">Get Weather</span>
                </>
              )}
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  if (!navigator.geolocation) {
                    throw new Error('Geolocation is not supported by your browser');
                  }
                  
                  const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                      timeout: 10000,
                      enableHighAccuracy: true
                    });
                  });
                  
                  const { latitude, longitude } = position.coords;
                  await getWeather(latitude, longitude);
                } catch (err) {
                  let message = 'Unable to retrieve your location';
                  if (err.code === 1) {
                    message = 'Location permission denied. Please enable location access.';
                  } else if (err.code === 2) {
                    message = 'Location information unavailable';
                  } else if (err.code === 3) {
                    message = 'Location request timed out';
                  }
                  setError(message);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 border border-green-400/30 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-3 text-lg"
              title="Use my current location"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="text-xl relative z-10">📍</span>
              <span className="relative z-10">Current Location</span>
            </button>
          </div>
        </div>

        {/* Weather Display */}
        {weather && !loading && (
          <div className="w-full animate-fadeIn">
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 shadow-lg">
              {[
                { id: "current", label: "Current", icon: "🌡️" },
                { id: "forecast", label: "5-Day Forecast", icon: "📅" },
                { id: "details", label: "Details", icon: "📊" }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab.id 
                    ? "bg-white/20 text-white shadow-md font-semibold border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Current Weather Tab */}
            {activeTab === "current" && (
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl mb-6">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{weather.name}, {weather.sys.country}</h2>
                    <p className="text-white/80 text-lg">{new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl mb-2 animate-pulse">{getWeatherIcon(weather.weather[0].icon)}</div>
                    <div className="text-xl font-semibold capitalize">{weather.weather[0].description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="text-7xl font-bold drop-shadow-lg">{Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}</div>
                  <div className="flex gap-2 bg-white/10 rounded-xl p-1">
                    <button
                      onClick={() => toggleUnit("metric")}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        unit === "metric" 
                        ? "bg-white text-blue-600 shadow-md font-semibold" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      °C
                    </button>
                    <button
                      onClick={() => toggleUnit("imperial")}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        unit === "imperial" 
                        ? "bg-white text-blue-600 shadow-md font-semibold" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-white/80 text-lg">
                  <div className="flex items-center gap-3">
                    <span>🌡️</span>
                    <span>Feels Like: {Math.round(weather.main.feels_like)}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>💧</span>
                    <span>Humidity: {weather.main.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>💨</span>
                    <span>Wind: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>📊</span>
                    <span>Pressure: {weather.main.pressure} hPa</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast Tab */}
            {activeTab === "forecast" && forecast && (
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">5-Day Weather Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {getDailyForecast(forecast).map((day, index) => (
                    <div 
                      key={index}
                      className={`bg-white/10 rounded-xl p-4 flex flex-col items-center hover:bg-white/15 transition-all duration-300 hover:scale-105 border ${
                        index === 0 ? 'border-blue-400/50 bg-blue-500/20 scale-105 shadow-lg' : 'border-white/10'
                      }`}
                    >
                      <div className={`font-semibold text-lg mb-2 ${
                        index === 0 ? 'text-blue-200' : 'text-white'
                      }`}>
                        {index === 0 ? 'Today' : day.dayName}
                      </div>
                      <div className="text-sm text-white/70 mb-3">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-4xl mb-3 animate-pulse">
                        {getWeatherIcon(day.weather.icon)}
                      </div>
                      <div className="text-center mb-3">
                        <div className={`font-bold text-2xl mb-1 ${
                          index === 0 ? 'text-blue-100' : 'text-white'
                        }`}>
                          {Math.round(day.avgTemp)}°{unit === "metric" ? "C" : "F"}
                        </div>
                        <div className="text-sm text-white/70 capitalize">
                          {day.weather.description}
                        </div>
                      </div>
                      <div className="flex justify-between w-full text-sm text-white/80 mt-2">
                        <div className="text-center">
                          <div>⬆️</div>
                          <div>{Math.round(day.maxTemp)}°</div>
                        </div>
                        <div className="text-center">
                          <div>⬇️</div>
                          <div>{Math.round(day.minTemp)}°</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full mt-3 text-xs text-white/70">
                        <div className="flex items-center gap-1">
                          <span>💧</span>
                          <span>{Math.round(day.avgHumidity)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💨</span>
                          <span>{Math.round(day.avgWind * 10) / 10}{unit === "metric" ? "m/s" : "mph"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Weather Details</h3>
                <div className="grid grid-cols-2 gap-6 text-white/80 text-lg">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>📉</span>
                      Min Temperature
                    </span>
                    <span className="font-semibold">{Math.round(weather.main.temp_min)}°{unit === "metric" ? "C" : "F"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>📈</span>
                      Max Temperature
                    </span>
                    <span className="font-semibold">{Math.round(weather.main.temp_max)}°{unit === "metric" ? "C" : "F"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>🌡️</span>
                      Feels Like
                    </span>
                    <span className="font-semibold">{Math.round(weather.main.feels_like)}°{unit === "metric" ? "C" : "F"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>💧</span>
                      Humidity
                    </span>
                    <span className="font-semibold">{weather.main.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>📊</span>
                      Pressure
                    </span>
                    <span className="font-semibold">{weather.main.pressure} hPa</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>💨</span>
                      Wind Speed
                    </span>
                    <span className="font-semibold">{weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>☁️</span>
                      Cloudiness
                    </span>
                    <span className="font-semibold">{weather.clouds.all}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>🌅</span>
                      Sunrise
                    </span>
                    <span className="font-semibold">{formatTime(weather.sys.sunrise)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>🌇</span>
                      Sunset
                    </span>
                    <span className="font-semibold">{formatTime(weather.sys.sunset)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-3">
                      <span>👁️</span>
                      Visibility
                    </span>
                    <span className="font-semibold">{weather.visibility / 1000} km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl text-center backdrop-blur-sm mt-4 animate-shake">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}