import { getWeatherIcon, formatTime, getTimezoneDateTime, isExtremeWeather } from '../utils/weatherHelpers';

export default function CurrentWeather({ weather, unit, onToggleUnit }) {
  const { date, time } = getTimezoneDateTime(weather.timezone);
  const extreme = isExtremeWeather(weather.weather[0].main, weather.main.temp, weather.wind.speed);

  return (
    <div className={`bg-black/40 backdrop-blur-md border rounded-2xl p-8 shadow-2xl mb-6 ${
      extreme ? 'border-red-500/50 ring-2 ring-red-500/30' : 'border-white/20'
    }`}>
      {extreme && (
        <div className="mb-4 bg-red-500/20 border border-red-400/50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-red-200">Extreme Weather Alert</div>
            <div className="text-sm text-red-100/80">Take necessary precautions</div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">{weather.name}, {weather.sys.country}</h2>
          <p className="text-white/80 text-lg mb-1">{date}</p>
          <p className="text-white/60">{time}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl mb-2 animate-pulse">{getWeatherIcon(weather.weather[0].icon)}</div>
          <div className="text-xl font-semibold capitalize">{weather.weather[0].description}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="text-7xl font-bold drop-shadow-lg">
          {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
        </div>
        <div className="flex gap-2 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => onToggleUnit('metric')}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              unit === 'metric' 
              ? 'bg-white text-blue-600 shadow-md font-semibold' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => onToggleUnit('imperial')}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${
              unit === 'imperial' 
              ? 'bg-white text-blue-600 shadow-md font-semibold' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌡️</span>
            <span className="text-sm text-white/60">Feels Like</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(weather.main.feels_like)}°</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💧</span>
            <span className="text-sm text-white/60">Humidity</span>
          </div>
          <div className="text-2xl font-bold">{weather.main.humidity}%</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💨</span>
            <span className="text-sm text-white/60">Wind Speed</span>
          </div>
          <div className="text-2xl font-bold">
            {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📊</span>
            <span className="text-sm text-white/60">Pressure</span>
          </div>
          <div className="text-2xl font-bold">{weather.main.pressure} hPa</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">👁️</span>
            <span className="text-sm text-white/60">Visibility</span>
          </div>
          <div className="text-2xl font-bold">{(weather.visibility / 1000).toFixed(1)} km</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌅</span>
            <span className="text-sm text-white/60">Sunrise</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(weather.sys.sunrise, weather.timezone)}</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌇</span>
            <span className="text-sm text-white/60">Sunset</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(weather.sys.sunset, weather.timezone)}</div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">☁️</span>
            <span className="text-sm text-white/60">Cloudiness</span>
          </div>
          <div className="text-2xl font-bold">{weather.clouds.all}%</div>
        </div>
      </div>
    </div>
  );
}
