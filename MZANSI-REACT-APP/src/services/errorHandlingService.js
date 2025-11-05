
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { logError, logWarn, logInfo } from '../utils/errorLogger';

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

  async initializeNetworkListener() {
    try {

      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;

        if (!wasOnline && this.isOnline) {

          this.processOfflineQueue();
        }

        this.notifyNetworkChange(this.isOnline);
      });
    } catch (error) {
      logError('ErrorHandlingService - initializeNetworkListener', error);
    }
  }

  async loadOfflineQueue() {
    try {
      const stored = await AsyncStorage.getItem('offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      logError('ErrorHandlingService - loadOfflineQueue', error);
    }
  }

  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      logError('ErrorHandlingService - saveOfflineQueue', error);
    }
  }

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

    this.logError(errorInfo);

    if (this.isNetworkError(error)) {
      if (!this.isOnline) {

        await this.addToOfflineQueue(operation);
        throw new OfflineError('Operation queued for when connection is restored');
      }

      if (retryCount < this.retryAttempts) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.delay(delay);
        return this.retryOperation(operation, retryCount + 1);
      }
    }

    if (this.isServerError(error)) {
      if (retryCount < this.retryAttempts) {
        const delay = this.calculateRetryDelay(retryCount);
        await this.delay(delay);
        return this.retryOperation(operation, retryCount + 1);
      }
    }

    const userError = this.transformError(error);
    throw userError;
  }

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

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

  logInfo('ErrorHandlingService', `Processing ${this.offlineQueue.length} offline operations`);

    const processedItems = [];

    for (const item of this.offlineQueue) {
      try {
        await this.executeOperation(item.operation);
        processedItems.push(item.id);
      } catch (error) {
        logError('ErrorHandlingService - processOfflineQueue - item', error);
        item.attempts++;

        if (item.attempts >= this.retryAttempts) {
          processedItems.push(item.id);
          this.notifyOfflineOperationFailed(item);
        }
      }
    }

    this.offlineQueue = this.offlineQueue.filter(item => !processedItems.includes(item.id));
    await this.saveOfflineQueue();

    if (processedItems.length > 0) {
      this.notifyOfflineOperationsProcessed(processedItems.length);
    }
  }

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

  async retryOperation(operation, retryCount) {
    try {
      return await this.executeOperation(operation);
    } catch (error) {
      return await this.handleApiError(error, operation, retryCount);
    }
  }

  calculateRetryDelay(retryCount) {
    const baseDelay = this.retryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(baseDelay + jitter, this.maxRetryDelay);
  }

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

  isServerError(error) {
    return error.status >= 500 && error.status < 600;
  }

  transformError(error) {
    const errorMappings = {

      'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
      'TIMEOUT': 'Request timed out. Please try again.',
      'CONNECTION_FAILED': 'Connection failed. Please check your internet connection.',

      401: 'Please log in to continue.',
      403: 'You don\'t have permission to perform this action.',

      400: 'Invalid request. Please check your input.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data.',

      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',

      'permission-denied': 'You don\'t have permission to access this data.',
      'unavailable': 'Service temporarily unavailable.',
      'deadline-exceeded': 'Request timed out. Please try again.',

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

  logError(errorInfo) {
    console.error('Error logged:', errorInfo);

    this.errorQueue.push(errorInfo);

    this.reportErrorToAnalytics(errorInfo);

    this.notifyErrorListeners(errorInfo);
  }

  async reportErrorToAnalytics(errorInfo) {
    try {

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

      if (!this.isOnline) {
        await this.addToOfflineQueue({
          type: 'analytics_event',
          event: analyticsEvent.event,
          properties: analyticsEvent.properties
        });
      }
    } catch (error) {
      logError('ErrorHandlingService - reportErrorToAnalytics', error);
    }
  }

  async cacheData(key, data, expirationTime = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expirationTime
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      logError('ErrorHandlingService - cacheData', error);
    }
  }

  async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheItem.timestamp > cacheItem.expirationTime) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logError('ErrorHandlingService - getCachedData', error);
      return null;
    }
  }

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
      logError('ErrorHandlingService - clearExpiredCache', error);
    }
  }

  async getDataWithFallback(primarySource, fallbackSource, cacheKey) {
    try {

      if (this.isOnline) {
        const data = await primarySource();

        await this.cacheData(cacheKey, data);
        return data;
      }
    } catch (error) {
      logWarn('ErrorHandlingService - getDataWithFallback - primaryFailed', error.message);
    }

    try {

      const fallbackData = await fallbackSource();
      return fallbackData;
    } catch (fallbackError) {
      logWarn('ErrorHandlingService - getDataWithFallback - fallbackFailed', fallbackError.message);

      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      throw new Error('All data sources failed');
    }
  }

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
        logError('ErrorHandlingService - notifyErrorListeners - listener', error);
      }
    });
  }

  notifyNetworkChange(isOnline) {

  logInfo('ErrorHandlingService - Network', `Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
  }

  notifyOfflineOperationsProcessed(count) {
  logInfo('ErrorHandlingService - Offline', `${count} offline operations processed successfully`);
  }

  notifyOfflineOperationFailed(operation) {
  logError('ErrorHandlingService - Offline operation failed permanently', operation);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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

  clearErrorData() {
    this.errorQueue = [];
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }
}

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

export const errorHandlingService = new ErrorHandlingService();

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
