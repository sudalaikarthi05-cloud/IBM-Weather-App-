import { getWeatherIcon, getDailyForecast, isExtremeWeather } from '../utils/weatherHelpers';

export default function DailyForecast({ forecast, unit }) {
  if (!forecast) return null;

  const dailyData = getDailyForecast(forecast);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📅</span>
        5-Day Forecast
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dailyData.map((day, index) => {
          const extreme = isExtremeWeather(day.weather.main, day.avgTemp, day.avgWind);
          
          return (
            <div 
              key={index}
              className={`bg-white/10 rounded-xl p-4 flex flex-col items-center hover:bg-white/15 transition-all duration-300 hover:scale-105 border ${
                index === 0 ? 'border-blue-400/50 bg-blue-500/20 scale-105 shadow-lg' : 
                extreme ? 'border-red-400/50 bg-red-500/10' : 'border-white/10'
              }`}
            >
              {extreme && (
                <div className="mb-2 text-red-400 text-xs font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  Extreme
                </div>
              )}
              
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
                  {Math.round(day.avgTemp)}°{unit === 'metric' ? 'C' : 'F'}
                </div>
                <div className="text-sm text-white/70 capitalize">
                  {day.weather.description}
                </div>
              </div>
              
              <div className="flex justify-between w-full text-sm text-white/80 mt-2 mb-3">
                <div className="text-center">
                  <div>⬆️</div>
                  <div>{Math.round(day.maxTemp)}°</div>
                </div>
                <div className="text-center">
                  <div>⬇️</div>
                  <div>{Math.round(day.minTemp)}°</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 w-full text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <span>💧</span>
                  <span>{Math.round(day.avgHumidity)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💨</span>
                  <span>{Math.round(day.avgWind * 10) / 10}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
