import axios from 'axios';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

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

const generateSearchQueries = (cityName, country, weatherCondition = '') => {
  const baseQueries = [
    `${cityName} ${country} city`,
    `${cityName} skyline`,
    `${cityName} cityscape`
  ];

  if (weatherCondition) {
    return [`${cityName} ${weatherCondition}`, ...baseQueries];
  }

  return baseQueries;
};

export const imageService = {
  fetchCityImage: async (cityName, country, weatherCondition = '') => {
    try {
      const searchQueries = generateSearchQueries(cityName, country, weatherCondition);
      
      for (const query of searchQueries) {
        try {
          const response = await axios.get(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
            { 
              headers: { Authorization: PEXELS_API_KEY },
              timeout: 8000
            }
          );
          
          if (response.data.photos?.length > 0) {
            const goodPhotos = response.data.photos.filter(photo => 
              photo.width > photo.height && photo.src.original
            );
            
            if (goodPhotos.length > 0) {
              return goodPhotos[0].src.large2x || goodPhotos[0].src.original;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      return fallbackImages[weatherCondition] || fallbackImages.default;
    } catch (error) {
      return fallbackImages[weatherCondition] || fallbackImages.default;
    }
  }
};
