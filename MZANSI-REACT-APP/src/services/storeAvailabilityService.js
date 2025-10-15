// Real-time store availability and inventory management service
import AsyncStorage from '@react-native-async-storage/async-storage';

class StoreAvailabilityService {
  constructor() {
    this.availabilityCache = new Map();
    this.inventoryCache = new Map();
    this.lastUpdate = new Map();
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Check if store is currently open based on operating hours
  isStoreOpen(store) {
    if (!store.openingHours) return store.isOpen || false;

    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    const todayHours = store.openingHours[this.getDayKey(now.getDay())];
    if (!todayHours || todayHours === 'Closed') return false;

    const [openTime, closeTime] = todayHours.split(' - ');
    const openMinutes = this.timeToMinutes(openTime);
    const closeMinutes = this.timeToMinutes(closeTime);

    return currentTime >= openMinutes && currentTime <= closeMinutes;
  }

  getDayKey(dayIndex) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get real-time store availability
  async getStoreAvailability(storeId) {
    const cacheKey = `availability_${storeId}`;
    const lastUpdateTime = this.lastUpdate.get(cacheKey);
    const now = Date.now();

    // Check if we have recent data
    if (lastUpdateTime && (now - lastUpdateTime) < this.updateInterval) {
      return this.availabilityCache.get(cacheKey);
    }

    try {
      // Simulate real-time availability check
      const availability = await this.fetchStoreAvailability(storeId);
      
      // Cache the result
      this.availabilityCache.set(cacheKey, availability);
      this.lastUpdate.set(cacheKey, now);

      // Persist to AsyncStorage
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: availability,
        timestamp: now
      }));

      return availability;
    } catch (error) {
      console.error('Error fetching store availability:', error);
      
      // Try to get cached data from AsyncStorage
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Use cached data if it's not too old (1 hour)
          if (now - timestamp < 60 * 60 * 1000) {
            return data;
          }
        }
      } catch (cacheError) {
        console.error('Error reading cached availability:', cacheError);
      }

      // Return default availability
      return this.getDefaultAvailability(storeId);
    }
  }

  // Simulate fetching real-time availability data
  async fetchStoreAvailability(storeId) {
    // In a real app, this would make an API call to your backend
    // For now, we'll simulate realistic availability data
    
    const baseAvailability = {
      storeId,
      isOpen: Math.random() > 0.2, // 80% chance store is open
      deliveryAvailable: Math.random() > 0.1, // 90% chance delivery is available
      estimatedDeliveryTime: this.getRandomDeliveryTime(),
      currentCapacity: Math.floor(Math.random() * 100), // 0-100% capacity
      waitTime: Math.floor(Math.random() * 30), // 0-30 minutes wait time
      specialOffers: this.generateSpecialOffers(),
      lastUpdated: new Date().toISOString()
    };

    // Add some realistic variations based on time of day
    const hour = new Date().getHours();
    
    if (hour < 8 || hour > 21) {
      baseAvailability.isOpen = Math.random() > 0.7; // Less likely to be open
      baseAvailability.deliveryAvailable = Math.random() > 0.5;
    }

    if (hour >= 17 && hour <= 19) { // Peak hours
      baseAvailability.currentCapacity = Math.max(70, baseAvailability.currentCapacity);
      baseAvailability.waitTime = Math.max(15, baseAvailability.waitTime);
    }

    return baseAvailability;
  }

  getRandomDeliveryTime() {
    const times = ['30-45 min', '45-60 min', '1-2 hours', 'Same day', 'Next day'];
    return times[Math.floor(Math.random() * times.length)];
  }

  generateSpecialOffers() {
    const offers = [
      'Free delivery on orders over R300',
      '10% off your first order',
      'Buy 2 Get 1 Free on selected items',
      'R50 off orders over R500',
      'Free same-day delivery',
      'Double loyalty points today'
    ];

    const numOffers = Math.floor(Math.random() * 3); // 0-2 offers
    const selectedOffers = [];
    
    for (let i = 0; i < numOffers; i++) {
      const randomOffer = offers[Math.floor(Math.random() * offers.length)];
      if (!selectedOffers.includes(randomOffer)) {
        selectedOffers.push(randomOffer);
      }
    }

    return selectedOffers;
  }

  getDefaultAvailability(storeId) {
    return {
      storeId,
      isOpen: true,
      deliveryAvailable: true,
      estimatedDeliveryTime: 'Same day',
      currentCapacity: 50,
      waitTime: 0,
      specialOffers: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Get product availability in specific store
  async getProductAvailability(storeId, productId) {
    const cacheKey = `inventory_${storeId}_${productId}`;
    const lastUpdateTime = this.lastUpdate.get(cacheKey);
    const now = Date.now();

    if (lastUpdateTime && (now - lastUpdateTime) < this.updateInterval) {
      return this.inventoryCache.get(cacheKey);
    }

    try {
      const availability = await this.fetchProductAvailability(storeId, productId);
      
      this.inventoryCache.set(cacheKey, availability);
      this.lastUpdate.set(cacheKey, now);

      return availability;
    } catch (error) {
      console.error('Error fetching product availability:', error);
      return {
        productId,
        storeId,
        inStock: true,
        quantity: Math.floor(Math.random() * 50) + 1,
        lastRestocked: new Date().toISOString()
      };
    }
  }

  async fetchProductAvailability(storeId, productId) {
    // Simulate product availability check
    return {
      productId,
      storeId,
      inStock: Math.random() > 0.1, // 90% chance in stock
      quantity: Math.floor(Math.random() * 100) + 1,
      lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedRestock: Math.random() > 0.8 ? 
        new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : null
    };
  }

  // Get multiple stores availability at once
  async getBulkStoreAvailability(storeIds) {
    const promises = storeIds.map(storeId => this.getStoreAvailability(storeId));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      storeId: storeIds[index],
      availability: result.status === 'fulfilled' ? result.value : this.getDefaultAvailability(storeIds[index]),
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  // Subscribe to real-time updates (WebSocket simulation)
  subscribeToStoreUpdates(storeId, callback) {
    // In a real app, this would establish a WebSocket connection
    const interval = setInterval(async () => {
      try {
        const availability = await this.getStoreAvailability(storeId);
        callback(availability);
      } catch (error) {
        console.error('Error in store update subscription:', error);
      }
    }, this.updateInterval);

    return () => clearInterval(interval); // Return unsubscribe function
  }

  // Clear cache
  clearCache() {
    this.availabilityCache.clear();
    this.inventoryCache.clear();
    this.lastUpdate.clear();
  }

  // Get store status summary
  async getStoreStatusSummary(storeId) {
    const availability = await this.getStoreAvailability(storeId);
    
    let status = 'closed';
    let statusColor = '#F44336';
    let statusMessage = 'Store is currently closed';

    if (availability.isOpen) {
      if (availability.currentCapacity < 50) {
        status = 'open';
        statusColor = '#4CAF50';
        statusMessage = 'Store is open with low traffic';
      } else if (availability.currentCapacity < 80) {
        status = 'busy';
        statusColor = '#FF9800';
        statusMessage = 'Store is open but busy';
      } else {
        status = 'very_busy';
        statusColor = '#F44336';
        statusMessage = 'Store is very busy';
      }
    }

    return {
      status,
      statusColor,
      statusMessage,
      deliveryAvailable: availability.deliveryAvailable,
      estimatedDeliveryTime: availability.estimatedDeliveryTime,
      waitTime: availability.waitTime,
      specialOffers: availability.specialOffers
    };
  }

  // Check if delivery is available to specific location
  async checkDeliveryAvailability(storeId, deliveryLocation) {
    const storeAvailability = await this.getStoreAvailability(storeId);
    
    if (!storeAvailability.deliveryAvailable) {
      return {
        available: false,
        reason: 'Delivery service is currently unavailable',
        estimatedTime: null
      };
    }

    // Simulate delivery zone check
    const isInDeliveryZone = Math.random() > 0.1; // 90% chance location is in delivery zone
    
    if (!isInDeliveryZone) {
      return {
        available: false,
        reason: 'Location is outside delivery zone',
        estimatedTime: null
      };
    }

    return {
      available: true,
      reason: null,
      estimatedTime: storeAvailability.estimatedDeliveryTime,
      deliveryFee: this.calculateDeliveryFee(deliveryLocation)
    };
  }

  calculateDeliveryFee(deliveryLocation) {
    // Simulate delivery fee calculation based on distance
    const baseFee = 25; // R25 base fee
    const distanceFee = Math.floor(Math.random() * 20); // R0-20 distance fee
    return baseFee + distanceFee;
  }
}

export const storeAvailabilityService = new StoreAvailabilityService();

// Helper hooks for React components
export const useStoreAvailability = (storeId) => {
  const [availability, setAvailability] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let unsubscribe;

    const loadAvailability = async () => {
      try {
        setLoading(true);
        const data = await storeAvailabilityService.getStoreAvailability(storeId);
        setAvailability(data);
        setError(null);

        // Subscribe to updates
        unsubscribe = storeAvailabilityService.subscribeToStoreUpdates(storeId, (newData) => {
          setAvailability(newData);
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      loadAvailability();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [storeId]);

  return { availability, loading, error };
};
