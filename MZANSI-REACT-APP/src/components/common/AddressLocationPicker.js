import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { googlePlacesService } from '../../services/googlePlacesApi';
import * as Location from 'expo-location';
import { useLocation } from '../../context/LocationContext';
import { COLORS } from '../../styles/colors';

const AddressLocationPicker = forwardRef(({ onAddressSelect, currentAddress, pickerSignal }, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const debounceTimer = useRef(null);
  const { userLocation } = useLocation();
  const [locationBias, setLocationBias] = useState(userLocation || null);

  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for addresses with query:', query);

      let bias = locationBias;
      if (!bias) {

        try {
          const last = await Location.getLastKnownPositionAsync();
          if (last && last.coords) {
            bias = { latitude: last.coords.latitude, longitude: last.coords.longitude };
            setLocationBias(bias);
          }
        } catch (e) {

        }
      }

      const results = await googlePlacesService.autocomplete(query, bias);
      console.log('Search results:', results);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Address search error:', error);
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
        searchAddresses(text);
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
      handleAddressSelect(searchResults[0]);
    } else {
      Alert.alert('No addresses found', 'Try a different address.');
    }
  };

  const parseAddress = (formattedAddress) => {

    const postalMatch = formattedAddress.match(/\b(\d{4,6})\b/);
    let postalCode = postalMatch ? postalMatch[1] : '';

    const parts = formattedAddress.split(',').map(part => part.trim());
    let street = '';
    let city = '';
    let province = '';

    const provinces = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (provinces.some(pr => pr.toLowerCase() === p.toLowerCase())) {
        province = p;

        parts.splice(i, 1);
        break;
      }
    }

    if (!postalCode && parts.length > 0) {
      const last = parts[parts.length - 1];
      const pc = last.match(/\b(\d{4,6})\b/);
      if (pc) {
        postalCode = pc[1];

        parts[parts.length - 1] = last.replace(pc[0], '').trim();
      }
    }

    if (parts.length >= 2) {
      street = parts.slice(0, parts.length - 2 + 1).join(', ');
      city = parts[parts.length - 2] || '';
      if (!province && parts.length >= 1) province = parts[parts.length - 1] || province;
    } else if (parts.length === 1) {
      street = parts[0];
    }

    return { street, city, province, postalCode };
  };

  const parseAddressComponents = (components) => {
    if (!components || !Array.isArray(components)) return null;
    const find = (type) => {
      const c = components.find(comp => comp.types && comp.types.includes(type));
      return c ? c.long_name : null;
    };

    const streetNumber = find('street_number');
    const route = find('route');
    const sublocality = find('sublocality') || find('sublocality_level_1');
    const locality = find('locality') || find('postal_town') || sublocality;
    const province = find('administrative_area_level_1');
    const postalCode = find('postal_code');

    const streetParts = [];
    if (streetNumber) streetParts.push(streetNumber);
    if (route) streetParts.push(route);
    if (sublocality && !streetParts.includes(sublocality)) streetParts.push(sublocality);

    const street = streetParts.join(' ').trim();

    return {
      street: street || null,
      city: locality || null,
      province: province || null,
      postalCode: postalCode || ''
    };
  };

  const handleAddressSelect = async (item) => {
    try {
      setIsFetchingDetails(true);

      const placeDetails = await googlePlacesService.getPlaceDetails(item.id);
      if (placeDetails) {
        let parsedAddress = null;
        if (placeDetails.addressComponents) {
          parsedAddress = parseAddressComponents(placeDetails.addressComponents);
        }

        if (!parsedAddress) {
          parsedAddress = parseAddress(placeDetails.address);
        }

        const addressData = {
          street: parsedAddress?.street || '',
          city: parsedAddress?.city || '',
          province: parsedAddress?.province || '',
          postalCode: parsedAddress?.postalCode || '',
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          formattedAddress: placeDetails.address,
          placeName: placeDetails.name,
        };
        onAddressSelect(addressData);
        setModalVisible(false);

        setSearchQuery(placeDetails.address || placeDetails.name);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      Alert.alert('Error', 'Unable to get address details. Please try again.');
    } finally {
      setIsFetchingDetails(false);
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
        const parsedAddress = parseAddress(currentAddress);
        const addressData = {
          street: parsedAddress.street,
          city: parsedAddress.city,
          province: parsedAddress.province,
          postalCode: parsedAddress.postalCode,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          formattedAddress: currentAddress,
        };
        onAddressSelect(addressData);
        setModalVisible(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    }
  };

  const handleAddressPress = () => {
    ensureLocationBiasAndOpen();
  };

  const ensureLocationBiasAndOpen = async () => {

    if (locationBias) {
      setModalVisible(true);
      return;
    }

    try {

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        if (pos && pos.coords) {
          const bias = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setLocationBias(bias);
        }
      }
    } catch (e) {

      console.warn('Error obtaining location bias for picker:', e);
    } finally {
      setModalVisible(true);
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => setModalVisible(true),
    close: () => setModalVisible(false),
  }), []);

  React.useEffect(() => {
    if (typeof pickerSignal !== 'undefined' && pickerSignal !== null) {
      ensureLocationBiasAndOpen();
    }
  }, [pickerSignal]);
  const renderAddressItem = ({ item }) => {
    const secondary = item.secondaryText || item.description || '';
    return (
      <TouchableOpacity
        style={styles.addressItem}
        onPress={() => {

          const displayName = item.description || (item.mainText + (secondary ? `, ${secondary}` : ''));
          setSearchQuery(displayName);
          handleAddressSelect(item);
        }}
      >
        <View style={styles.addressItemContent}>
          <Ionicons
            name="location"
            size={20}
            color="#666"
          />
          <View style={styles.addressTextContainer}>
            <Text style={styles.mainText}>{item.mainText || item.description}</Text>
            {secondary ? <Text style={styles.secondaryText}>{secondary}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.container} onPress={handleAddressPress}>
        <View style={styles.addressInfo}>
          <Ionicons name="location" size={20} color="#666" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Delivery Address</Text>
            <Text style={styles.address}>{currentAddress || searchQuery || 'Select address'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
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
              <Text style={styles.modalTitle}>Search Address</Text>
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
                placeholder="Enter address..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="words"
                returnKeyType="search"
                onSubmitEditing={handleSearchSubmit}
              />
              {(isSearching || isFetchingDetails) && (
                <ActivityIndicator size="small" color="#666" style={styles.loadingIcon} />
              )}
            </View>

            {isFetchingDetails && (
              <View style={{ padding: 12, alignItems: 'center' }}>
                <Ionicons name="sync" size={18} color="#666" />
                <Text style={{ marginTop: 6, color: '#666' }}>Fetching address details...</Text>
              </View>
            )}

            <FlatList
              data={searchQuery.length >= 3 ? searchResults : []}
              keyExtractor={(item) => item.id}
              renderItem={renderAddressItem}
              style={styles.addressesList}
              showsVerticalScrollIndicator={false}
            />

            {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search" size={24} color="#999" />
                <Text style={styles.emptyStateText}>No addresses found</Text>
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
    </View>
  );
});

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
  addressInfo: {
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
  address: {
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
  addressesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addressItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  secondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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

export default AddressLocationPicker;
