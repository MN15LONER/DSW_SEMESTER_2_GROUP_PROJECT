import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
const AddressMapPreview = ({ address, onEdit }) => {
  if (!address || !address.latitude || !address.longitude) {
    return (
      <View style={styles.noMapContainer}>
        <Ionicons name="map-outline" size={48} color="#ccc" />
        <Text style={styles.noMapText}>No location selected</Text>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>Select Location</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  const region = {
    latitude: address.latitude,
    longitude: address.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Preview</Text>
        {onEdit && (
          <TouchableOpacity style={styles.editButtonSmall} onPress={onEdit}>
            <Ionicons name="pencil" size={16} color={COLORS.primary} />
            <Text style={styles.editButtonTextSmall}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      {}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: address.latitude,
              longitude: address.longitude,
            }}
            title="Delivery Address"
            description={address.formattedAddress || `${address.street}, ${address.city}`}
          />
        </MapView>
      </View>
      <View style={styles.addressInfo}>
        <Text style={styles.addressText}>
          {address.formattedAddress || `${address.street}, ${address.city}, ${address.province} ${address.postalCode}`}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonTextSmall: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 16,
    marginTop: 0,
  },
  map: {
    flex: 1,
  },
  addressInfo: {
    padding: 16,
    paddingTop: 0,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  noMapContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noMapText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonLarge: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  editButtonTextLarge: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
export default AddressMapPreview;