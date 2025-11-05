import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

export { LocationContext };

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState('Johannesburg, Gauteng');
  const [userLocation, setUserLocation] = useState(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadDefaultAddressForLocation = async () => {
      if (user?.uid) {
        try {
          const cachedAddress = await AsyncStorage.getItem(`default_address_${user.uid}`);
          if (cachedAddress) {
            const address = JSON.parse(cachedAddress);

            const formattedAddress = [address.street, address.city, address.province].filter(Boolean).join(', ');
            setSelectedLocation(formattedAddress);

            if (address.latitude && address.longitude) {
              setUserLocation({ latitude: address.latitude, longitude: address.longitude });
            }
          }
        } catch (error) {
          console.error('Error loading default address for location:', error);
        }
      } else {

        setSelectedLocation('Johannesburg, Gauteng');
      }
    };

    loadDefaultAddressForLocation();
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;

    const initLocation = async () => {
      try {

        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) {
          if (mountedRef.current) {
            setUserLocation({ latitude: last.coords.latitude, longitude: last.coords.longitude });
          }
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          if (pos?.coords && mountedRef.current) {
            setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          }
        }
      } catch (err) {
        console.warn('LocationProvider init error:', err);
      }
    };

    initLocation();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateLocation = (location) => {
    setSelectedLocation(location);
  };

  const updateUserLocation = (coordinates) => {
    setUserLocation(coordinates);
  };

  const value = {
    selectedLocation,
    userLocation,
    updateLocation,
    updateUserLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
