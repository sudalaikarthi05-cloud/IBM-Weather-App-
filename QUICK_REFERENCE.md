# Quick Reference Card

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_OPENWEATHER_API_KEY=your_key" > .env
echo "VITE_PEXELS_API_KEY=your_key" >> .env

# Start dev server
npm run dev
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/AppEnhanced.jsx` | Main application |
| `src/components/SearchBar.jsx` | Search with autocomplete |
| `src/components/CurrentWeather.jsx` | Current weather display |
| `src/components/HourlyForecast.jsx` | 24-hour forecast |
| `src/components/DailyForecast.jsx` | 5-day forecast |
| `src/services/weatherService.js` | Weather API calls |
| `src/services/geolocationService.js` | Location detection |
| `src/utils/weatherHelpers.js` | Utility functions |

## 🔧 Common Tasks

### Add a New Weather Metric

1. Update `CurrentWeather.jsx`:
```jsx
<div className="bg-white/5 rounded-xl p-4">
  <div className="flex items-center gap-2 mb-2">
    <span className="text-xl">🌊</span>
    <span className="text-sm text-white/60">Sea Level</span>
  </div>
  <div className="text-2xl font-bold">
    {weather.main.sea_level} hPa
  </div>
</div>
```

### Change Auto-Refresh Interval

In `AppEnhanced.jsx`:
```javascript
// Change from 5 minutes to 10 minutes
const interval = setInterval(() => {
  fetchWeatherData(/* ... */);
}, 10 * 60 * 1000); // 10 minutes
```

### Modify Debounce Delay

In `SearchBar.jsx`:
```javascript
// Change from 300ms to 500ms
const debouncedQuery = useDebounce(query, 500);
```

### Add Custom Fallback Image

In `src/services/imageService.js`:
```javascript
const fallbackImages = {
  'Clear': 'your_image_url',
  // ... add more
};
```

### Change Temperature Threshold for Extreme Weather

In `src/utils/weatherHelpers.js`:
```javascript
export const isExtremeWeather = (weatherMain, temp, windSpeed) => {
  // Modify thresholds
  if (temp > 45 || temp < -15) return true; // Changed from 40/-10
  if (windSpeed > 25) return true; // Changed from 20
  return false;
};
```

## 🎨 Styling Quick Tips

### Change Primary Color
Replace `blue` with your color in Tailwind classes:
```jsx
className="bg-blue-500" → className="bg-purple-500"
```

### Adjust Card Transparency
```jsx
className="bg-black/40" → className="bg-black/60"
```

### Modify Animation Speed
```jsx
className="transition-all duration-300" → className="transition-all duration-500"
```

## 🔍 Debugging

### Check API Calls
```javascript
// In weatherService.js, add:
console.log('Fetching weather for:', lat, lon);
```

### Monitor State Changes
```javascript
// In AppEnhanced.jsx, add:
useEffect(() => {
  console.log('Weather updated:', weather);
}, [weather]);
```

### Test Error Handling
```javascript
// Temporarily break API call:
const url = `${BASE_URL}/weather-broken?lat=${lat}...`;
```

## 📊 API Endpoints Used

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `/weather` | Current weather | 60/min |
| `/forecast` | 5-day forecast | 60/min |

## 🔐 Environment Variables

```env
VITE_OPENWEATHER_API_KEY=required
VITE_PEXELS_API_KEY=optional (fallback images used)
```

## 🐛 Common Issues

### Issue: "API key not found"
**Solution**: Restart dev server after adding `.env`

### Issue: Geolocation not working
**Solution**: Use HTTPS or localhost

### Issue: Images not loading
**Solution**: Check Pexels API key, fallbacks will display

### Issue: Rate limit exceeded
**Solution**: Wait 1 minute or upgrade API plan

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
```

## 🎯 Component Props

### SearchBar
```jsx
<SearchBar
  onSearch={(lat, lon, name, country) => {}}
  loading={boolean}
  searchHistory={array}
  onClearHistory={() => {}}
  onUseCurrentLocation={() => {}}
/>
```

### CurrentWeather
```jsx
<CurrentWeather
  weather={object}
  unit="metric|imperial"
  onToggleUnit={(unit) => {}}
/>
```

### HourlyForecast
```jsx
<HourlyForecast
  hourlyData={array}
  unit="metric|imperial"
  timezone={number}
/>
```

### DailyForecast
```jsx
<DailyForecast
  forecast={object}
  unit="metric|imperial"
/>
```

## 🔄 State Flow

```
User Action → AppEnhanced → Service → API
                ↓
            Update State
                ↓
            Re-render Components
```

## 📦 Build Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🧪 Testing Tips

1. **Test with different cities**: Tokyo, New York, London
2. **Test edge cases**: Invalid city, no internet
3. **Test permissions**: Allow/deny geolocation
4. **Test units**: Switch between °C and °F
5. **Test mobile**: Use browser dev tools

## 📚 Useful Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Pexels API Docs](https://www.pexels.com/api/documentation/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)

## 💡 Pro Tips

1. Use browser DevTools Network tab to monitor API calls
2. Check Console for error messages
3. Use React DevTools to inspect component state
4. Test offline mode by toggling network in DevTools
5. Use Lighthouse for performance audits

## 🔗 Quick Links

- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **User Documentation**: `README_ENHANCED.md`
- **Upgrade Summary**: `UPGRADE_SUMMARY.md`
- **Original App**: `src/App.jsx`

---

Need more help? Check the full documentation files! 📖
