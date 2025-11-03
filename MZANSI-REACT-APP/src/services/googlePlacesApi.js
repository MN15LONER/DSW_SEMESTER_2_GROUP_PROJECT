// Google Places API service for enhanced location search and store discovery
// You'll need to get an API key from https://console.cloud.google.com/

import Constants from 'expo-constants';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || 'AIzaSyCBhYA1g0dEdw6VfjsVKsDUbrhop84MpfY';
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

class GooglePlacesService {
  constructor() {
    this.apiKey = GOOGLE_PLACES_API_KEY;
  }

  // Search for places using text query
  async searchPlaces(query, location = null, radius = 5000) {
    try {
      let url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;
      
      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=${radius}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        types: place.types || [],
        isOpen: place.opening_hours?.open_now || false,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) : []
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Find nearby stores/supermarkets
  async findNearbyStores(location, radius = 5000, type = 'supermarket') {
    try {
      const url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        types: place.types || [],
        isOpen: place.opening_hours?.open_now || false,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) : []
      }));
    } catch (error) {
      console.error('Error finding nearby stores:', error);
      return [];
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId) {
    try {
      // Request address components as well so clients can extract street/city/province/postal code
      const fields = 'place_id,name,formatted_address,geometry,address_components,rating,formatted_phone_number,opening_hours,website,photos,price_level,types';
      const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Places API error: ${data.status}`);
      }

      const place = data.result;
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        addressComponents: place.address_components || null,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        phone: place.formatted_phone_number,
        website: place.website,
        priceLevel: place.price_level || 0,
        types: place.types || [],
        openingHours: place.opening_hours ? {
          isOpen: place.opening_hours.open_now,
          periods: place.opening_hours.periods,
          weekdayText: place.opening_hours.weekday_text
        } : null,
        photos: place.photos ? place.photos.map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        })) : []
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Get photo URL from photo reference
  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;
    return `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  // Autocomplete for location search
  async autocomplete(input, location = null, radius = 50000, preferredTypes = ['address', 'geocode', 'establishment']) {
    try {
      console.log('Autocomplete called with input:', input);

      // Try preferred types in order (address -> geocode -> establishment). If none return results,
      // fall back to a text search which can provide broader matches.
      for (const type of preferredTypes) {
        let url = `${GOOGLE_PLACES_BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}`;

        if (location) {
          url += `&location=${location.latitude},${location.longitude}&radius=${radius}`;
        }

        // Limit to South Africa
        url += '&components=country:za';

        // Request a type filter to prefer street/locality results when possible
        if (type) {
          url += `&types=${encodeURIComponent(type)}`;
        }

        console.debug('Autocomplete URL (type=', type, '):', url);
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`Autocomplete HTTP status ${response.status} for type ${type}`);
          continue; // try next type
        }

        const data = await response.json();
        console.debug('Autocomplete data (type=', type, '):', data);

        if (data.status === 'OK' && Array.isArray(data.predictions) && data.predictions.length > 0) {
          return data.predictions.map(prediction => ({
            id: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting?.main_text || prediction.description,
            secondaryText: prediction.structured_formatting?.secondary_text || '',
            types: prediction.types || []
          }));
        }

        // continue to next preferred type if ZERO_RESULTS or other non-OK
        if (data.status && data.status !== 'ZERO_RESULTS' && data.status !== 'OK') {
          console.warn(`Places API returned status ${data.status} for autocomplete (type=${type})`);
        }
      }

      // Fallback: use text search which often returns formatted addresses
      const textResults = await this.searchPlaces(input, location, radius);
      if (textResults && textResults.length > 0) {
        return textResults.slice(0, 10).map(place => ({
          id: place.id,
          description: place.address || place.name,
          mainText: place.name || place.address,
          secondaryText: place.address || '',
          types: place.types || []
        }));
      }

      return [];
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return [];
    }
  }

  // Get coordinates from place ID
  async getCoordinatesFromPlaceId(placeId) {
    try {
      const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=geometry&key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Places API error: ${data.status}`);
      }

      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  // Find stores by category with enhanced search
  async findStoresByCategory(category, location, radius = 10000) {
    const categoryMapping = {
      'supermarket': ['supermarket', 'grocery_or_supermarket'],
      'pharmacy': ['pharmacy', 'drugstore'],
      'clothing': ['clothing_store', 'shoe_store'],
      'electronics': ['electronics_store'],
      'restaurant': ['restaurant', 'meal_takeaway'],
      'gas_station': ['gas_station'],
      'bank': ['bank', 'atm'],
      'hospital': ['hospital', 'doctor'],
      'school': ['school', 'university']
    };

    const types = categoryMapping[category.toLowerCase()] || [category];
    let allResults = [];

    for (const type of types) {
      const results = await this.findNearbyStores(location, radius, type);
      allResults = [...allResults, ...results];
    }

    // Remove duplicates based on place_id
    const uniqueResults = allResults.filter((store, index, self) =>
      index === self.findIndex(s => s.id === store.id)
    );

    // Sort by distance
    return uniqueResults
      .map(store => ({
        ...store,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          store.latitude,
          store.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }
}

export const googlePlacesService = new GooglePlacesService();

// Helper functions for integration with existing app
export const enhanceStoreWithPlacesData = async (store) => {
  try {
    if (store.placeId) {
      const placeDetails = await googlePlacesService.getPlaceDetails(store.placeId);
      if (placeDetails) {
        return {
          ...store,
          ...placeDetails,
          // Preserve original store data
          id: store.id,
          category: store.category,
          promotions: store.promotions,
          deliveryTime: store.deliveryTime
        };
      }
    }
    return store;
  } catch (error) {
    console.error('Error enhancing store with Places data:', error);
    return store;
  }
};

export const searchStoresWithPlaces = async (query, userLocation) => {
  try {
    const placesResults = await googlePlacesService.searchPlaces(query, userLocation);
    
    // Convert Places results to store format
    return placesResults.map(place => ({
      id: place.id,
      name: place.name,
      category: place.types.includes('supermarket') ? 'Supermarket' : 
                place.types.includes('pharmacy') ? 'Pharmacy' :
                place.types.includes('clothing_store') ? 'Clothing' : 'Store',
      location: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
      rating: place.rating,
      reviews: Math.floor(Math.random() * 1000) + 100, // Mock review count
      deliveryTime: 'Same day',
      image: place.photos.length > 0 ? 
        googlePlacesService.getPhotoUrl(place.photos[0].reference) : 
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
      isOpen: place.isOpen,
      promotions: [],
      description: `${place.name} - ${place.address}`
    }));
  } catch (error) {
    console.error('Error searching stores with Places:', error);
    return [];
  }
};
