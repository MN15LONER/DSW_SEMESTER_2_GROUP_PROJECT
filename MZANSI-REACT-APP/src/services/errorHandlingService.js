// Comprehensive error handling and offline support service
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class ErrorHandlingService {
  constructor() {
    this.errorQueue = [];
    this.offlineQueue = [];
    this.isOnline = true;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.maxRetryDelay = 30000; // 30 seconds
    this.errorListeners = [];
    
    this.initializeNetworkListener();
    this.loadOfflineQueue();
  }

  // Initialize network connectivity listener
  async initializeNetworkListener() {
    try {
      // Get initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      // Subscribe to network state changes
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;

        if (!wasOnline && this.isOnline) {
          // Just came back online - process offline queue
          this.processOfflineQueue();
        }

        // Notify listeners of network change
        this.notifyNetworkChange(this.isOnline);
      });
    } catch (error) {
      console.error('Error initializing network listener:', error);
    }
  }

  // Load offline queue from storage
  async loadOfflineQueue() {
    try {
      const stored = await AsyncStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  // Save offline queue to storage
  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Handle API errors with retry logic
  async handleApiError(error, operation, retryCount = 0) {
    const errorInfo = {
      id: Date.now() + Math.random(),
      operation,
      error: {
        message: error.message,
        status: error.status || error.code,
        timestamp: new Date().toISOString()
      },
      retryCount,
      maxRetries: this.retryAttempts
    };

    // Log error
    this.logError(errorInfo);

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      if (!this.isOnline) {
        // Add to offline queue
        await this.addToOfflineQueue(operation);
        throw new OfflineError('Operation queued for when connection is restored');
      }

      // Retry network errors
      if (retryCount < this.retryAttempts) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.delay(delay);
        return this.retryOperation(operation, retryCount + 1);
      }
    }

    // Check if it's a server error (5xx)
    if (this.isServerError(error)) {
      if (retryCount < this.retryAttempts) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.delay(delay);
        return this.retryOperation(operation, retryCount + 1);
      }
    }

    // Transform error to user-friendly message
    const userError = this.transformError(error);
    throw userError;
  }

  // Add operation to offline queue
  async addToOfflineQueue(operation) {
    const queueItem = {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();
  }

  // Process offline queue when connection is restored
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline operations`);

    const processedItems = [];
    
    for (const item of this.offlineQueue) {
      try {
        await this.executeOperation(item.operation);
        processedItems.push(item.id);
      } catch (error) {
        console.error('Error processing offline operation:', error);
        item.attempts++;
        
        // Remove from queue if too many attempts
        if (item.attempts >= this.retryAttempts) {
          processedItems.push(item.id);
          this.notifyOfflineOperationFailed(item);
        }
      }
    }

    // Remove processed items from queue
    this.offlineQueue = this.offlineQueue.filter(item => !processedItems.includes(item.id));
    await this.saveOfflineQueue();

    if (processedItems.length > 0) {
      this.notifyOfflineOperationsProcessed(processedItems.length);
    }
  }

  // Execute an operation
  async executeOperation(operation) {
    switch (operation.type) {
      case 'api_call':
        return await this.makeApiCall(operation.url, operation.options);
      case 'firebase_write':
        return await this.firebaseWrite(operation.collection, operation.data);
      case 'analytics_event':
        return await this.trackAnalyticsEvent(operation.event, operation.properties);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Retry operation with exponential backoff
  async retryOperation(operation, retryCount) {
    try {
      return await this.executeOperation(operation);
    } catch (error) {
      return await this.handleApiError(error, operation, retryCount);
    }
  }

  // Calculate retry delay with exponential backoff
  calculateRetryDelay(retryCount) {
    const baseDelay = this.retryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(baseDelay + jitter, this.maxRetryDelay);
  }

  // Check if error is network-related
  isNetworkError(error) {
    const networkErrorCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'CONNECTION_FAILED',
      'DNS_LOOKUP_FAILED'
    ];
    
    return networkErrorCodes.includes(error.code) ||
           error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('connection') ||
           error.message.toLowerCase().includes('timeout');
  }

  // Check if error is server error (5xx)
  isServerError(error) {
    return error.status >= 500 && error.status < 600;
  }

  // Transform technical errors to user-friendly messages
  transformError(error) {
    const errorMappings = {
      // Network errors
      'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
      'TIMEOUT': 'Request timed out. Please try again.',
      'CONNECTION_FAILED': 'Connection failed. Please check your internet connection.',
      
      // Authentication errors
      401: 'Please log in to continue.',
      403: 'You don\'t have permission to perform this action.',
      
      // Client errors
      400: 'Invalid request. Please check your input.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data.',
      
      // Server errors
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',
      
      // Firebase errors
      'permission-denied': 'You don\'t have permission to access this data.',
      'unavailable': 'Service temporarily unavailable.',
      'deadline-exceeded': 'Request timed out. Please try again.',
      
      // Payment errors
      'payment-failed': 'Payment could not be processed. Please try again.',
      'insufficient-funds': 'Insufficient funds. Please check your payment method.',
      'invalid-card': 'Invalid payment method. Please check your details.',
    };

    const errorCode = error.code || error.status;
    const userMessage = errorMappings[errorCode] || 
                       errorMappings[error.message] || 
                       'Something went wrong. Please try again.';

    return new UserFriendlyError(userMessage, error);
  }

  // Log error for debugging and analytics
  logError(errorInfo) {
    console.error('Error logged:', errorInfo);
    
    // Add to error queue for batch reporting
    this.errorQueue.push(errorInfo);
    
    // Report to analytics service (if available)
    this.reportErrorToAnalytics(errorInfo);
    
    // Notify error listeners
    this.notifyErrorListeners(errorInfo);
  }

  // Report error to analytics
  async reportErrorToAnalytics(errorInfo) {
    try {
      // In a real app, you would send this to your analytics service
      const analyticsEvent = {
        event: 'error_occurred',
        properties: {
          operation: errorInfo.operation?.type,
          error_message: errorInfo.error.message,
          error_status: errorInfo.error.status,
          retry_count: errorInfo.retryCount,
          timestamp: errorInfo.error.timestamp
        }
      };
      
      // Queue for offline processing if needed
      if (!this.isOnline) {
        await this.addToOfflineQueue({
          type: 'analytics_event',
          event: analyticsEvent.event,
          properties: analyticsEvent.properties
        });
      }
    } catch (error) {
      console.error('Error reporting to analytics:', error);
    }
  }

  // Cache management for offline support
  async cacheData(key, data, expirationTime = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expirationTime
      };
      
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.expirationTime) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Clear expired cache
  async clearExpiredCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached);
          const now = Date.now();
          
          if (now - cacheItem.timestamp > cacheItem.expirationTime) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Graceful degradation helpers
  async getDataWithFallback(primarySource, fallbackSource, cacheKey) {
    try {
      // Try primary source first
      if (this.isOnline) {
        const data = await primarySource();
        // Cache successful result
        await this.cacheData(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Primary source failed, trying fallback:', error.message);
    }

    try {
      // Try fallback source
      const fallbackData = await fallbackSource();
      return fallbackData;
    } catch (fallbackError) {
      console.warn('Fallback source failed, trying cache:', fallbackError.message);
      
      // Try cached data as last resort
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      throw new Error('All data sources failed');
    }
  }

  // Event listeners
  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  notifyErrorListeners(errorInfo) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  notifyNetworkChange(isOnline) {
    // Notify components of network status change
    console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
  }

  notifyOfflineOperationsProcessed(count) {
    console.log(`${count} offline operations processed successfully`);
  }

  notifyOfflineOperationFailed(operation) {
    console.error('Offline operation failed permanently:', operation);
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get error statistics
  getErrorStatistics() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errorQueue.filter(error => 
      new Date(error.error.timestamp).getTime() > last24Hours
    );

    return {
      totalErrors: this.errorQueue.length,
      recentErrors: recentErrors.length,
      offlineQueueSize: this.offlineQueue.length,
      isOnline: this.isOnline,
      mostCommonErrors: this.getMostCommonErrors(recentErrors)
    };
  }

  getMostCommonErrors(errors) {
    const errorCounts = {};
    
    errors.forEach(error => {
      const key = error.error.status || error.error.message;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
  }

  // Clear all error data
  clearErrorData() {
    this.errorQueue = [];
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }
}

// Custom error classes
class UserFriendlyError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'UserFriendlyError';
    this.originalError = originalError;
    this.userFriendly = true;
  }
}

class OfflineError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OfflineError';
    this.offline = true;
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();

// Helper functions for React components
export const withErrorHandling = (asyncFunction) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      if (error.userFriendly || error.offline) {
        throw error;
      }
      
      const operation = {
        type: 'api_call',
        function: asyncFunction.name,
        args
      };
      
      return await errorHandlingService.handleApiError(error, operation);
    }
  };
};

export const useOfflineSupport = (key, fetchFunction, fallbackData = null) => {
  return async () => {
    return await errorHandlingService.getDataWithFallback(
      fetchFunction,
      () => Promise.resolve(fallbackData),
      key
    );
  };
};
