import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, orderBy, limit, setDoc } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// Static import to avoid Metro dynamic import resolution issues
import { mockStores, getMockStores, getStoreProducts } from '../data/mockData';

// PRODUCTION CONFIG (BOSS'S FIREBASE)
const productionConfig = {
  apiKey: "AIzaSyDsxqzXw5XEifHbelAYHqdkMUPoZVvg6ro",
  authDomain: "mzansi-react.firebaseapp.com",
  projectId: "mzansi-react",
  storageBucket: "mzansi-react-storage",
  messagingSenderId: "239626456292",
  appId: "1:239626456292:web:7bdfeebb778f7cededf0f1"
};

// TEST CONFIG (YOUR FIREBASE) - Your new test project
const testConfig = {
  apiKey: "AIzaSyC0BGeREyZQNvLDAT4CW4avAqFSkUK6Pys",
  authDomain: "project-9944b.firebaseapp.com",
  projectId: "project-9944b",
  storageBucket: "project-9944b.firebasestorage.app",
  messagingSenderId: "23598729763",
  appId: "1:23598729763:web:0e0ff5f511fe35535d3f96"
};

// Switch between configs easily
const firebaseConfig = testConfig; // ✅ Currently using TEST database (project-9944b)
// const firebaseConfig = productionConfig; // Switch to this for production (mzansi-react)

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const storage = getStorage(app);

// Track whether we've already warned about Firestore permission issues to avoid log spam
let _warnedFirestorePermissions = false;

// Firebase Services
export const firebaseService = {
  // STORES
  stores: {
    getAll: async () => {
      try {
        const storesRef = collection(db, 'stores');
        const snapshot = await getDocs(storesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        // If permission error, warn once and fallback to mock data to keep the app usable in dev
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock stores.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching stores:', error);
        }
        // Fallback to mock data
        return mockStores;
      }
    },

    getByLocation: async (location) => {
      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('location', '==', location));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock stores by location.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching stores by location:', error);
        }
        // Fallback to mock data filtered by location
        return getMockStores(location);
      }
    },

    getById: async (storeId) => {
      try {
        const storeRef = doc(db, 'stores', storeId);
        const snapshot = await getDoc(storeRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        console.error('Error fetching store:', error);
        // Fallback to mock data
        return mockStores.find(s => s.id === storeId) || null;
      }
    },

    create: async (storeData) => {
      try {
        const storesRef = collection(db, 'stores');
        const docRef = await addDoc(storesRef, {
          ...storeData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating store:', error);
        throw error;
      }
    }
  },

  // PRODUCTS
  products: {
    getByStore: async (storeId) => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('storeId', '==', storeId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock products.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching products:', error);
        }
        // Fallback to mock data
        return getStoreProducts(storeId);
      }
    },

    getById: async (productId) => {
      try {
        const productRef = doc(db, 'products', productId);
        const snapshot = await getDoc(productRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },

    create: async (productData) => {
      try {
        const productsRef = collection(db, 'products');
        const docRef = await addDoc(productsRef, {
          ...productData,
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    }
  },

  // ORDERS
  orders: {
    create: async (orderData) => {
      try {
        // Clean the order data to remove any undefined values
        const cleanedOrderData = JSON.parse(JSON.stringify(orderData, (key, value) => {
          if (value === undefined) {
            console.warn(`Removing undefined field: ${key}`);
            return null;
          }
          return value;
        }));

        // Remove null values
        const finalOrderData = Object.fromEntries(
          Object.entries(cleanedOrderData).filter(([_, value]) => value !== null)
        );

        console.log('Cleaned order data:', finalOrderData);

        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
          ...finalOrderData,
          createdAt: new Date(),
          status: 'pending'
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating order:', error);
        // For prototype, return mock order ID
        return 'order_' + Date.now();
      }
    },

    getByUser: async (userId) => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
          if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
            console.warn('Firestore permission error detected. Falling back to empty orders.');
            _warnedFirestorePermissions = true;
          } else if (!/permission/i.test(error.message)) {
            console.error('Error fetching user orders:', error);
          }
        return [];
      }
    },

    updateStatus: async (orderId, status) => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { 
          status,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating order status:', error);
        return false;
      }
    }
  },

  // USERS
  users: {
    create: async (userId, userData) => {
      try {
        const userRef = doc(db, 'users', userId);
        await addDoc(userRef, {
          ...userData,
          createdAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error creating user:', error);
        return false;
      }
    },

    get: async (userId) => {
      try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching user. Falling back to null user.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching user:', error);
        }
        return null;
      }
    },

    update: async (userId, userData) => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          ...userData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating user:', error);
        return false;
      }
    }
  },

  // ADDRESSES
  addresses: {
    getByUser: async (userId) => {
      try {
        const addressesRef = collection(db, 'addresses');
        const q = query(addressesRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching addresses. Falling back to empty list.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching addresses:', error);
        }
        return [];
      }
    },

    create: async (userId, addressData) => {
      try {
        const addressesRef = collection(db, 'addresses');
        const docRef = await addDoc(addressesRef, {
          ...addressData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating address:', error);
        throw error;
      }
    },

    update: async (addressId, addressData) => {
      try {
        const addressRef = doc(db, 'addresses', addressId);
        await updateDoc(addressRef, {
          ...addressData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating address:', error);
        throw error;
      }
    },

    delete: async (addressId) => {
      try {
        const addressRef = doc(db, 'addresses', addressId);
        await deleteDoc(addressRef);
        return true;
      } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    }
  },

  // PAYMENT METHODS
  paymentMethods: {
    getByUser: async (userId) => {
      try {
        const paymentMethodsRef = collection(db, 'paymentMethods');
        const q = query(paymentMethodsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching payment methods. Falling back to empty list.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching payment methods:', error);
        }
        return [];
      }
    },

    create: async (userId, paymentMethodData) => {
      try {
        const paymentMethodsRef = collection(db, 'paymentMethods');
        // Don't store sensitive data like CVV in production
        const { cvv, ...safeData } = paymentMethodData;
        const docRef = await addDoc(paymentMethodsRef, {
          ...safeData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating payment method:', error);
        throw error;
      }
    },

    update: async (paymentMethodId, paymentMethodData) => {
      try {
        const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
        // Don't store sensitive data like CVV in production
        const { cvv, ...safeData } = paymentMethodData;
        await updateDoc(paymentMethodRef, {
          ...safeData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating payment method:', error);
        throw error;
      }
    },

    delete: async (paymentMethodId) => {
      try {
        const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
        await deleteDoc(paymentMethodRef);
        return true;
      } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
      }
    }
  },

  // CHAT SYSTEM
  chat: {
    sendMessage: async (messageData) => {
      try {
        const messagesRef = collection(db, 'messages');
        const docRef = await addDoc(messagesRef, {
          ...messageData,
          timestamp: new Date(),
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },

    getMessages: async (orderId) => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('orderId', '==', orderId)
        );
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort messages by timestamp on the client side
        return messages.sort((a, b) => {
          const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return timeA - timeB;
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },

    listenToMessages: (orderId, callback) => {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('orderId', '==', orderId)
      );
      
      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort messages by timestamp on the client side
        const sortedMessages = messages.sort((a, b) => {
          const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return timeA - timeB;
        });
        
        callback(sortedMessages);
      });
    },

    markAsRead: async (messageId) => {
      try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, { isRead: true });
        return true;
      } catch (error) {
        console.error('Error marking message as read:', error);
        return false;
      }
    }
  },

  // DRIVER SERVICES
  drivers: {
    create: async (driverId, driverData) => {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        await setDoc(driverRef, {
          ...driverData,
          userType: 'driver',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error creating driver:', error);
        return false;
      }
    },

    get: async (driverId) => {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        const snapshot = await getDoc(driverRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        console.error('Error fetching driver:', error);
        return null;
      }
    },

    update: async (driverId, driverData) => {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        await updateDoc(driverRef, {
          ...driverData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating driver:', error);
        return false;
      }
    },

    updateLocation: async (driverId, location) => {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        await updateDoc(driverRef, {
          currentLocation: location,
          lastLocationUpdate: new Date(),
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating driver location:', error);
        return false;
      }
    },

    setAvailability: async (driverId, isAvailable) => {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        await updateDoc(driverRef, {
          isAvailable,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating driver availability:', error);
        return false;
      }
    }
  },

  // ENHANCED ORDERS SERVICE
  orders: {
    create: async (orderData) => {
      try {
        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
          ...orderData,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating order:', error);
        // For prototype, return mock order ID
        return 'order_' + Date.now();
      }
    },

    getAll: async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
      }
    },

    getByUser: async (userId) => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort orders by creation date on the client side
        return orders.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.orderDate);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.orderDate);
          return timeB - timeA; // Most recent first
        });
      } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }
    },

    getByDriver: async (driverId) => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('driverId', '==', driverId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching driver orders:', error);
        return [];
      }
    },

    getPending: async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('status', '==', 'pending'),
          orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        return [];
      }
    },

    assignDriver: async (orderId, driverId) => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          driverId,
          status: 'assigned',
          assignedAt: new Date(),
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error assigning driver:', error);
        return false;
      }
    },

    updateStatus: async (orderId, status) => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const updateData = {
          status,
          updatedAt: new Date()
        };

        // Add specific timestamps based on status
        switch (status) {
          case 'accepted':
            updateData.acceptedAt = new Date();
            break;
          case 'in_transit':
            updateData.startedAt = new Date();
            break;
          case 'delivered':
            updateData.deliveredAt = new Date();
            break;
          case 'rejected':
            updateData.rejectedAt = new Date();
            break;
        }

        await updateDoc(orderRef, updateData);
        return true;
      } catch (error) {
        console.error('Error updating order status:', error);
        return false;
      }
    }
  },

  // STOCK MANAGEMENT
  stock: {
    updateProductStock: async (productId, newStock) => {
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          inStock: newStock > 0,
          stockQuantity: newStock,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating product stock:', error);
        return false;
      }
    },

    getLowStockProducts: async (storeId, threshold = 5) => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('storeId', '==', storeId),
          where('stockQuantity', '<=', threshold)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching low stock products:', error);
        return [];
      }
    },

    getOutOfStockProducts: async (storeId) => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('storeId', '==', storeId),
          where('inStock', '==', false)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching out of stock products:', error);
        return [];
      }
    }
  }
};