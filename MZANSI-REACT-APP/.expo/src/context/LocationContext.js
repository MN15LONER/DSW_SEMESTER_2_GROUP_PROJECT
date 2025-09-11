import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState('Johannesburg, Gauteng');
  const [userLocation, setUserLocation] = useState(null);

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