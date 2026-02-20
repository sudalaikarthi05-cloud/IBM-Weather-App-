import { useState, useEffect, useCallback } from 'react';
import { weatherService } from './services/weatherService';
import { geolocationService } from './services/geolocationService';
import { imageService } from './services/imageService';
import { convertTemp, convertWindSpeed } from './utils/weatherHelpers';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import ErrorDisplay from './components/ErrorDisplay';
import SkeletonLoader from './components/SkeletonLoader';

export default function AppEnhanced() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');
  const [cityImage, setCityImage] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory.slice(0, 8)));
    }
  }, [searchHistory]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh weather data every 5 minutes
  useEffect(() => {
    if (!weather) return;
    
    const interval = setInterval(() => {
      fetchWeatherData(weather.coord.lat, weather.coord.lon, weather.name, weather.sys.country, true);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [weather]);

  const addToHistory = useCallback((cityData) => {
    const historyItem = {
      id: `${cityData.name}-${Date.now()}`,
      name: cityData.name,
      country: cityData.country,
      coord: { lat: cityData.lat, lon: cityData.lon }
    };
    
    setSearchHistory(prev => [
      historyItem,
      ...prev.filter(item => item.name !== cityData.name || item.country !== cityData.country)
    ].slice(0, 8));
  }, []);

  const fetchWeatherData = async (lat, lon, cityName = '', country = '', silent = false) => {
    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    if (!silent) setLoading(true);
    setError('');
    
    try {
      const [weatherData, forecastData, hourlyData] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon, unit),
        weatherService.getForecast(lat, lon, unit),
        weatherService.getHourlyForecast(lat, lon, unit)
      ]);
      
      setWeather(weatherData);
      setForecast(forecastData);
      setHourlyForecast(hourlyData);
      
      const city = cityName || weatherData.name;
      const countryCode = country || weatherData.sys.country;
      const weatherCondition = weatherData.weather[0]?.main;
      
      if (cityName && country) {
        addToHistory({ name: cityName, country: countryCode, lat, lon });
      }
      
      // Fetch city image
      const image = await imageService.fetchCityImage(city, countryCode, weatherCondition);
      setCityImage(image);
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else if (err.response?.status === 404) {
        setError('City not found. Please check the spelling and try again.');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to fetch weather data. Please try again.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { lat, lon } = await geolocationService.getCurrentPosition();
      await fetchWeatherData(lat, lon);
    } catch (err) {
      setError(err.message || 'Failed to get your location. Please search manually.');
      setLoading(false);
    }
  };

  const handleToggleUnit = (newUnit) => {
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
        speed: convertWindSpeed(prev.wind.speed, newUnit)
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

    // Convert hourly forecast
    if (hourlyForecast.length > 0) {
      setHourlyForecast(prev => prev.map(item => ({
        ...item,
        main: {
          ...item.main,
          temp: convertTemp(item.main.temp, newUnit)
        }
      })));
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('weatherSearchHistory');
  };

  const handleRetry = () => {
    if (weather) {
      fetchWeatherData(weather.coord.lat, weather.coord.lon, weather.name, weather.sys.country);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start text-white p-4 pt-8 transition-all duration-1000 relative overflow-hidden"
      style={{
        backgroundImage: cityImage 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${cityImage})` 
          : 'linear-gradient(135deg, #87caec 0%, #c7e3f4 100%)',
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

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl backdrop-blur-sm flex items-center gap-3 shadow-2xl">
          <span className="text-xl">📡</span>
          <span className="font-semibold">You are offline</span>
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
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 mb-2" style={{color:"white"}}>
                [FE T34] Real-Time Weather Dashboard
              </h1>
              <p className="text-blue-100 text-lg font-light" style={{color:"black"}}>Real-Time Weather Data Using Public API</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <SearchBar
          onSearch={fetchWeatherData}
          loading={loading}
          searchHistory={searchHistory}
          onClearHistory={clearHistory}
          onUseCurrentLocation={handleUseCurrentLocation}
        />

        {/* Error Display */}
        {error && !loading && (
          <ErrorDisplay 
            error={error} 
            onRetry={weather ? handleRetry : null}
            onDismiss={() => setError('')}
          />
        )}

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Weather Display */}
        {weather && !loading && !error && (
          <div className="w-full animate-fadeIn">
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 shadow-lg">
              {[
                { id: 'current', label: 'Current', icon: '🌡️' },
                { id: 'hourly', label: 'Hourly', icon: '⏰' },
                { id: 'forecast', label: '5-Day', icon: '📅' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-md font-semibold border border-white/30' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Current Weather Tab */}
            {activeTab === 'current' && (
              <CurrentWeather 
                weather={weather} 
                unit={unit} 
                onToggleUnit={handleToggleUnit}
              />
            )}

            {/* Hourly Forecast Tab */}
            {activeTab === 'hourly' && (
              <HourlyForecast 
                hourlyData={hourlyForecast} 
                unit={unit}
                timezone={weather.timezone}
              />
            )}

            {/* 5-Day Forecast Tab */}
            {activeTab === 'forecast' && (
              <DailyForecast 
                forecast={forecast} 
                unit={unit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
