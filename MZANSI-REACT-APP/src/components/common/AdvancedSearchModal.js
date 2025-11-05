import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { googlePlacesService } from '../../services/googlePlacesApi';
import { storeAvailabilityService } from '../../services/storeAvailabilityService';
import { COLORS } from '../../styles/colors';

export default function AdvancedSearchModal({ 
  visible, 
  onClose, 
  onSearch, 
  userLocation,
  initialFilters = {} 
}) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [category, setCategory] = useState(initialFilters.category || 'all');
  const [radius, setRadius] = useState(initialFilters.radius || 10);
  const [minRating, setMinRating] = useState(initialFilters.minRating || 0);
  const [openOnly, setOpenOnly] = useState(initialFilters.openOnly || false);
  const [deliveryOnly, setDeliveryOnly] = useState(initialFilters.deliveryOnly || false);
  const [hasPromotions, setHasPromotions] = useState(initialFilters.hasPromotions || false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'distance');
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || 'all');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Supermarket', value: 'supermarket' },
    { label: 'Pharmacy', value: 'pharmacy' },
    { label: 'Clothing Store', value: 'clothing' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Gas Station', value: 'gas_station' },
    { label: 'Bank/ATM', value: 'bank' },
  ];

  const sortOptions = [
    { label: 'Distance', value: 'distance' },
    { label: 'Rating', value: 'rating' },
    { label: 'Name', value: 'name' },
    { label: 'Newest', value: 'newest' },
    { label: 'Most Reviews', value: 'reviews' },
  ];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Budget (R)', value: 'budget' },
    { label: 'Mid-range (RR)', value: 'mid' },
    { label: 'Premium (RRR)', value: 'premium' },
    { label: 'Luxury (RRRR)', value: 'luxury' },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      const debounceTimer = setTimeout(() => {
        fetchSearchSuggestions();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const fetchSearchSuggestions = async () => {
    try {
      const suggestions = await googlePlacesService.autocomplete(searchQuery, userLocation);
      setSearchSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      const filters = {
        query: searchQuery,
        category,
        radius: radius * 1000, // Convert km to meters
        minRating,
        openOnly,
        deliveryOnly,
        hasPromotions,
        sortBy,
        priceRange,
        userLocation
      };

      let results = [];

      if (searchQuery.trim()) {

        results = await googlePlacesService.searchPlaces(searchQuery, userLocation, radius * 1000);
      } else if (category !== 'all') {

        results = await googlePlacesService.findStoresByCategory(category, userLocation, radius * 1000);
      } else {

        results = await googlePlacesService.findNearbyStores(userLocation, radius * 1000);
      }

      let filteredResults = results;

      if (minRating > 0) {
        filteredResults = filteredResults.filter(store => store.rating >= minRating);
      }

      if (openOnly) {
        filteredResults = filteredResults.filter(store => store.isOpen);
      }

      if (deliveryOnly) {

        const deliveryChecks = await Promise.all(
          filteredResults.map(async (store) => {
            try {
              const availability = await storeAvailabilityService.getStoreAvailability(store.id);
              return availability.deliveryAvailable;
            } catch (error) {
              return true; // Default to available if check fails
            }
          })
        );
        filteredResults = filteredResults.filter((store, index) => deliveryChecks[index]);
      }

      if (hasPromotions) {
        filteredResults = filteredResults.filter(store => 
          store.promotions && store.promotions.length > 0
        );
      }

      if (priceRange !== 'all') {
        const priceMapping = {
          'budget': [0, 1],
          'mid': [2],
          'premium': [3],
          'luxury': [4]
        };
        const allowedPriceLevels = priceMapping[priceRange] || [0, 1, 2, 3, 4];
        filteredResults = filteredResults.filter(store => 
          allowedPriceLevels.includes(store.priceLevel || 0)
        );
      }

      filteredResults = sortResults(filteredResults, sortBy, userLocation);

      onSearch(filteredResults, filters);
      onClose();
    } catch (error) {
      console.error('Error performing search:', error);
      Alert.alert('Search Error', 'Unable to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sortResults = (results, sortBy, userLocation) => {
    switch (sortBy) {
      case 'distance':
        return results.sort((a, b) => {
          const distanceA = googlePlacesService.calculateDistance(
            userLocation.latitude, userLocation.longitude, a.latitude, a.longitude
          );
          const distanceB = googlePlacesService.calculateDistance(
            userLocation.latitude, userLocation.longitude, b.latitude, b.longitude
          );
          return distanceA - distanceB;
        });
      case 'rating':
        return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return results.sort((a, b) => a.name.localeCompare(b.name));
      case 'reviews':
        return results.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      default:
        return results;
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setRadius(10);
    setMinRating(0);
    setOpenOnly(false);
    setDeliveryOnly(false);
    setHasPromotions(false);
    setSortBy('distance');
    setPriceRange('all');
    setSearchSuggestions([]);
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.description);
    setSearchSuggestions([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Advanced Search</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Query</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Search for stores, products, or services..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {}
              {searchSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {searchSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(suggestion)}
                    >
                      <Ionicons name="location-outline" size={16} color={COLORS.gray} />
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionMain}>{suggestion.mainText}</Text>
                        <Text style={styles.suggestionSecondary}>{suggestion.secondaryText}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Radius: {radius} km</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                value={radius}
                onValueChange={setRadius}
                step={1}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.lightGray}
                thumbStyle={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1 km</Text>
                <Text style={styles.sliderLabel}>50 km</Text>
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating: {minRating.toFixed(1)} ⭐</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={5}
                value={minRating}
                onValueChange={setMinRating}
                step={0.5}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.lightGray}
                thumbStyle={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Any</Text>
                <Text style={styles.sliderLabel}>5.0</Text>
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filters</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Open Now Only</Text>
                <Switch
                  value={openOnly}
                  onValueChange={setOpenOnly}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={openOnly ? COLORS.white : COLORS.gray}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Delivery Available</Text>
                <Switch
                  value={deliveryOnly}
                  onValueChange={setDeliveryOnly}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={deliveryOnly ? COLORS.white : COLORS.gray}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Has Promotions</Text>
                <Switch
                  value={hasPromotions}
                  onValueChange={setHasPromotions}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={hasPromotions ? COLORS.white : COLORS.gray}
                />
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sortBy}
                  onValueChange={setSortBy}
                  style={styles.picker}
                >
                  {sortOptions.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={priceRange}
                  onValueChange={setPriceRange}
                  style={styles.picker}
                >
                  {priceRanges.map((range) => (
                    <Picker.Item key={range.value} label={range.label} value={range.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          {}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={handleSearch}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>
                {loading ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  suggestions: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    marginLeft: 8,
    flex: 1,
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  suggestionSecondary: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.lightGray,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
