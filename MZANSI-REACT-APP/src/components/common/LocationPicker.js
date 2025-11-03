import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../context/LocationContext';
import { mockLocations } from '../../data/mockData';
import { googlePlacesService } from '../../services/googlePlacesApi';
import * as Location from 'expo-location';

const LocationPicker = () => {
  const { selectedLocation, updateLocation, updateUserLocation } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const debounceTimer = useRef(null);

  const filteredLocations = mockLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use autocomplete for live Google-style suggestions
      const predictions = await googlePlacesService.autocomplete(query);
      // Map predictions to a uniform shape (id, mainText, secondaryText, description)
      setSearchResults(predictions.slice(0, 10)); // Limit to 10
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (text.length >= 3) {
      debounceTimer.current = setTimeout(() => {
        searchLocations(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.length < 3) {
      return;
    }
    if (searchResults && searchResults.length > 0) {
      handleLocationSelect(searchResults[0]);
    } else {
      Alert.alert('No locations found', 'Try a different place name.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const currentAddress = `${address[0].street || ''} ${address[0].city || ''}, ${address[0].region || ''}`.trim();
        updateLocation(currentAddress);
        updateUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        setModalVisible(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    }
  };

  const handleLocationSelect = async (item) => {
    try {
      if (typeof item === 'string') {
        updateLocation(item);
        updateUserLocation(null);
        setModalVisible(false);
        setSearchQuery('');
        return;
      }

      // If item looks like a place prediction (has id), fetch full details
      if (item && item.id) {
        setIsFetchingDetails(true);
        const placeDetails = await googlePlacesService.getPlaceDetails(item.id);
        if (placeDetails) {
          updateLocation(placeDetails.address || placeDetails.name);
          updateUserLocation({ latitude: placeDetails.latitude, longitude: placeDetails.longitude });
        } else {
          // Fallback to description
          updateLocation(item.description || item.mainText || item.name);
          updateUserLocation(null);
        }
        setModalVisible(false);
        setSearchQuery('');
        return;
      }

      // Fallback for other shapes
      if (item && item.latitude && item.longitude) {
        updateLocation(item.address || item.name);
        updateUserLocation({ latitude: item.latitude, longitude: item.longitude });
        setModalVisible(false);
        setSearchQuery('');
        return;
      }
    } catch (error) {
      console.error('Error selecting location:', error);
      Alert.alert('Error', 'Unable to select location. Please try again.');
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleLocationPress = () => {
    setModalVisible(true);
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        (selectedLocation === (typeof item === 'string' ? item : (item.address || item.name))) && styles.selectedLocationItem
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationItemContent}>
        <Ionicons 
          name="location" 
          size={20} 
          color={(selectedLocation === (typeof item === 'string' ? item : (item.address || item.name))) ? '#007AFF' : '#666'} 
        />
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.locationItemText,
            (selectedLocation === (typeof item === 'string' ? item : (item.address || item.name))) && styles.selectedLocationText
          ]}>
            {typeof item === 'string' ? item : (item.mainText || item.address || item.name || item.description)}
          </Text>
          {typeof item !== 'string' && (item.secondaryText || item.description) ? (
            <Text style={styles.secondaryText}>{item.secondaryText || item.description}</Text>
          ) : null}
        </View>
      </View>
      {(selectedLocation === (typeof item === 'string' ? item : (item.address || item.name))) && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handleLocationPress}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Deliver to</Text>
            <Text style={styles.location}>{selectedLocation || 'Select Location'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search locations..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={handleSearchSubmit}
              />
              {(isSearching || isFetchingDetails) && (
                <ActivityIndicator size="small" color="#666" style={styles.loadingIcon} />
              )}
            </View>

            <FlatList
              data={searchQuery.length >= 3 ? searchResults : filteredLocations}
              keyExtractor={(item, index) => typeof item === 'string' ? `${item}-${index}` : item.id}
              renderItem={renderLocationItem}
              style={styles.locationsList}
              showsVerticalScrollIndicator={false}
            />

            {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search" size={24} color="#999" />
                <Text style={styles.emptyStateText}>No locations found</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="navigate" size={20} color="#007AFF" />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  locationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLocationItem: {
    backgroundColor: '#f0f8ff',
  },
  locationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  secondaryText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    marginTop: 4,
  },
  selectedLocationText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  currentLocationText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyStateText: {
    marginTop: 8,
    color: '#999',
  },
});

export default LocationPicker;