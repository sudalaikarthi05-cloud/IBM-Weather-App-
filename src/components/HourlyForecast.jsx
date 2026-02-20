import { getWeatherIcon, formatTime } from '../utils/weatherHelpers';

export default function HourlyForecast({ hourlyData, unit, timezone }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl mb-6">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>⏰</span>
        24-Hour Forecast
      </h3>
      
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {hourlyData.map((hour, index) => (
            <div 
              key={index}
              className="bg-white/10 rounded-xl p-4 min-w-[120px] hover:bg-white/15 transition-all duration-300 hover:scale-105 border border-white/10"
            >
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">
                  {index === 0 ? 'Now' : formatTime(hour.dt, timezone)}
                </div>
                <div className="text-3xl mb-2">
                  {getWeatherIcon(hour.weather[0].icon)}
                </div>
                <div className="font-bold text-xl mb-1">
                  {Math.round(hour.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </div>
                <div className="text-xs text-white/60 capitalize mb-2">
                  {hour.weather[0].description}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-white/70">
                  <span>💧</span>
                  <span>{hour.main.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
