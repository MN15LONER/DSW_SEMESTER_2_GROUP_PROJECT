import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

export default function StoreMapView({ stores, onStoreSelect, selectedStore, directionsToStore, onClearDirections }) {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041, // Johannesburg default
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby stores.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);
      setMapRegion({
        ...userCoords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location. Using default location.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getStoreMarkerColor = (store) => {
    if (selectedStore && selectedStore.id === store.id) {
      return COLORS.primary;
    }
    return store.isOpen ? '#4CAF50' : '#F44336';
  };

  const handleMarkerPress = (store) => {
    if (onStoreSelect) {
      onStoreSelect(store);
    }
  };

  const [routeCoords, setRouteCoords] = useState(null);

  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    const coords = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLon = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLon;

      coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return coords;
  };

  useEffect(() => {
    const fetchDirections = async () => {
      if (!directionsToStore || !userLocation) return;
      try {
        const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!key) {
          console.warn('Google Maps API key not configured in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
          return;
        }

        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const destination = `${directionsToStore.latitude},${directionsToStore.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${key}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.routes && json.routes.length > 0) {
          const encoded = json.routes[0].overview_polyline?.points;
          const coords = decodePolyline(encoded);
          setRouteCoords(coords);

          const markers = [userLocation, { latitude: directionsToStore.latitude, longitude: directionsToStore.longitude }];
          if (coords && coords.length > 0) {
            const latitudes = coords.map(c => c.latitude).concat(markers.map(m => m.latitude));
            const longitudes = coords.map(c => c.longitude).concat(markers.map(m => m.longitude));
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);
            const midLat = (minLat + maxLat) / 2;
            const midLng = (minLng + maxLng) / 2;
            setMapRegion({
              latitude: midLat,
              longitude: midLng,
              latitudeDelta: (maxLat - minLat) * 1.5 || 0.0922,
              longitudeDelta: (maxLng - minLng) * 1.5 || 0.0421,
            });
          }
        } else {
          console.warn('No routes found in Google Directions response', json);
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };

    fetchDirections();
  }, [directionsToStore, userLocation]);

  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor={COLORS.secondary}
          />
        )}

        {}
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description={`${store.category} • ${store.isOpen ? 'Open' : 'Closed'}`}
            pinColor={getStoreMarkerColor(store)}
            onPress={() => handleMarkerPress(store)}
          >
            <View style={[
              styles.customMarker,
              { backgroundColor: getStoreMarkerColor(store) }
            ]}>
              <Ionicons 
                name="storefront" 
                size={20} 
                color="white" 
              />
            </View>
          </Marker>
        ))}
          {}
          {routeCoords && routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.primary}
              strokeWidth={4}
            />
          )}
      </MapView>

      {}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        {routeCoords && (
          <TouchableOpacity
            style={[styles.controlButton, { marginTop: 0 }]}
            onPress={() => {
              setRouteCoords(null);
              if (onClearDirections) onClearDirections();
            }}
          >
            <Ionicons name="close" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Open</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Closed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
});
