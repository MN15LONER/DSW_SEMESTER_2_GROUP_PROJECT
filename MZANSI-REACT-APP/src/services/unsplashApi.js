const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_BASE_URL = 'https:
const HAS_UNSPLASH_KEY = !!UNSPLASH_ACCESS_KEY;
class UnsplashService {
  constructor() {
    this.accessKey = UNSPLASH_ACCESS_KEY;
  }
  async searchPhotos(query, count = 10) {
    if (!HAS_UNSPLASH_KEY) {
      const url = `https:
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
        'https:
        'https:
        'https:
      ],
      'fresh produce': [
        'https:
        'https:
        'https:
      ],
      'bread': [
        'https:
        'https:
        'https:
      ],
      'milk': [
        'https:
        'https:
      ],
      'meat': [
        'https:
        'https:
      ],
      'fruits': [
        'https:
        'https:
      ],
      'vegetables': [
        'https:
        'https:
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
    this.maxSize = 100; 
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