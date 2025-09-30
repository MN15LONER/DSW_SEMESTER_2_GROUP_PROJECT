// Product search service with multi-store price comparison
import { MAJOR_SA_STORES, COMPREHENSIVE_PRODUCTS, DAILY_DEALS } from '../data/comprehensiveMockData';

class ProductSearchService {
  constructor() {
    this.stores = MAJOR_SA_STORES;
    this.products = COMPREHENSIVE_PRODUCTS;
    this.deals = DAILY_DEALS;
  }

  // Search products across all stores with real-time filtering
  searchProducts(query, filters = {}) {
    let results = [...this.products];

    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      results = results.filter(product => product.category === filters.category);
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'All') {
      results = results.filter(product => product.brand === filters.brand);
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      results = results.filter(product => {
        const prices = product.stores.map(store => store.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (filters.minPrice && minPrice < filters.minPrice) return false;
        if (filters.maxPrice && maxPrice > filters.maxPrice) return false;
        return true;
      });
    }

    // In stock filter
    if (filters.inStockOnly) {
      results = results.filter(product => 
        product.stores.some(store => store.inStock)
      );
    }

    // On promotion filter
    if (filters.onPromotionOnly) {
      results = results.filter(product => 
        product.stores.some(store => store.promotion)
      );
    }

    return this.enrichProductResults(results, filters);
  }

  // Enrich products with store information and pricing
  enrichProductResults(products, filters = {}) {
    return products.map(product => {
      const enrichedStores = product.stores.map(storeInfo => {
        const store = this.stores.find(s => s.id === storeInfo.storeId);
        return {
          ...storeInfo,
          storeName: store?.name || 'Unknown Store',
          storeBrand: store?.brand || 'Unknown',
          storeLocation: store?.location || 'Unknown Location',
          storeDistance: store?.distance || 'N/A',
          storeRating: store?.rating || 0,
          deliveryTime: store?.deliveryTime || 'N/A',
          coordinates: store?.coordinates
        };
      }).filter(store => store.inStock || !filters.inStockOnly);

      // Calculate price statistics
      const prices = enrichedStores.map(store => store.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      return {
        ...product,
        stores: enrichedStores,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          average: avgPrice,
          savings: maxPrice - minPrice
        },
        availableStores: enrichedStores.length,
        bestPrice: enrichedStores.find(store => store.price === minPrice),
        hasPromotions: enrichedStores.some(store => store.promotion)
      };
    });
  }

  // Sort products by various criteria
  sortProducts(products, sortBy = 'relevance', userLocation = null) {
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'price_low':
        return sortedProducts.sort((a, b) => a.priceRange.min - b.priceRange.min);
      
      case 'price_high':
        return sortedProducts.sort((a, b) => b.priceRange.min - a.priceRange.min);
      
      case 'rating':
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      
      case 'name':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'brand':
        return sortedProducts.sort((a, b) => a.brand.localeCompare(b.brand));
      
      case 'savings':
        return sortedProducts.sort((a, b) => b.priceRange.savings - a.priceRange.savings);
      
      case 'availability':
        return sortedProducts.sort((a, b) => b.availableStores - a.availableStores);
      
      case 'distance':
        if (userLocation) {
          return sortedProducts.sort((a, b) => {
            const aMinDistance = this.calculateMinDistance(a.stores, userLocation);
            const bMinDistance = this.calculateMinDistance(b.stores, userLocation);
            return aMinDistance - bMinDistance;
          });
        }
        return sortedProducts;
      
      default:
        return sortedProducts;
    }
  }

  // Calculate minimum distance to available stores
  calculateMinDistance(stores, userLocation) {
    const distances = stores
      .filter(store => store.coordinates)
      .map(store => this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.coordinates.latitude,
        store.coordinates.longitude
      ));
    
    return distances.length > 0 ? Math.min(...distances) : Infinity;
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Get all unique categories
  getCategories() {
    const categories = [...new Set(this.products.map(p => p.category))];
    return ['All', ...categories.sort()];
  }

  // Get all unique brands
  getBrands() {
    const brands = [...new Set(this.products.map(p => p.brand))];
    return ['All', ...brands.sort()];
  }

  // Get daily deals
  getDailyDeals() {
    const today = new Date();
    return this.deals.filter(deal => {
      const validUntil = new Date(deal.validUntil);
      return validUntil >= today;
    });
  }

  // Get products on promotion
  getPromotionalProducts() {
    return this.products.filter(product => 
      product.stores.some(store => store.promotion)
    ).map(product => ({
      ...product,
      promotionalStores: product.stores.filter(store => store.promotion)
    }));
  }

  // Get store information
  getStoreById(storeId) {
    return this.stores.find(store => store.id === storeId);
  }

  // Get all stores
  getAllStores() {
    return this.stores;
  }

  // Get stores by brand
  getStoresByBrand(brand) {
    return this.stores.filter(store => store.brand === brand);
  }

  // Get nearby stores based on user location
  getNearbyStores(userLocation, radiusKm = 10) {
    return this.stores
      .map(store => ({
        ...store,
        distance: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.coordinates.latitude,
          store.coordinates.longitude
        )
      }))
      .filter(store => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }
}

export const productSearchService = new ProductSearchService();
