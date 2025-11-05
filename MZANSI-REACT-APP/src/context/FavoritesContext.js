import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const FavoritesContext = createContext();
const FAVORITES_STORAGE_KEY = '@mzansi_favorites';
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_FAVORITES':
      return {
        ...state,
        favorites: action.payload
      };
    case 'ADD_FAVORITE':
      const newFavorites = [...state.favorites, action.payload];
      return {
        ...state,
        favorites: newFavorites
      };
    case 'REMOVE_FAVORITE':
      const filteredFavorites = state.favorites.filter(
        item => item.id !== action.payload.id
      );
      return {
        ...state,
        favorites: filteredFavorites
      };
    case 'CLEAR_FAVORITES':
      return {
        ...state,
        favorites: []
      };
    default:
      return state;
  }
};
const initialState = {
  favorites: []
};
export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);
  useEffect(() => {
    saveFavoritesToStorage();
  }, [state.favorites]);
  const loadFavoritesFromStorage = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: favorites });
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
  };
  const saveFavoritesToStorage = async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  };
  const addToFavorites = (product) => {
    const favoriteItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeId,
      storeName: product.storeName,
      category: product.category,
      addedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_FAVORITE', payload: favoriteItem });
  };
  const removeFromFavorites = (product) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: product });
  };
  const toggleFavorite = (product) => {
    const isFavorite = state.favorites.some(item => item.id === product.id);
    if (isFavorite) {
      removeFromFavorites(product);
    } else {
      addToFavorites(product);
    }
  };
  const isFavorite = (productId) => {
    return state.favorites.some(item => item.id === productId);
  };
  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };
  const getFavoritesByStore = (storeId) => {
    return state.favorites.filter(item => item.storeId === storeId);
  };
  const value = {
    favorites: state.favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoritesByStore
  };
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
export { FavoritesContext };