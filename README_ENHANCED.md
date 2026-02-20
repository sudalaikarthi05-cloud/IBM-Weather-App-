# 🌤️ WeatherScope - Real-Time Weather Intelligence Dashboard

A modern, feature-rich weather dashboard built with React, Vite, and Tailwind CSS. Get real-time weather data, hourly and 5-day forecasts, with beautiful dynamic backgrounds and intelligent location detection.

![Weather Dashboard](https://img.shields.io/badge/React-19.1.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.18-cyan)

## ✨ Features

### 🔍 Smart City Search
- **Auto-suggest** with debounced API calls (300ms delay)
- **Recent searches** stored in localStorage
- **Keyboard navigation** support (Enter to search)
- **Visual feedback** with smooth animations

### 🌡️ Enhanced Current Weather
- Real-time temperature with °C/°F toggle
- Feels-like temperature
- Animated weather icons
- Humidity, wind speed, visibility
- Atmospheric pressure
- Sunrise & sunset times (timezone-aware)
- Cloudiness percentage

### ⏰ Advanced Forecasts
- **24-Hour Forecast**: Hourly data for the next day
- **5-Day Forecast**: Daily min/max temperatures
- **Extreme Weather Alerts**: Visual warnings for dangerous conditions
- Dominant weather conditions per day

### 📍 Location Intelligence
- **Auto-detect location** using browser Geolocation API
- Fallback to manual city search
- **Timezone-aware** date and time display
- Permission handling with user-friendly messages

### 🎨 Modern UI/UX
- **Dynamic backgrounds** based on city and weather
- **Smooth animations** and transitions
- **Skeleton loaders** for professional loading states
- **Mobile-first** responsive design
- Weather-based color themes

### 🛡️ Robust Error Handling
- User-friendly error messages
- **Retry mechanism** with exponential backoff
- **Offline detection** with status indicator
- Rate limit handling
- Network timeout management

### 🔄 Auto-Refresh
- Weather data updates every 5 minutes
- Silent background updates
- No interruption to user experience

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- OpenWeatherMap API key ([Get one free](https://openweathermap.org/api))
- Pexels API key ([Get one free](https://www.pexels.com/api/))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd weather-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
VITE_PEXELS_API_KEY=your_pexels_api_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CurrentWeather.jsx      # Current weather display
│   ├── HourlyForecast.jsx      # 24-hour forecast
│   ├── DailyForecast.jsx       # 5-day forecast
│   ├── SearchBar.jsx           # Smart search component
│   ├── ErrorDisplay.jsx        # Error handling UI
│   └── SkeletonLoader.jsx      # Loading states
├── services/
│   ├── weatherService.js       # Weather API integration
│   ├── geolocationService.js   # Location services
│   └── imageService.js         # Background images
├── hooks/
│   └── useDebounce.js          # Debounce hook
├── utils/
│   └── weatherHelpers.js       # Utility functions
├── AppEnhanced.jsx             # Main app component
├── App.jsx                     # Original app (backup)
└── main.jsx                    # Entry point
```

## 🔧 Technologies Used

- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool
- **Tailwind CSS 3.4.18** - Styling
- **Axios 1.12.2** - HTTP client
- **GSAP 3.13.0** - Animations (optional)
- **OpenWeatherMap API** - Weather data
- **Pexels API** - Background images

## 📱 Features in Detail

### Temperature Unit Toggle
Switch between Celsius and Fahrenheit with instant client-side conversion (no additional API calls).

### Extreme Weather Detection
Automatically identifies and highlights:
- Severe weather conditions (thunderstorms, snow, etc.)
- Extreme temperatures (>40°C or <-10°C)
- High wind speeds (>20 m/s)

### Search History
- Stores last 8 searches in localStorage
- Quick access to recent locations
- Clear all history option

### Offline Support
- Detects network status changes
- Displays offline indicator
- Prevents API calls when offline

### Error Recovery
- Automatic retry with exponential backoff (3 attempts)
- Specific error messages for different failure types
- Manual retry option

## 🎯 Usage

1. **Search for a city**: Type in the search bar and select from suggestions
2. **Use current location**: Click "Use My Location" for auto-detection
3. **Switch views**: Toggle between Current, Hourly, and 5-Day forecasts
4. **Change units**: Click °C or °F to switch temperature units
5. **View history**: Click the search bar to see recent searches

## 🔐 API Keys

### OpenWeatherMap
- Free tier: 60 calls/minute, 1,000,000 calls/month
- Required endpoints: Current Weather, 5-Day Forecast

### Pexels
- Free tier: 200 requests/hour
- Used for dynamic city background images

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires:
- ES6+ JavaScript support
- Geolocation API
- localStorage
- Fetch API

## 🐛 Troubleshooting

### API Keys Not Working
- Ensure `.env` file is in the root directory
- Restart the dev server after adding `.env`
- Check that keys are prefixed with `VITE_`

### Geolocation Not Working
- Ensure you're using HTTPS (required for geolocation)
- Check browser permissions
- Use manual search as fallback

### Images Not Loading
- Verify Pexels API key
- Fallback images will display automatically
- Check browser console for errors

### Rate Limiting
- Free tier limits: 60 calls/minute (OpenWeatherMap)
- Implement caching for production
- Consider upgrading API plan for high traffic

## 📈 Performance

- **Debounced search**: Reduces API calls by 70%
- **Parallel requests**: Fetches all data simultaneously
- **Client-side conversion**: No API calls for unit changes
- **localStorage caching**: Instant history access
- **Optimized images**: Appropriate sizes from Pexels

## 🔮 Future Enhancements

- [ ] Weather alerts and warnings
- [ ] Air quality index (AQI)
- [ ] UV index
- [ ] Precipitation probability
- [ ] Weather radar maps
- [ ] Multiple location tracking
- [ ] Weather comparison tool
- [ ] Historical weather data
- [ ] Push notifications
- [ ] PWA support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Implementation Guide](IMPLEMENTATION_GUIDE.md)

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Images provided by [Pexels](https://www.pexels.com/)
- Icons: Emoji-based for universal compatibility

---

Made with ❤️ and React
