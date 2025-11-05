import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { googlePlacesService } from '../../services/googlePlacesApi';
import { unsplashService } from '../../services/unsplashApi';
import { COLORS } from '../../styles/colors';
export default function ApiTestComponent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    googlePlaces: null,
    unsplash: null,
    errors: []
  });
  const testGooglePlacesApi = async () => {
    setLoading(true);
    try {
      console.log('Testing Google Places API...');
      const testLocation = {
        latitude: -26.2041,
        longitude: 28.0473
      };
      const places = await googlePlacesService.findNearbyStores(testLocation, 5000, 'supermarket');
      setResults(prev => ({
        ...prev,
        googlePlaces: {
          success: true,
          message: `Found ${places.length} stores`,
          data: places.slice(0, 3) 
        }
      }));
      Alert.alert('Success', `Google Places API working! Found ${places.length} stores.`);
    } catch (error) {
      console.error('Google Places API Error:', error);
      setResults(prev => ({
        ...prev,
        googlePlaces: {
          success: false,
          message: error.message,
          data: null
        },
        errors: [...prev.errors, `Google Places: ${error.message}`]
      }));
      Alert.alert('Google Places Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  const testUnsplashApi = async () => {
    setLoading(true);
    try {
      console.log('Testing Unsplash API...');
      const images = await unsplashService.searchPhotos('grocery store', 3);
      setResults(prev => ({
        ...prev,
        unsplash: {
          success: true,
          message: `Found ${images.length} images`,
          data: images
        }
      }));
      Alert.alert('Success', `Unsplash API working! Found ${images.length} images.`);
    } catch (error) {
      console.error('Unsplash API Error:', error);
      setResults(prev => ({
        ...prev,
        unsplash: {
          success: false,
          message: error.message,
          data: null
        },
        errors: [...prev.errors, `Unsplash: ${error.message}`]
      }));
      Alert.alert('Unsplash Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  const testBothApis = async () => {
    setLoading(true);
    setResults({ googlePlaces: null, unsplash: null, errors: [] });
    try {
      await Promise.all([
        testGooglePlacesApi(),
        testUnsplashApi()
      ]);
    } catch (error) {
      console.error('Error testing APIs:', error);
    } finally {
      setLoading(false);
    }
  };
  const clearResults = () => {
    setResults({ googlePlaces: null, unsplash: null, errors: [] });
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Integration Test</Text>
      <Text style={styles.subtitle}>Test your Google Places and Unsplash API keys</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={testGooglePlacesApi}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Google Places API</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.unsplashButton]}
          onPress={testUnsplashApi}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Unsplash API</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.testAllButton]}
          onPress={testBothApis}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Both APIs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Testing APIs...</Text>
        </View>
      )}
      {}
      {(results.googlePlaces || results.unsplash) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results</Text>
          {results.googlePlaces && (
            <View style={styles.resultItem}>
              <Text style={styles.resultHeader}>Google Places API</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: results.googlePlaces.success ? '#4CAF50' : '#F44336' }
              ]}>
                <Text style={styles.statusText}>
                  {results.googlePlaces.success ? 'SUCCESS' : 'FAILED'}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{results.googlePlaces.message}</Text>
              {results.googlePlaces.success && results.googlePlaces.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataTitle}>Sample Results:</Text>
                  {results.googlePlaces.data.map((place, index) => (
                    <Text key={index} style={styles.dataItem}>
                      • {place.name} - Rating: {place.rating || 'N/A'}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          {results.unsplash && (
            <View style={styles.resultItem}>
              <Text style={styles.resultHeader}>Unsplash API</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: results.unsplash.success ? '#4CAF50' : '#F44336' }
              ]}>
                <Text style={styles.statusText}>
                  {results.unsplash.success ? 'SUCCESS' : 'FAILED'}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{results.unsplash.message}</Text>
              {results.unsplash.success && results.unsplash.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataTitle}>Sample Images:</Text>
                  {results.unsplash.data.map((image, index) => (
                    <Text key={index} style={styles.dataItem}>
                      • {image.alt} by {image.photographer}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          {results.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>Errors:</Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorItem}>• {error}</Text>
              ))}
            </View>
          )}
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>API Status Information:</Text>
        <Text style={styles.infoText}>
          • Google Places API: Tests nearby store search functionality
        </Text>
        <Text style={styles.infoText}>
          • Unsplash API: Tests image fetching for products and stores
        </Text>
        <Text style={styles.infoText}>
          • Both APIs are required for full app functionality
        </Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  unsplashButton: {
    backgroundColor: '#000000',
  },
  testAllButton: {
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dataItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  errorsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 4,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
});