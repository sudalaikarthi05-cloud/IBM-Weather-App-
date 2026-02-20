import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import cityList from '../city.list.json';

export default function SearchBar({ 
  onSearch, 
  loading, 
  searchHistory, 
  onClearHistory,
  onUseCurrentLocation 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const suggestionsRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-suggest with debouncing
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const q = debouncedQuery.toLowerCase();
    const matches = cityList
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (city) => {
    onSearch(city.coord.lat, city.coord.lon, city.name, city.country);
    setQuery('');
    setSuggestions([]);
    setShowHistory(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && suggestions[0]) {
      handleSearch(suggestions[0]);
    }
  };

  return (
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
              onFocus={() => setShowHistory(searchHistory.length > 0 && !query)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 rounded-2xl text-gray-800 bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-transparent text-lg placeholder-gray-500 transition-all duration-300 pr-12 font-medium"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
              {query && (
                <button 
                  onClick={() => setQuery('')} 
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

        {/* Search History */}
        {showHistory && searchHistory.length > 0 && !query && (
          <div className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <div className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <span>📚</span>
                Recent Searches
              </div>
              <button 
                onClick={onClearHistory} 
                className="text-xs text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
              >
                Clear all
              </button>
            </div>
            {searchHistory.map((item) => (
              <div 
                key={item.id} 
                className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-200 flex items-center justify-between group"
                onClick={() => handleSearch(item)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 group-hover:scale-110 transform duration-200">📍</div>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-blue-600">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !showHistory && (
          <ul className="absolute z-20 w-full mt-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto">
            {suggestions.map((city, idx) => (
              <li 
                key={`${city.id}-${idx}`} 
                className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-200 flex items-center justify-between group"
                onClick={() => handleSearch(city)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 group-hover:scale-110 transform duration-200">🏙️</div>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-blue-600">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.state ? `${city.state}, ` : ''}{city.country}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onUseCurrentLocation}
          disabled={loading}
          className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 text-lg"
        >
          <span className="text-xl">📍</span>
          <span>Current Location</span>
        </button>
      </div>
    </div>
  );
}
