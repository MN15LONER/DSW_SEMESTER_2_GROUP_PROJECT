import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { imageCache, getOptimizedImageUrl } from '../services/unsplashApi';
import { getImageForProduct } from '../utils/imageHelper';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(
        item => item.id === action.payload.id && item.storeId === action.payload.storeId
      );
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id && item.storeId === action.payload.storeId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
        };
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(
          item => !(item.id === action.payload.id && item.storeId === action.payload.storeId)
        ),
      };
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cartItems: state.cartItems.filter(
            item => !(item.id === action.payload.id && item.storeId === action.payload.storeId)
          ),
        };
      }
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id && item.storeId === action.payload.storeId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };
    
    case 'LOAD_CART':
      return {
        ...state,
        cartItems: action.payload || [],
      };
    
    default:
      return state;
  }
};

const initialState = {
  cartItems: [],
};

const CART_STORAGE_KEY = '@mzansi_cart';

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    saveCartToStorage();
  }, [state.cartItems]);

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = (item) => {
    // ensure a stable image URL is attached to cart item
    let image = item.image;
    try {
      if (!image) {
        const key = `product:${item.name}::${item.category || ''}`;
        if (imageCache && imageCache.has(key)) {
          const cached = imageCache.get(key);
          const raw = cached && (cached.url || cached.downloadUrl || cached.small || cached.thumb);
          image = getOptimizedImageUrl(raw, 600, 600, 85) || raw;
        }
      }
    } catch (e) {
      // ignore cache errors
    }

    if (!image) {
      try {
        image = getImageForProduct(item);
      } catch (e) {
        image = item.image || null;
      }
    }

    dispatch({ type: 'ADD_TO_CART', payload: { ...item, image } });
  };

  const removeFromCart = (id, storeId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, storeId } });
  };

  const updateQuantity = (id, storeId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, storeId, quantity } });
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  };

  const getCartTotal = () => {
    return state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getStoreGroups = () => {
    const groups = {};
    state.cartItems.forEach(item => {
      if (!groups[item.storeId]) {
        groups[item.storeId] = {
          storeName: item.storeName,
          items: [],
          subtotal: 0,
        };
      }
      groups[item.storeId].items.push(item);
      groups[item.storeId].subtotal += item.price * item.quantity;
    });
    return groups;
  };

  const value = {
    cartItems: state.cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getStoreGroups,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};