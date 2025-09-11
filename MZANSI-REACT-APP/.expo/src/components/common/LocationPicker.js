import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationContext } from '../../context/LocationContext';
import { mockLocations } from '../../data/mockData';

const LocationPicker = () => {
  const { selectedLocation, setSelectedLocation } = useContext(LocationContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = mockLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleLocationPress = () => {
    setModalVisible(true);
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        selectedLocation === item && styles.selectedLocationItem
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationItemContent}>
        <Ionicons 
          name="location" 
          size={20} 
          color={selectedLocation === item ? '#007AFF' : '#666'} 
        />
        <Text style={[
          styles.locationItemText,
          selectedLocation === item && styles.selectedLocationText
        ]}>
          {item}
        </Text>
      </View>
      {selectedLocation === item && (
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
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item}
              renderItem={renderLocationItem}
              style={styles.locationsList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() => {
                // TODO: Implement GPS location detection
                handleLocationSelect('Current Location');
              }}
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
});

export default LocationPicker;