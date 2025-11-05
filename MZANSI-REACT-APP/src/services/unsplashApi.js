
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
const HAS_UNSPLASH_KEY = !!UNSPLASH_ACCESS_KEY;

class UnsplashService {
  constructor() {
    this.accessKey = UNSPLASH_ACCESS_KEY;
  }

  async searchPhotos(query, count = 10) {

    if (!HAS_UNSPLASH_KEY) {

      const url = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
      return Array.from({ length: count }).map((_, i) => ({
        id: `source-${query}-${i}`,
        url,
        thumb: url,
        small: url,
        alt: query,
        photographer: 'Unsplash Source',
        downloadUrl: url
      }));
    }

    try {
      const response = await fetch(
        `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${this.accessKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        alt: photo.alt_description || query,
        photographer: photo.user.name,
        downloadUrl: photo.links.download_location
      }));
    } catch (error) {
      console.error('Error fetching from Unsplash:', error);

      return this.getFallbackImages(query, count);
    }
  }

  getFallbackImages(query, count) {

    const fallbackImages = {
      'grocery store': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'
      ],
      'fresh produce': [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop'
      ],
      'bread': [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop'
      ],
      'milk': [
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop'
      ],
      'meat': [
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop'
      ],
      'fruits': [
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop'
      ],
      'vegetables': [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop'
      ]
    };

    const images = fallbackImages[query.toLowerCase()] || fallbackImages['grocery store'];
    return images.slice(0, count).map((url, index) => ({
      id: `fallback-${query}-${index}`,
      url,
      thumb: url,
      small: url,
      alt: query,
      photographer: 'Unsplash',
      downloadUrl: url
    }));
  }

  async getProductImages(productName, category = 'food') {
    const searchQuery = `${productName} ${category}`;
    const images = await this.searchPhotos(searchQuery, 3);
    return images.length > 0 ? images[0] : this.getFallbackImages(productName, 1)[0];
  }

  async getStoreImages(storeName, storeType = 'supermarket') {
    const searchQuery = `${storeType} store interior`;
    const images = await this.searchPhotos(searchQuery, 5);
    return images;
  }

  async getCategoryImages(category) {
    const categoryQueries = {
      'Food': 'grocery food fresh',
      'Clothing': 'clothing fashion store',
      'Electronics': 'electronics technology store',
      'Home': 'home decor furniture',
      'Beauty': 'cosmetics beauty products'
    };

    const query = categoryQueries[category] || category;
    return await this.searchPhotos(query, 1);
  }
}

export const unsplashService = new UnsplashService();

export const getOptimizedImageUrl = (baseUrl, width = 400, height = 300, quality = 80) => {
  if (!baseUrl) return null;

  if (baseUrl.includes('unsplash.com')) {
    return `${baseUrl}&w=${width}&h=${height}&fit=crop&q=${quality}`;
  }

  return baseUrl;
};

export class ImageCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached images
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {

      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();